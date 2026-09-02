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

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

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
    // AUTHENTICATION ENDPOINTS (WORKING VERSION)
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

        // Hardcoded admin login (working) - Fixed user format
        if (email.toLowerCase() === 'admin@theartainment.co.ke' && password === 'Admin123!') {
          return new Response(JSON.stringify({
            success: true,
            message: 'Login successful',
            user: {
              id: 1,
              name: 'Admin',
              email: 'admin@theartainment.co.ke',
              is_admin: true
            },
            token: 'admin-token-' + Date.now(),
            token_type: 'Bearer'
          }), { headers: corsHeaders })
        }

        return new Response(JSON.stringify({ 
          message: 'Invalid credentials',
          success: false 
        }), { status: 401, headers: corsHeaders })

      } catch (error) {
        console.error('🔒 Login error:', error)
        return new Response(JSON.stringify({ 
          message: 'Authentication failed',
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
        
        // For our simple implementation, just check if it's a valid admin token
        if (token.startsWith('admin-token-')) {
          return new Response(JSON.stringify({
            id: 1,
            name: 'Admin',
            email: 'admin@theartainment.co.ke',
            is_admin: true
          }), { headers: corsHeaders })
        }

        return new Response(JSON.stringify({ 
          message: 'Invalid token',
          success: false 
        }), { status: 401, headers: corsHeaders })

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
        endpoints: ['home', 'films', 'series', 'actors', 'podcasts', 'news', 'services', 'testimonials', 'gallery', 'micmtaani/*', 'auth/login'],
        authentication: 'working'
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
        return new Response(JSON.stringify({ error: 'Failed to load home data', details: error.message }),
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
        'GET /micmtaani/businesses/{slug}', 'POST /contact', 'POST /subscribe', 'POST /auth/login'
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