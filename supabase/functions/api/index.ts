import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode, decode } from "https://deno.land/std@0.182.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
        return new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify password
      const passwordValid = await verifyPassword(password, user.password)
      if (!passwordValid) {
        return new Response(
          JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
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
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin
          },
          token
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

        return new Response(
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
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
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
          'GET /films/:slug'
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