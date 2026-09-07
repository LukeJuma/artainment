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
    // AUTHENTICATION ENDPOINTS (FIXED VERSION)
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

    // FIXED: Support both /auth/me and /auth/user for compatibility
    if ((path === '/auth/me' || path === '/auth/user') && method === 'GET') {
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
        message: 'Complete API Ready - Auth Fixed!', 
        timestamp: new Date().toISOString(),
        endpoints: ['home', 'films', 'series', 'actors', 'podcasts', 'news', 'services', 'testimonials', 'gallery', 'micmtaani/*', 'auth/login', 'auth/user'],
        authentication: 'working - supports both /auth/me and /auth/user'
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

    // Helper function to verify admin auth
    function getAdminToken(req: Request) {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authentication token provided')
      }
      const token = authHeader.substring(7)
      if (!token.startsWith('admin-token-')) {
        throw new Error('Invalid admin token')
      }
      return token
    }

    // Dashboard Stats
    if (path === '/admin/dashboard/stats' && method === 'GET') {
      try {
        getAdminToken(req) // Verify admin auth

        const [
          { count: filmsCount }, { count: seriesCount }, { count: podcastsCount },
          { count: newsCount }, { count: talentCount }, { count: servicesCount },
          { count: galleryCount }, { count: testimonialsCount }, { count: usersCount },
          { count: articlesCount }, { count: categoriesCount }, { count: eventsCount }
        ] = await Promise.all([
          supabase.from('films').select('*', { count: 'exact', head: true }),
          supabase.from('series').select('*', { count: 'exact', head: true }),
          supabase.from('podcasts').select('*', { count: 'exact', head: true }),
          supabase.from('news_articles').select('*', { count: 'exact', head: true }),
          supabase.from('talent').select('*', { count: 'exact', head: true }),
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
          supabase.from('testimonials').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('mic_mtaani_articles').select('*', { count: 'exact', head: true }),
          supabase.from('mic_mtaani_categories').select('*', { count: 'exact', head: true }),
          supabase.from('mic_mtaani_events').select('*', { count: 'exact', head: true })
        ])
        
        const { data: topFilms } = await supabase.from('films').select('*').eq('featured', true).limit(5)

        return new Response(JSON.stringify({
          content_counts: {
            films: filmsCount || 0,
            series: seriesCount || 0,
            podcasts: podcastsCount || 0,
            news: newsCount || 0,
            talent: talentCount || 0,
            services: servicesCount || 0,
            gallery: galleryCount || 0,
            testimonials: testimonialsCount || 0
          },
          user_counts: {
            total_users: usersCount || 0,
            new_this_month: 0,
            new_today: 0,
            active_subscribers: 0
          },
          revenue: {
            total_all_time: 0,
            this_month: 0,
            this_week: 0,
            today: 0
          },
          monthly_revenue: [],
          ticket_stats: {
            total_sold: 0,
            this_month: 0
          },
          mic_mtaani: {
            articles: articlesCount || 0,
            categories: categoriesCount || 0,
            events: eventsCount || 0
          },
          recent_activity: [],
          top_films: topFilms || []
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // DEFAULT 404 RESPONSE
    // ═══════════════════════════════════════════════════════════════
    
    return new Response(JSON.stringify({ 
      error: 'Endpoint not found', 
      path: path,
      available_endpoints: [
        'GET /home', 'GET /films', 'GET /films/{slug}',
        'POST /auth/login', 'GET /auth/user', 'GET /auth/me',
        'GET /admin/dashboard/stats'
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