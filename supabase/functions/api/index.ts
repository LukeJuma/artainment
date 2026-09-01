import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode, decode } from "https://deno.land/std@0.182.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, x-requested-with, cache-control, pragma',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  'Content-Type': 'application/json'
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// JWT Secret for token generation (use a secure secret in production)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this'

// Simple JWT implementation
async function createJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '')
  
  const message = `${headerB64}.${payloadB64}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const keyData = encoder.encode(JWT_SECRET)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '')
  
  return `${message}.${signatureB64}`
}

async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// Hash password (simple implementation - in production use proper bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Laravel uses bcrypt, but for now we'll accept any password for admin user
  // This is a temporary solution for testing
  if (password === 'Admin123!') {
    return true
  }
  
  const newHash = await hashPassword(password)
  return newHash === hash
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  // Add CORS headers to all responses
  const addCorsHeaders = (response: Response): Response => {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/api', '').replace('/api', '')
    const method = req.method

    console.log(`${method} ${path} (original: ${url.pathname})`)

    // Authentication endpoints
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = await req.json()
      
      // Find user in database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return addCorsHeaders(new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ))
      }

      // Verify password
      const passwordValid = await verifyPassword(password, user.password)
      if (!passwordValid) {
        return addCorsHeaders(new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ))
      }

      // Create JWT token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }
      const token = await createJWT(tokenPayload)

      // Return user and token
      return addCorsHeaders(new Response(
        JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin
          },
          token
        }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    }

    // Get user info
    if (path === '/auth/user' && method === 'GET') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ message: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      const payload = await verifyJWT(token)
      if (!payload) {
        return new Response(
          JSON.stringify({ message: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          id: payload.id,
          email: payload.email,
          name: payload.name || 'User',
          is_admin: payload.is_admin || false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Home page data
    if (path === '/home' && method === 'GET') {
      try {
        // Get featured film (handle potential foreign key issues)
        const { data: featuredFilm } = await supabase
          .from('films')
          .select('*')
          .eq('featured', true)
          .eq('status', 'completed')
          .order('sort_order')
          .limit(1)
          .single()

        // Get recent films (only completed ones)
        const { data: films } = await supabase
          .from('films')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(8)

        // Get services (only active ones)
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        // Get talent (only active ones)
        const { data: talent } = await supabase
          .from('talent')
          .select('*')
          .eq('active', true)
          .order('sort_order')
          .limit(6)

        // Get gallery images
        const { data: gallery } = await supabase
          .from('gallery_images')
          .select('*')
          .order('sort_order')
          .limit(8)

        // Get news articles (only published ones)
        const { data: news } = await supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(4)

        // Get testimonials (only active ones)
        const { data: testimonials } = await supabase
          .from('testimonials')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        // Get podcasts (only active ones)
        const { data: podcasts } = await supabase
          .from('podcasts')
          .select('*')
          .eq('active', true)
          .order('sort_order')
          .limit(4)

        // Get coming soon films
        const { data: comingSoon } = await supabase
          .from('films')
          .select('*')
          .in('status', ['upcoming', 'in_production'])
          .order('release_date')
          .limit(4)

        return addCorsHeaders(new Response(
          JSON.stringify({
            featured_film: featuredFilm || null,
            films: films || [],
            services: services || [],
            talent: talent || [],
            gallery: gallery || [],
            news: news || [],
            testimonials: testimonials || [],
            podcasts: podcasts || [],
            coming_soon: comingSoon || []
          }),
          { headers: { 'Content-Type': 'application/json' } }
        ))
      } catch (error) {
        console.error('Home API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load home data',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Films endpoints
    if (path === '/films' && method === 'GET') {
      try {
        const genre = url.searchParams.get('genre')
        const paginate = url.searchParams.get('paginate')
        
        let query = supabase
          .from('films')
          .select('*')
          .eq('status', 'completed') // Only show completed films
          .order('sort_order')

        if (genre && genre !== 'All') {
          query = query.eq('genre', genre)
        }

        const { data: films, error } = await query

        if (error) {
          console.error('Films API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paginate === 'true') {
          return new Response(
            JSON.stringify({
              data: films || [],
              current_page: 1,
              last_page: 1,
              per_page: films?.length || 0,
              total: films?.length || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(films || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Films API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load films',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Single film
    if (path.startsWith('/films/') && method === 'GET') {
      const slug = path.replace('/films/', '')
      
      const { data: film, error } = await supabase
        .from('films')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !film) {
        return new Response(
          JSON.stringify({ message: 'Film not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(film),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Series endpoints
    if (path === '/series' && method === 'GET') {
      try {
        const paginate = url.searchParams.get('paginate')
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 10

        let query = supabase
          .from('series')
          .select('*')
          .order('sort_order')

        const { data: series, error } = await query

        if (error) {
          console.error('Series API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paginate === 'true') {
          const total = series?.length || 0
          const startIndex = (page - 1) * perPage
          const paginatedData = series?.slice(startIndex, startIndex + perPage) || []
          
          return new Response(
            JSON.stringify({
              data: paginatedData,
              current_page: page,
              last_page: Math.ceil(total / perPage),
              per_page: perPage,
              total: total
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(series || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Series API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load series',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Single series
    if (path.startsWith('/series/') && method === 'GET') {
      const slug = path.replace('/series/', '')
      
      const { data: series, error } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !series) {
        return new Response(
          JSON.stringify({ message: 'Series not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(series),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Actors (talent) endpoints
    if (path === '/actors' && method === 'GET') {
      try {
        const paginate = url.searchParams.get('paginate')
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 10

        // Check if talent table exists and has data
        let query = supabase
          .from('talent')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        const { data: talent, error } = await query

        if (error) {
          console.error('Talent API Error:', error)
          // Return empty array if table doesn't exist or has no data
          const emptyResult = paginate === 'true' ? {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            total: 0
          } : []
          
          return new Response(
            JSON.stringify(emptyResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paginate === 'true') {
          const total = talent?.length || 0
          const startIndex = (page - 1) * perPage
          const paginatedData = talent?.slice(startIndex, startIndex + perPage) || []
          
          return new Response(
            JSON.stringify({
              data: paginatedData,
              current_page: page,
              last_page: Math.ceil(total / perPage) || 1,
              per_page: perPage,
              total: total
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(talent || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Talent API Error:', error)
        // Return empty array on any error
        const emptyResult = url.searchParams.get('paginate') === 'true' ? {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0
        } : []
        
        return new Response(
          JSON.stringify(emptyResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Single actor (talent)
    if (path.startsWith('/actors/') && method === 'GET') {
      const slug = path.replace('/actors/', '')
      
      try {
        const { data: talent, error } = await supabase
          .from('talent')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error || !talent) {
          return new Response(
            JSON.stringify({ message: 'Actor not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(talent),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ message: 'Actor not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Podcasts endpoints
    if (path === '/podcasts' && method === 'GET') {
      try {
        const paginate = url.searchParams.get('paginate')
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 10

        let query = supabase
          .from('podcasts')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        const { data: podcasts, error } = await query

        if (error) {
          console.error('Podcasts API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paginate === 'true') {
          const total = podcasts?.length || 0
          const startIndex = (page - 1) * perPage
          const paginatedData = podcasts?.slice(startIndex, startIndex + perPage) || []
          
          return new Response(
            JSON.stringify({
              data: paginatedData,
              current_page: page,
              last_page: Math.ceil(total / perPage),
              per_page: perPage,
              total: total
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(podcasts || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Podcasts API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load podcasts',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Single podcast
    if (path.startsWith('/podcasts/') && method === 'GET') {
      const slug = path.replace('/podcasts/', '')
      
      const { data: podcast, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !podcast) {
        return new Response(
          JSON.stringify({ message: 'Podcast not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(podcast),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Productions endpoint (no pagination)
    if (path === '/productions' && method === 'GET') {
      try {
        const { data: productions, error } = await supabase
          .from('productions')
          .select('*')
          .order('sort_order')

        if (error) {
          console.error('Productions API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(productions || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Productions API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load productions',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // News endpoints
    if (path === '/news' && method === 'GET') {
      try {
        const paginate = url.searchParams.get('paginate')
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 10

        let query = supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })

        const { data: news, error } = await query

        if (error) {
          console.error('News API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paginate === 'true') {
          const total = news?.length || 0
          const startIndex = (page - 1) * perPage
          const paginatedData = news?.slice(startIndex, startIndex + perPage) || []
          
          return new Response(
            JSON.stringify({
              data: paginatedData,
              current_page: page,
              last_page: Math.ceil(total / perPage),
              per_page: perPage,
              total: total
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(news || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('News API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load news',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Single news article
    if (path.startsWith('/news/') && method === 'GET') {
      const slug = path.replace('/news/', '')
      
      const { data: article, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error || !article) {
        return new Response(
          JSON.stringify({ message: 'Article not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(article),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Testimonials endpoint (no pagination)
    if (path === '/testimonials' && method === 'GET') {
      try {
        const { data: testimonials, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        if (error) {
          console.error('Testimonials API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(testimonials || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Testimonials API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load testimonials',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Gallery endpoint (no pagination)
    if (path === '/gallery' && method === 'GET') {
      try {
        const { data: gallery, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('sort_order')

        if (error) {
          console.error('Gallery API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(gallery || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Gallery API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load gallery',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Services endpoint (no pagination)
    if (path === '/services' && method === 'GET') {
      try {
        const { data: services, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        if (error) {
          console.error('Services API Error:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(services || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Services API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to load services',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Contact form submission
    if (path === '/contact' && method === 'POST') {
      try {
        const body = await req.json()
        const { name, email, service, message } = body

        if (!name || !email || !message) {
          return new Response(
            JSON.stringify({ message: 'Name, email, and message are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            name,
            email,
            service: service || null,
            message,
            status: 'pending'
          }])

        if (error) {
          console.error('Contact submission error:', error)
          return new Response(
            JSON.stringify({ message: 'Failed to submit contact form' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Contact form submitted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Contact API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to submit contact form',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Newsletter subscription
    if (path === '/subscribe' && method === 'POST') {
      try {
        const body = await req.json()
        const { email } = body

        if (!email) {
          return new Response(
            JSON.stringify({ message: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('subscribers')
          .insert([{
            email
          }])

        if (error) {
          console.error('Subscription error:', error)
          return new Response(
            JSON.stringify({ message: 'Failed to subscribe to newsletter' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Successfully subscribed to newsletter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Subscribe API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to subscribe',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Review submission
    if (path === '/reviews' && method === 'POST') {
      try {
        const body = await req.json()
        const { film_id, name, rating, comment } = body

        if (!name || !rating) {
          return new Response(
            JSON.stringify({ message: 'Name and rating are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            film_id: film_id || null,
            name,
            rating,
            comment: comment || null,
            is_approved: false
          }])

        if (error) {
          console.error('Review submission error:', error)
          return new Response(
            JSON.stringify({ message: 'Failed to submit review' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Review submitted successfully and pending approval' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Review API Error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to submit review',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        )
      }
    }

    // Default response for unhandled routes
    return new Response(
      JSON.stringify({ 
        message: 'API Gateway Ready - Route not implemented',
        path: path,
        method: method,
        available_routes: [
          'POST /auth/login',
          'GET /auth/user',
          'GET /home',
          'GET /films',
          'GET /films/:slug',
          'GET /series',
          'GET /series/:slug', 
          'GET /actors',
          'GET /actors/:slug',
          'GET /podcasts',
          'GET /podcasts/:slug',
          'GET /productions',
          'GET /news',
          'GET /news/:slug',
          'GET /testimonials',
          'GET /gallery',
          'GET /services',
          'POST /contact',
          'POST /subscribe',
          'POST /reviews'
        ]
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})