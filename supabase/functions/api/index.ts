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

    // Support both /auth/me and /auth/user for compatibility
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
    // ADMIN DASHBOARD ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

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

    // Admin Films CRUD
    if (path === '/admin/films' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: films } = await supabase.from('films').select('*').order('sort_order')
        return new Response(JSON.stringify(films || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/films' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('films').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create film' }), { status: 500, headers: corsHeaders })
      }
    }
    if (path.startsWith('/admin/films/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/films/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('films').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update film' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/films/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/films/', ''))
        const { error } = await supabase.from('films').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Film deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete film' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Series CRUD
    if (path === '/admin/series' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: series } = await supabase.from('series').select('*').order('sort_order')
        return new Response(JSON.stringify(series || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/series' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('series').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create series' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/series/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/series/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('series').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update series' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/series/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/series/', ''))
        const { error } = await supabase.from('series').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Series deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete series' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Series Seasons CRUD
    if (path.startsWith('/admin/series/') && path.includes('/seasons') && method === 'GET') {
      try {
        getAdminToken(req)
        const seriesId = parseInt(path.split('/')[3]) // Extract series ID from /admin/series/{id}/seasons
        const { data: seasons } = await supabase
          .from('seasons')
          .select(`
            *,
            episodes:episodes(*)
          `)
          .eq('series_id', seriesId)
          .order('season_number', { ascending: true })
        return new Response(JSON.stringify(seasons || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/series/') && path.includes('/seasons') && method === 'POST') {
      try {
        getAdminToken(req)
        const seriesId = parseInt(path.split('/')[3]) // Extract series ID from /admin/series/{id}/seasons
        const body = await req.json()
        
        // Add series_id to the season data
        const seasonData = { ...body, series_id: seriesId }
        
        const { error, data } = await supabase.from('seasons').insert([seasonData]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        console.error('Season creation error:', error)
        return new Response(JSON.stringify({ 
          message: 'Failed to create season',
          error: error.message 
        }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/seasons/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/seasons/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('seasons').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update season' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/seasons/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/seasons/', ''))
        const { error } = await supabase.from('seasons').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Season deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete season' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Episodes CRUD
    if (path.startsWith('/admin/seasons/') && path.includes('/episodes') && method === 'GET') {
      try {
        getAdminToken(req)
        const seasonId = parseInt(path.split('/')[3]) // Extract season ID from /admin/seasons/{id}/episodes
        const { data: episodes } = await supabase
          .from('episodes')
          .select('*')
          .eq('season_id', seasonId)
          .order('episode_number', { ascending: true })
        return new Response(JSON.stringify(episodes || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/seasons/') && path.includes('/episodes') && method === 'POST') {
      try {
        getAdminToken(req)
        const seasonId = parseInt(path.split('/')[3]) // Extract season ID from /admin/seasons/{id}/episodes
        const body = await req.json()
        
        // Add season_id to the episode data
        const episodeData = { ...body, season_id: seasonId }
        
        const { error, data } = await supabase.from('episodes').insert([episodeData]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        console.error('Episode creation error:', error)
        return new Response(JSON.stringify({ 
          message: 'Failed to create episode',
          error: error.message 
        }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/episodes/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/episodes/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('episodes').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update episode' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/episodes/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/episodes/', ''))
        const { error } = await supabase.from('episodes').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Episode deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete episode' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Talent CRUD
    if (path === '/admin/talent' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: talent } = await supabase.from('talent').select('*').order('sort_order')
        return new Response(JSON.stringify(talent || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }
    if (path === '/admin/talent' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('talent').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create talent' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/talent/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/talent/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('talent').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update talent' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/talent/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/talent/', ''))
        const { error } = await supabase.from('talent').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Talent deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete talent' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Podcasts CRUD
    if (path === '/admin/podcasts' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: podcasts } = await supabase.from('podcasts').select('*').order('sort_order')
        return new Response(JSON.stringify(podcasts || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    // Admin Services CRUD
    if (path === '/admin/services' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: services } = await supabase.from('services').select('*').order('sort_order')
        return new Response(JSON.stringify(services || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/services' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('services').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create service' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/services/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/services/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('services').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update service' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/services/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/services/', ''))
        const { error } = await supabase.from('services').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Service deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete service' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin News CRUD
    if (path === '/admin/news' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: news } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false })
        return new Response(JSON.stringify(news || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/news' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('news_articles').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create news article' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/news/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/news/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('news_articles').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update news article' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/news/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/news/', ''))
        const { error } = await supabase.from('news_articles').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'News article deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete news article' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Testimonials CRUD
    if (path === '/admin/testimonials' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: testimonials } = await supabase.from('testimonials').select('*').order('sort_order')
        return new Response(JSON.stringify(testimonials || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/testimonials' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('testimonials').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create testimonial' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/testimonials/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/testimonials/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('testimonials').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update testimonial' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/testimonials/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/testimonials/', ''))
        const { error } = await supabase.from('testimonials').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Testimonial deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete testimonial' }), { status: 500, headers: corsHeaders })
      }
    }
    // Admin Gallery CRUD
    if (path === '/admin/gallery' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: gallery } = await supabase.from('gallery_images').select('*').order('sort_order')
        return new Response(JSON.stringify(gallery || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    if (path === '/admin/gallery' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('gallery_images').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create gallery image' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/gallery/') && method === 'PUT') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/gallery/', ''))
        const body = await req.json()
        const { error, data } = await supabase.from('gallery_images').update(body).eq('id', id).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to update gallery image' }), { status: 500, headers: corsHeaders })
      }
    }

    if (path.startsWith('/admin/gallery/') && method === 'DELETE') {
      try {
        getAdminToken(req)
        const id = parseInt(path.replace('/admin/gallery/', ''))
        const { error } = await supabase.from('gallery_images').delete().eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Gallery image deleted successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to delete gallery image' }), { status: 500, headers: corsHeaders })
      }
    }

    // Admin Contacts
    if (path === '/admin/contacts' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: contacts } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
        return new Response(JSON.stringify(contacts || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    // Admin Reviews
    if (path === '/admin/reviews' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: reviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
        return new Response(JSON.stringify(reviews || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    // Admin Mic Mtaani Articles
    if (path === '/admin/micmtaani/articles' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: articles } = await supabase.from('mic_mtaani_articles').select('*').order('created_at', { ascending: false })
        return new Response(JSON.stringify({ data: articles || [] }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [] }), { headers: corsHeaders })
      }
    }

    if (path === '/admin/micmtaani/articles' && method === 'POST') {
      try {
        getAdminToken(req)
        const body = await req.json()
        const { error, data } = await supabase.from('mic_mtaani_articles').insert([body]).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to create article' }), { status: 500, headers: corsHeaders })
      }
    }
    // Admin Users
    if (path === '/admin/users' && method === 'GET') {
      try {
        getAdminToken(req)
        const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false })
        return new Response(JSON.stringify(users || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify([]), { headers: corsHeaders })
      }
    }

    // Admin Settings
    if (path === '/admin/settings' && method === 'GET') {
      try {
        getAdminToken(req)
        return new Response(JSON.stringify({
          platform_name: 'The Artainment',
          tagline: 'Discover, Stream, Experience',
          support_email: 'support@theartainment.co.ke',
          currency: 'KES',
          timezone: 'Africa/Nairobi'
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: corsHeaders })
      }
    }

    // File Upload Endpoint
    if (path === '/upload' && method === 'POST') {
      try {
        getAdminToken(req) // Verify admin authentication

        // Parse form data
        const formData = await req.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'uploads'

        if (!file) {
          return new Response(JSON.stringify({ 
            message: 'No file provided',
            error: 'file_required' 
          }), { status: 400, headers: corsHeaders })
        }

        // Validate file type and size based on file type
        let maxSize = 10 * 1024 * 1024 // 10MB default for images
        let fileTypeCategory = 'image'
        
        // Determine file type and appropriate size limit
        if (file.type.startsWith('video/') || file.name.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm|m4v)$/)) {
          maxSize = 500 * 1024 * 1024 // 500MB for videos
          fileTypeCategory = 'video'
        } else if (file.type.startsWith('audio/') || file.name.toLowerCase().match(/\.(mp3|wav|aac|m4a|ogg)$/)) {
          maxSize = 100 * 1024 * 1024 // 100MB for audio
          fileTypeCategory = 'audio'
        }
        
        if (file.size > maxSize) {
          const maxSizeMB = Math.round(maxSize / (1024 * 1024))
          return new Response(JSON.stringify({ 
            message: `File too large. Maximum size for ${fileTypeCategory} files is ${maxSizeMB}MB`,
            error: 'file_too_large',
            max_size: maxSize,
            file_size: file.size,
            file_type: fileTypeCategory
          }), { status: 400, headers: corsHeaders })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const safeFileName = `${timestamp}-${randomString}.${fileExtension}`
        const filePath = `${folder}/${safeFileName}`

        // Convert File to ArrayBuffer for Supabase Storage
        const fileBuffer = await file.arrayBuffer()
        const fileBytes = new Uint8Array(fileBuffer)

        // Upload to Supabase Storage
        let uploadResult;
        try {
          // Try the 'uploads' bucket first
          uploadResult = await supabase.storage
            .from('uploads')
            .upload(filePath, fileBytes, {
              contentType: file.type || 'application/octet-stream',
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadResult.error) {
            // If uploads bucket doesn't exist, try creating it or use a different approach
            console.error('Upload to uploads bucket failed:', uploadResult.error)
            
            // Try uploading to a different bucket or create the bucket
            if (uploadResult.error.message?.includes('Bucket not found') || uploadResult.error.message?.includes('bucket does not exist')) {
              // Try using a different bucket name that might exist
              const alternativeResult = await supabase.storage
                .from('files') // Alternative bucket name
                .upload(filePath, fileBytes, {
                  contentType: file.type || 'application/octet-stream',
                  cacheControl: '3600',
                  upsert: false
                })
              
              if (alternativeResult.error) {
                throw new Error(`Storage bucket not found. Please create 'uploads' or 'files' bucket in Supabase Storage. Error: ${alternativeResult.error.message}`)
              }
              
              uploadResult = alternativeResult
            } else {
              throw new Error(uploadResult.error.message)
            }
          }
        } catch (storageError: any) {
          console.error('Storage upload error:', storageError)
          return new Response(JSON.stringify({ 
            message: 'Failed to upload file to storage. Please ensure Supabase Storage bucket exists and has proper permissions.',
            error: 'storage_upload_failed',
            details: storageError.message,
            suggestion: 'Create an "uploads" bucket in your Supabase Storage dashboard with public access enabled.'
          }), { status: 500, headers: corsHeaders })
        }

        // Get public URL
        const bucketName = uploadResult.data?.bucketId || 'uploads'
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        return new Response(JSON.stringify({
          url: urlData.publicUrl,
          path: filePath,
          filename: safeFileName,
          size: file.size,
          type: file.type,
          folder: folder
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('Upload error:', error)
        return new Response(JSON.stringify({ 
          message: error.message === 'Invalid admin token' ? 'Unauthorized' : 'Upload failed',
          error: error.message 
        }), { 
          status: error.message === 'Invalid admin token' ? 401 : 500, 
          headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // YOUTUBE VIDEO PROCESSING ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    // Extract YouTube video information
    if (path.startsWith('/youtube/info/') && method === 'GET') {
      try {
        const videoId = path.replace('/youtube/info/', '')
        
        if (!videoId || videoId.length !== 11) {
          return new Response(JSON.stringify({ 
            error: 'Invalid YouTube video ID',
            message: 'Video ID must be 11 characters long'
          }), { status: 400, headers: corsHeaders })
        }

        // Extract video information from YouTube
        const videoInfo = {
          videoId,
          title: null,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          thumbnailHigh: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          thumbnailMedium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: null,
          description: null,
          extractedAt: new Date().toISOString(),
          // Custom stream URL for Enhanced Player
          customStreamUrl: `${req.url.split('/youtube/info/')[0]}/youtube/stream/${videoId}`,
          // Embed URL for Standard Player
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
          // Original YouTube URL
          originalUrl: `https://www.youtube.com/watch?v=${videoId}`
        }

        return new Response(JSON.stringify({
          success: true,
          video: videoInfo,
          message: 'Video information extracted successfully'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('YouTube info extraction error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to extract video information',
          message: error.message 
        }), { status: 500, headers: corsHeaders })
      }
    }

    // Stream YouTube video through Enhanced Player
    if (path.startsWith('/youtube/stream/') && method === 'GET') {
      try {
        const videoId = path.replace('/youtube/stream/', '')
        
        if (!videoId || videoId.length !== 11) {
          return new Response(JSON.stringify({ 
            error: 'Invalid YouTube video ID',
            message: 'Video ID must be 11 characters long'
          }), { status: 400, headers: corsHeaders })
        }

        // For now, we'll create a proxy/redirect approach
        // In production, you'd extract the actual video stream URL
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
        
        // Return stream information
        return new Response(JSON.stringify({
          success: true,
          videoId,
          streamType: 'youtube_proxy',
          message: 'YouTube stream processing - Enhanced Player compatible',
          // For Enhanced Player, we'll use a different approach
          proxyUrl: `${req.url.split('/youtube/stream/')[0]}/youtube/proxy/${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0`,
          originalUrl: youtubeUrl,
          note: 'This endpoint provides Enhanced Player compatible streaming'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('YouTube stream error:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to process video stream',
          message: error.message 
        }), { status: 500, headers: corsHeaders })
      }
    }

    // YouTube video proxy for Enhanced Player (completely custom player)
    if (path.startsWith('/youtube/proxy/') && method === 'GET') {
      try {
        const videoId = path.replace('/youtube/proxy/', '')
        
        if (!videoId || videoId.length !== 11) {
          return new Response('Invalid video ID', { status: 400 })
        }

        // Create a completely custom HTML page that replaces YouTube UI entirely
        const html = `
<!DOCTYPE html>
<html style="margin:0;padding:0;background:#000;font-family:'DM Sans',sans-serif;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Enhanced Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      height: 100vh; 
      background: #000; 
      overflow: hidden; 
      font-family: 'DM Sans', sans-serif;
    }
    
    #video-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #youtube-embed {
      width: 100%;
      height: 100%;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    
    #custom-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      pointer-events: none;
      background: transparent;
    }
    
    #brand-overlay {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
      padding: 20px;
      border-radius: 12px;
      color: white;
      pointer-events: none;
    }
    
    #brand-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    }
    
    #brand-badge {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
    }
    
    #close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      background: rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 300;
      pointer-events: all;
      z-index: 3;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }
    
    #close-btn:hover {
      background: rgba(0,0,0,0.95);
      transform: scale(1.05);
    }
    
    .fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Hide YouTube branding completely */
    iframe {
      border: none !important;
      outline: none !important;
    }
  </style>
</head>
<body>
  <div id="video-container">
    <!-- YouTube embed with minimal UI -->
    <iframe 
      id="youtube-embed"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&enablejsapi=1&origin=the-artainment.vercel.app&widget_referrer=the-artainment.vercel.app"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
      frameborder="0">
    </iframe>
    
    <!-- Custom branded overlay -->
    <div id="custom-overlay">
      <button id="close-btn" onclick="closePlayer()" title="Close player">✕</button>
      <div id="brand-overlay" class="fade-in">
        <div id="brand-title">Playing in Enhanced Player</div>
        <div id="brand-badge">The Artainment</div>
      </div>
    </div>
  </div>

  <script>
    // Close player function
    function closePlayer() {
      if (window.parent !== window) {
        window.parent.postMessage('closePlayer', '*');
      } else {
        window.close();
      }
    }
    
    // Hide brand overlay after 5 seconds
    setTimeout(() => {
      const overlay = document.getElementById('brand-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-out';
      }
    }, 5000);
    
    // Show overlay on hover
    document.addEventListener('mousemove', () => {
      const overlay = document.getElementById('brand-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
        clearTimeout(window.hideTimer);
        window.hideTimer = setTimeout(() => {
          overlay.style.opacity = '0';
        }, 3000);
      }
    });
    
    // Prevent right-click context menu
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Handle fullscreen
    document.addEventListener('fullscreenchange', () => {
      const overlay = document.getElementById('custom-overlay');
      const closeBtn = document.getElementById('close-btn');
      if (document.fullscreenElement) {
        if (overlay) overlay.style.display = 'none';
      } else {
        if (overlay) overlay.style.display = 'block';
      }
    });
  </script>
</body>
</html>`

        return new Response(html, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Frame-Options': 'SAMEORIGIN',
          }
        })

      } catch (error) {
        console.error('YouTube proxy error:', error)
        return new Response('Video proxy error', { status: 500 })
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
        'POST /auth/login', 'GET /auth/user', 'GET /auth/me',
        'GET /admin/dashboard/stats', 
        'GET|POST|PUT|DELETE /admin/films', 'GET|POST|PUT|DELETE /admin/series',
        'GET|POST /admin/series/{id}/seasons', 'PUT|DELETE /admin/seasons/{id}',
        'GET|POST /admin/seasons/{id}/episodes', 'PUT|DELETE /admin/episodes/{id}',
        'GET|POST|PUT|DELETE /admin/talent', 'GET|POST|PUT|DELETE /admin/services', 
        'GET|POST|PUT|DELETE /admin/news', 'GET|POST|PUT|DELETE /admin/testimonials',
        'GET|POST|PUT|DELETE /admin/gallery', 'GET /admin/contacts', 'GET /admin/reviews',
        'GET|POST /admin/micmtaani/articles', 'GET /admin/users', 'GET /admin/settings', 
        'POST /upload'
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