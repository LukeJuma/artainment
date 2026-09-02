import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://the-artainment.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, x-requested-with, cache-control, pragma, origin',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
}

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// JWT Secret with secure fallback
const JWT_SECRET = Deno.env.get('JWT_SECRET')
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set')
}

// Secure JWT implementation with proper signature verification
async function createJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '')
  
  const message = `${headerB64}.${payloadB64}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const keyData = encoder.encode(JWT_SECRET)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '')
  
  return `${message}.${signatureB64}`
}

async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerB64, payloadB64, signatureB64] = parts
    const message = `${headerB64}.${payloadB64}`
    
    // Verify signature FIRST before trusting payload
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const keyData = encoder.encode(JWT_SECRET)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    
    const signature = Uint8Array.from(atob(signatureB64 + '='.repeat(signatureB64.length % 4)), c => c.charCodeAt(0))
    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signature, data)
    
    if (!isValid) {
      console.warn('🔒 JWT signature verification failed')
      return null
    }
    
    // Only decode payload AFTER signature is verified
    const payload = JSON.parse(atob(payloadB64))
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.warn('🔒 JWT token expired')
      return null
    }
    
    return payload
  } catch (error) {
    console.warn('🔒 JWT verification error:', error)
    return null
  }
}

// Secure password verification (removed backdoor)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'secure_salt_' + JWT_SECRET.slice(0, 8))
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password)
    return computedHash === hash
  } catch (error) {
    console.warn('🔒 Password verification error:', error)
    return false
  }
}

// Helper function to handle pagination
function paginate(data: any[], page: number, perPage: number = 10) {
  const total = data.length
  const startIndex = (page - 1) * perPage
  const paginatedData = data.slice(startIndex, startIndex + perPage)
  
  return {
    data: paginatedData,
    current_page: page,
    last_page: Math.ceil(total / perPage) || 1,
    per_page: perPage,
    total: total
  }
}

serve(async (req) => {
  console.log('🚀', req.method, new URL(req.url).pathname)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/api', '').replace('/api', '')
    const method = req.method
    
    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION ENDPOINTS (SECURE IMPLEMENTATION)
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/auth/login' && method === 'POST') {
      try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
          return new Response(JSON.stringify({ 
            message: 'Email and password are required',
            success: false 
          }), { status: 400, headers: corsHeaders })
        }

        // Get user from database with secure lookup
        const { data: user } = await supabase
          .from('users')
          .select('id, name, email, password, role, email_verified_at')
          .eq('email', email.toLowerCase())
          .single()

        if (!user) {
          return new Response(JSON.stringify({ 
            message: 'Invalid credentials',
            success: false 
          }), { status: 401, headers: corsHeaders })
        }

        // Verify password securely
        const isValidPassword = await verifyPassword(password, user.password)
        if (!isValidPassword) {
          return new Response(JSON.stringify({ 
            message: 'Invalid credentials',
            success: false 
          }), { status: 401, headers: corsHeaders })
        }

        // Generate secure JWT token
        const token = await createJWT({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        })

        // Remove sensitive data from response
        const { password: _, ...userResponse } = user

        return new Response(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: userResponse,
          token,
          token_type: 'Bearer'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('🔒 Login error:', error)
        return new Response(JSON.stringify({ 
          message: 'Authentication failed',
          success: false 
        }), { status: 500, headers: corsHeaders })
      }
    }

    if (path === '/auth/register' && method === 'POST') {
      try {
        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
          return new Response(JSON.stringify({ 
            message: 'Name, email, and password are required',
            success: false 
          }), { status: 400, headers: corsHeaders })
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.toLowerCase())
          .single()

        if (existingUser) {
          return new Response(JSON.stringify({ 
            message: 'User already exists with this email',
            success: false 
          }), { status: 409, headers: corsHeaders })
        }

        // Hash password securely
        const hashedPassword = await hashPassword(password)

        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'user',
            email_verified_at: null
          }])
          .select('id, name, email, role')
          .single()

        if (error) {
          return new Response(JSON.stringify({ 
            message: 'Failed to create user account',
            success: false 
          }), { status: 500, headers: corsHeaders })
        }

        // Generate secure JWT token
        const token = await createJWT({
          sub: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        })

        return new Response(JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: newUser,
          token,
          token_type: 'Bearer'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('🔒 Registration error:', error)
        return new Response(JSON.stringify({ 
          message: 'Registration failed',
          success: false 
        }), { status: 500, headers: corsHeaders })
      }
    }

    if (path === '/auth/me' && method === 'GET') {
      try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ 
            message: 'No valid authentication token provided',
            success: false 
          }), { status: 401, headers: corsHeaders })
        }

        const token = authHeader.substring(7) // Remove "Bearer " prefix
        const payload = await verifyJWT(token)
        
        if (!payload) {
          return new Response(JSON.stringify({ 
            message: 'Invalid or expired token',
            success: false 
          }), { status: 401, headers: corsHeaders })
        }

        // Get fresh user data from database
        const { data: user } = await supabase
          .from('users')
          .select('id, name, email, role, email_verified_at, created_at')
          .eq('id', payload.sub)
          .single()

        if (!user) {
          return new Response(JSON.stringify({ 
            message: 'User not found',
            success: false 
          }), { status: 404, headers: corsHeaders })
        }

        return new Response(JSON.stringify({
          success: true,
          user
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('🔒 Auth verification error:', error)
        return new Response(JSON.stringify({ 
          message: 'Authentication verification failed',
          success: false 
        }), { status: 500, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST & HOME ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/test' || path === '/') {
      return new Response(JSON.stringify({ 
        message: 'Complete API Ready!', 
        timestamp: new Date().toISOString(),
        endpoints: ['home', 'films', 'series', 'actors', 'podcasts', 'news', 'services', 'testimonials', 'gallery', 'micmtaani/*', 'auth/*'],
        security: {
          jwt_configured: !!JWT_SECRET,
          cors_origin: corsHeaders['Access-Control-Allow-Origin'],
          authentication: 'enabled'
        }
      }), { headers: corsHeaders })
    }

    if (path === '/home') {
      try {
        const [
          { data: featuredFilm }, { data: films }, { data: services }, { data: talent }, 
          { data: gallery }, { data: news }, { data: testimonials }, { data: podcasts }, 
          { data: comingSoon }
        ] = await Promise.all([
          supabase.from('films').select('*').eq('featured', true).eq('status', 'completed').limit(1).single(),
          supabase.from('films').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(8),
          supabase.from('services').select('*').eq('active', true).order('sort_order'),
          supabase.from('talent').select('*').eq('active', true).order('sort_order').limit(6),
          supabase.from('gallery_images').select('*').order('sort_order').limit(8),
          supabase.from('news_articles').select('*').eq('status', 'published').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(4),
          supabase.from('testimonials').select('*').eq('active', true).order('sort_order'),
          supabase.from('podcasts').select('*').eq('active', true).order('sort_order').limit(4),
          supabase.from('films').select('*').in('status', ['upcoming', 'in_production']).order('release_date').limit(4)
        ])

        return new Response(JSON.stringify({
          featured_film: featuredFilm || null, films: films || [], services: services || [],
          talent: talent || [], gallery: gallery || [], news: news || [],
          testimonials: testimonials || [], podcasts: podcasts || [], coming_soon: comingSoon || []
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load home data' }),
          { status: 500, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // FILMS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/films') {
      try {
        const genre = url.searchParams.get('genre')
        const paginateParam = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')

        let query = supabase.from('films').select('*').eq('status', 'completed').order('sort_order')
        if (genre && genre !== 'All') query = query.eq('genre', genre)

        const { data: films } = await query
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(films || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(films || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load films' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/films/')) {
      const slug = path.replace('/films/', '')
      try {
        const { data: film } = await supabase.from('films').select('*').eq('slug', slug).single()
        if (!film) return new Response(JSON.stringify({ message: 'Film not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(film), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Film not found' }), { status: 404, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SERIES ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/series') {
      try {
        const paginateParam = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')
        
        const { data: series } = await supabase.from('series').select('*').order('sort_order')
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(series || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(series || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [], message: 'No series available' }), { headers: corsHeaders })
      }
    }
    
    if (path.startsWith('/series/')) {
      const slug = path.replace('/series/', '')
      try {
        const { data: series } = await supabase.from('series').select('*').eq('slug', slug).single()
        if (!series) return new Response(JSON.stringify({ message: 'Series not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(series), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Series not found' }), { status: 404, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTORS/TALENT ENDPOINTS  
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/actors') {
      try {
        const paginateParam = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')
        
        const { data: talent } = await supabase.from('talent').select('*').eq('active', true).order('sort_order')
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(talent || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(talent || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [], message: 'No actors available' }), { headers: corsHeaders })
      }
    }

    if (path.startsWith('/actors/')) {
      const slug = path.replace('/actors/', '')
      try {
        const { data: actor } = await supabase.from('talent').select('*').eq('slug', slug).single()
        if (!actor) return new Response(JSON.stringify({ message: 'Actor not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(actor), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Actor not found' }), { status: 404, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // PODCASTS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/podcasts') {
      try {
        const paginateParam = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')
        
        const { data: podcasts } = await supabase.from('podcasts').select('*').eq('active', true).order('sort_order')
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(podcasts || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(podcasts || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [], message: 'No podcasts available' }), { headers: corsHeaders })
      }
    }

    if (path.startsWith('/podcasts/')) {
      const slug = path.replace('/podcasts/', '')
      try {
        const { data: podcast } = await supabase.from('podcasts').select('*').eq('slug', slug).single()
        if (!podcast) return new Response(JSON.stringify({ message: 'Podcast not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(podcast), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Podcast not found' }), { status: 404, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // OTHER CONTENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/news') {
      try {
        const paginateParam = url.searchParams.get('paginate') === 'true'
        const page = parseInt(url.searchParams.get('page') || '1')
        
        const { data: news } = await supabase.from('news_articles').select('*')
          .eq('status', 'published').not('published_at', 'is', null)
          .order('published_at', { ascending: false })
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(news || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(news || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [], message: 'No news available' }), { headers: corsHeaders })
      }
    }
    
    if (path.startsWith('/news/')) {
      const slug = path.replace('/news/', '')
      try {
        const { data: article } = await supabase.from('news_articles').select('*')
          .eq('slug', slug).eq('status', 'published').single()
        if (!article) return new Response(JSON.stringify({ message: 'Article not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(article), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Article not found' }), { status: 404, headers: corsHeaders })
      }
    }

    if (path === '/services') {
      try {
        const { data: services } = await supabase.from('services').select('*').eq('active', true).order('sort_order')
        return new Response(JSON.stringify(services || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path === '/testimonials') {
      try {
        const { data: testimonials } = await supabase.from('testimonials').select('*').eq('active', true).order('sort_order')
        return new Response(JSON.stringify(testimonials || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path === '/gallery') {
      try {
        const { data: gallery } = await supabase.from('gallery_images').select('*').order('sort_order')
        return new Response(JSON.stringify(gallery || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path === '/productions') {
      try {
        const { data: productions } = await supabase.from('productions').select('*').order('sort_order')
        return new Response(JSON.stringify(productions || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MIC MTAANI ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/micmtaani') {
      try {
        const [
          { data: articles }, { data: categories }, { data: events }, { data: businesses }
        ] = await Promise.all([
          supabase.from('mic_mtaani_articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(10),
          supabase.from('mic_mtaani_categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('mic_mtaani_events').select('*').eq('status', 'active').order('starts_at').limit(6),
          supabase.from('mic_mtaani_businesses').select('*').eq('is_featured', true).limit(6)
        ])

        return new Response(JSON.stringify({
          latest: articles || [], categories: categories || [], events: events || [],
          businesses: businesses || [], breaking: null, featured: articles?.[0] || null, trending: []
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({
          latest: [], categories: [], events: [], businesses: [], breaking: null, featured: null, trending: []
        }), { headers: corsHeaders })
      }
    }

    if (path === '/micmtaani/categories') {
      try {
        const { data: categories } = await supabase.from('mic_mtaani_categories').select('*').eq('is_active', true).order('sort_order')
        return new Response(JSON.stringify(categories || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path === '/micmtaani/articles') {
      try {
        const page = parseInt(url.searchParams.get('page') || '1')
        const { data: articles } = await supabase.from('mic_mtaani_articles').select('*')
          .eq('status', 'published').order('published_at', { ascending: false })
        
        return new Response(JSON.stringify(paginate(articles || [], page)), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [] }), { headers: corsHeaders })
      }
    }
    
    if (path.startsWith('/micmtaani/articles/')) {
      const slug = path.replace('/micmtaani/articles/', '')
      try {
        const { data: article } = await supabase.from('mic_mtaani_articles').select('*')
          .eq('slug', slug).eq('status', 'published').single()
        if (!article) return new Response(JSON.stringify({ message: 'Article not found' }), { status: 404, headers: corsHeaders })
        
        // Get related articles
        const { data: related } = await supabase.from('mic_mtaani_articles').select('*')
          .eq('status', 'published').neq('id', article.id).limit(3)
          
        return new Response(JSON.stringify({ article, related: related || [] }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Article not found' }), { status: 404, headers: corsHeaders })
      }
    }

    if (path === '/micmtaani/events') {
      try {
        const { data: events } = await supabase.from('mic_mtaani_events').select('*').eq('status', 'active').order('starts_at')
        return new Response(JSON.stringify(events || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path === '/micmtaani/businesses') {
      try {
        const { data: businesses } = await supabase.from('mic_mtaani_businesses').select('*').order('name')
        return new Response(JSON.stringify(businesses || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    if (path.startsWith('/micmtaani/businesses/')) {
      const slug = path.replace('/micmtaani/businesses/', '')
      try {
        const { data: business } = await supabase.from('mic_mtaani_businesses').select('*').eq('slug', slug).single()
        if (!business) return new Response(JSON.stringify({ message: 'Business not found' }), { status: 404, headers: corsHeaders })
        return new Response(JSON.stringify(business), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Business not found' }), { status: 404, headers: corsHeaders })
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSIONS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/contact' && method === 'POST') {
      try {
        const body = await req.json()
        const { name, email, service, message } = body

        if (!name || !email || !message) {
          return new Response(JSON.stringify({ message: 'Name, email, and message are required' }),
            { status: 400, headers: corsHeaders })
        }

        const { error } = await supabase.from('contacts').insert([{
          name, email, service: service || null, message, status: 'pending'
        }])

        if (error) {
          return new Response(JSON.stringify({ message: 'Failed to submit contact form' }),
            { status: 500, headers: corsHeaders })
        }

        return new Response(JSON.stringify({ message: 'Contact form submitted successfully' }),
          { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit contact form' }),
          { status: 500, headers: corsHeaders })
      }
    }

    if (path === '/subscribe' && method === 'POST') {
      try {
        const body = await req.json()
        const { email } = body

        if (!email) {
          return new Response(JSON.stringify({ message: 'Email is required' }),
            { status: 400, headers: corsHeaders })
        }

        const { error } = await supabase.from('subscribers').insert([{ email }])

        if (error) {
          return new Response(JSON.stringify({ message: 'Failed to subscribe to newsletter' }),
            { status: 500, headers: corsHeaders })
        }

        return new Response(JSON.stringify({ message: 'Successfully subscribed to newsletter' }),
          { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to subscribe' }),
          { status: 500, headers: corsHeaders })
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // DEFAULT 404 RESPONSE
    // ═══════════════════════════════════════════════════════════════
    
    return new Response(JSON.stringify({ 
      error: 'Endpoint not found', 
      path: path,
      available_endpoints: [
        'GET /home', 'GET /films', 'GET /films/{slug}', 'GET /series', 'GET /series/{slug}',
        'GET /actors', 'GET /actors/{slug}', 'GET /podcasts', 'GET /podcasts/{slug}',
        'GET /news', 'GET /news/{slug}', 'GET /services', 'GET /testimonials', 'GET /gallery',
        'GET /productions', 'GET /micmtaani', 'GET /micmtaani/categories', 'GET /micmtaani/articles',
        'GET /micmtaani/articles/{slug}', 'GET /micmtaani/events', 'GET /micmtaani/businesses',
        'GET /micmtaani/businesses/{slug}', 'POST /contact', 'POST /subscribe',
        'POST /auth/login', 'POST /auth/register', 'GET /auth/me'
      ]
    }), { 
      status: 404, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('💥 Server error:', error)
    return new Response(JSON.stringify({ 
      error: 'Server error', 
      details: error.message
    }), { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})