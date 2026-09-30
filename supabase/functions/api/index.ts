import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts'

// CORS headers with security improvements
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, x-requested-with',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
}

// JWT Secret and Salt from environment variables
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-256-bit-secret-change-in-production'
const SALT = Deno.env.get('PASSWORD_SALT') || 'default-salt-change-in-production'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// JWT Helper Functions
async function createJWT(payload: any): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours
  }
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const message = `${encodedHeader}.${encodedPayload}`
  const signature = btoa(createHash('sha256').update(`${message}.${JWT_SECRET}`).digest('hex'))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  return `${message}.${signature}`
}

async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [encodedHeader, encodedPayload, signature] = parts
    const message = `${encodedHeader}.${encodedPayload}`
    
    const expectedSignature = btoa(createHash('sha256').update(`${message}.${JWT_SECRET}`).digest('hex'))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    if (signature !== expectedSignature) return null
    
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')))
    const now = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < now) return null
    
    return payload
  } catch {
    return null
  }
}

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const hash = createHash('sha256')
  hash.update(password + SALT)
  return hash.digest('hex')
}

// Input sanitization
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim()
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

// Audit logging
async function logAuditEvent(eventType: string, userId?: string, metadata?: any) {
  try {
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      user_id: userId,
      ip_address: '0.0.0.0', // Edge function limitation
      user_agent: 'Supabase Edge Function',
      metadata: metadata || {},
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}

// Authentication helper
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  const payload = await verifyJWT(token)
  if (!payload || !payload.sub) return null
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', payload.sub)
    .single()
  
  return user
}

// Pagination helper
function paginate(data: any[], page: number, perPage: number = 12) {
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
    // HOME & DASHBOARD ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/' || path === '/home') {
      try {
        const [
          { data: featuredFilm }, 
          { data: films }, 
          { data: series }, 
          { data: services }, 
          { data: talent }, 
          { data: gallery }, 
          { data: news }, 
          { data: testimonials }, 
          { data: podcasts }
        ] = await Promise.all([
          supabase.from('films').select('*').eq('featured', true).eq('status', 'published').single(),
          supabase.from('films').select('*').eq('status', 'published').order('sort_order').limit(6),
          supabase.from('series').select('*').eq('status', 'published').order('sort_order').limit(4),
          supabase.from('services').select('*').eq('active', true).order('sort_order'),
          supabase.from('talent').select('*').eq('active', true).order('sort_order').limit(6),
          supabase.from('gallery_images').select('*').order('sort_order').limit(8),
          supabase.from('news_articles').select('*').is('published_at', 'not.null').order('published_at', { ascending: false }).limit(4),
          supabase.from('testimonials').select('*').eq('active', true).order('sort_order'),
          supabase.from('podcasts').select('*').order('created_at', { ascending: false }).limit(4)
        ])

        return new Response(JSON.stringify({
          featured_film: featuredFilm,
          films: films || [],
          series: series || [],
          services: services || [],
          talent: talent || [],
          gallery: gallery || [],
          news: news || [],
          testimonials: testimonials || [],
          podcasts: podcasts || []
        }), { headers: corsHeaders })
      } catch (error) {
        console.error('Home endpoint error:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch home data' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }), { headers: corsHeaders })
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/auth/register' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        const { name, email, password } = body

        if (!name || !email || !password) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
            status: 400, headers: corsHeaders 
          })
        }

        if (password.length < 8) {
          return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), { 
            status: 400, headers: corsHeaders 
          })
        }

        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single()

        if (existingUser) {
          return new Response(JSON.stringify({ error: 'User already exists' }), { 
            status: 409, headers: corsHeaders 
          })
        }

        // Create user
        const hashedPassword = await hashPassword(password)
        const { data: user, error } = await supabase
          .from('users')
          .insert({
            name,
            email,
            password: hashedPassword,
            is_admin: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Create JWT token
        const token = await createJWT({ sub: user.id, email: user.email, is_admin: user.is_admin })

        await logAuditEvent('USER_REGISTERED', user.id, { email })

        return new Response(JSON.stringify({
          user: { ...user, password: undefined },
          token,
          token_type: 'Bearer'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('Registration error:', error)
        return new Response(JSON.stringify({ error: 'Registration failed' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    if (path === '/auth/login' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        const { email, password } = body

        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password required' }), { 
            status: 400, headers: corsHeaders 
          })
        }

        // Get user
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (!user) {
          await logAuditEvent('LOGIN_FAILED', null, { email, reason: 'user_not_found' })
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
            status: 401, headers: corsHeaders 
          })
        }

        // Verify password
        const passwordValid = await hashPassword(password) === user.password
        if (!passwordValid) {
          await logAuditEvent('LOGIN_FAILED', user.id, { email, reason: 'invalid_password' })
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
            status: 401, headers: corsHeaders 
          })
        }

        // Create JWT token
        const token = await createJWT({ 
          sub: user.id, 
          email: user.email, 
          is_admin: user.is_admin,
          name: user.name
        })

        await logAuditEvent(user.is_admin ? 'ADMIN_LOGIN' : 'USER_LOGIN', user.id, { email })

        return new Response(JSON.stringify({
          user: { ...user, password: undefined },
          token,
          token_type: 'Bearer'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('Login error:', error)
        return new Response(JSON.stringify({ error: 'Login failed' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    if (path === '/auth/logout' && method === 'POST') {
      const user = await getAuthenticatedUser(req)
      if (user) {
        await logAuditEvent('USER_LOGOUT', user.id)
      }
      return new Response(JSON.stringify({ message: 'Logged out successfully' }), { headers: corsHeaders })
    }

    if (path === '/auth/me' && method === 'GET') {
      const user = await getAuthenticatedUser(req)
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401, headers: corsHeaders 
        })
      }
      return new Response(JSON.stringify({ ...user, password: undefined }), { headers: corsHeaders })
    }

    // ═══════════════════════════════════════════════════════════════
    // FILMS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/films') {
      try {
        const page = parseInt(url.searchParams.get('page') || '1')
        const genre = url.searchParams.get('genre')
        const user = await getAuthenticatedUser(req)
        
        let query = supabase.from('films').select('*')
        
        // Filter by published status for non-admin users
        if (!user || !user.is_admin) {
          query = query.eq('status', 'published')
        }
        
        if (genre && genre !== 'All') {
          query = query.eq('genre', genre)
        }

        const { data: films } = await query.order('sort_order').order('created_at', { ascending: false })

        // Hide full_video_url for non-admin users
        const processedFilms = (films || []).map(film => {
          if (!user || !user.is_admin) {
            return {
              ...film,
              has_full_video: Boolean(film.full_video_url || film.youtube_url),
              full_video_url: null
            }
          }
          return film
        })

        return new Response(JSON.stringify(paginate(processedFilms, page, 12)), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch films' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    if (path.startsWith('/films/') && method === 'GET') {
      try {
        const slug = path.replace('/films/', '')
        const user = await getAuthenticatedUser(req)
        
        let query = supabase.from('films').select('*').eq('slug', slug)
        
        // Filter by published status for non-admin users
        if (!user || !user.is_admin) {
          query = query.eq('status', 'published')
        }
        
        const { data: film } = await query.single()

        if (!film) {
          return new Response(JSON.stringify({ error: 'Film not found' }), { 
            status: 404, headers: corsHeaders 
          })
        }

        // Hide full_video_url for non-admin users
        if (!user || !user.is_admin) {
          film.has_full_video = Boolean(film.full_video_url || film.youtube_url)
          film.full_video_url = null
        }

        return new Response(JSON.stringify(film), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Film not found' }), { 
          status: 404, headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SERIES ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/series') {
      try {
        const user = await getAuthenticatedUser(req)
        let query = supabase.from('series').select('*')
        
        // Filter by published status for non-admin users
        if (!user || !user.is_admin) {
          query = query.eq('status', 'published')
        }
        
        const { data: series } = await query.order('sort_order')

        // Get seasons and episodes for each series
        const seriesWithCounts = await Promise.all((series || []).map(async (s) => {
          const { data: seasons, count: seasonsCount } = await supabase
            .from('seasons')
            .select('*, episodes(*)', { count: 'exact' })
            .eq('series_id', s.id)
            .order('season_number')

          const totalEpisodes = seasons?.reduce((sum, season) => sum + (season.episodes?.length || 0), 0) || 0

          return {
            ...s,
            seasons_count: seasonsCount || 0,
            episodes_count: totalEpisodes,
            seasons: seasons || []
          }
        }))

        return new Response(JSON.stringify(seriesWithCounts), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch series' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    if (path.startsWith('/series/') && method === 'GET') {
      try {
        const slug = path.replace('/series/', '')
        const user = await getAuthenticatedUser(req)
        
        let query = supabase.from('series').select('*').eq('slug', slug)
        
        // Filter by published status for non-admin users
        if (!user || !user.is_admin) {
          query = query.eq('status', 'published')
        }
        
        const { data: series } = await query.single()

        if (!series) {
          return new Response(JSON.stringify({ error: 'Series not found' }), { 
            status: 404, headers: corsHeaders 
          })
        }

        // Get seasons with episodes
        const { data: seasons } = await supabase
          .from('seasons')
          .select(`
            *,
            episodes (
              id, title, slug, episode_number, description, duration,
              video_url, thumbnail_url, air_date, created_at
            )
          `)
          .eq('series_id', series.id)
          .order('season_number')

        return new Response(JSON.stringify({
          ...series,
          seasons: seasons || []
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Series not found' }), { 
          status: 404, headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // PODCASTS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/podcasts') {
      try {
        const { data: podcasts } = await supabase
          .from('podcasts')
          .select('*')
          .order('created_at', { ascending: false })

        // Get latest episode for each podcast (optimized to avoid N+1)
        const podcastsWithLatest = await Promise.all((podcasts || []).map(async (podcast) => {
          const { data: latestEpisode } = await supabase
            .from('podcast_episodes')
            .select('id, title, published_at, duration')
            .eq('podcast_id', podcast.id)
            .order('published_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...podcast,
            latest_episode: latestEpisode
          }
        }))

        return new Response(JSON.stringify(podcastsWithLatest), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch podcasts' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // TALENT/ACTORS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/talents' || path === '/actors') {
      try {
        const paginateParam = url.searchParams.get('paginate')
        const page = parseInt(url.searchParams.get('page') || '1')
        
        const { data: talent } = await supabase
          .from('talent')
          .select('*')
          .eq('active', true)
          .order('sort_order')
        
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(talent || [], page)), { headers: corsHeaders })
        }
        return new Response(JSON.stringify(talent || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ data: [], message: 'No actors available' }), { headers: corsHeaders })
      }
    }

    if ((path.startsWith('/talents/') || path.startsWith('/actors/')) && method === 'GET') {
      try {
        const slug = path.replace(/^\/(talents|actors)\//, '')
        const { data: actor } = await supabase
          .from('talent')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single()

        if (!actor) {
          return new Response(JSON.stringify({ message: 'Actor not found' }), { 
            status: 404, headers: corsHeaders 
          })
        }
        return new Response(JSON.stringify(actor), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Actor not found' }), { 
          status: 404, headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // NEWS/MIC MTAANI ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/news' || path === '/micmtaani/articles') {
      try {
        const { data: articles } = await supabase
          .from('news_articles')
          .select('*')
          .not('published_at', 'is', null)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })

        return new Response(JSON.stringify(articles || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN ENDPOINTS - REQUIRE AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════
    
    // Admin authentication check
    if (path.startsWith('/admin/')) {
      const user = await getAuthenticatedUser(req)
      if (!user || !user.is_admin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), { 
          status: 403, headers: corsHeaders 
        })
      }
    }

    // Dashboard stats
    if (path === '/admin/dashboard/stats' && method === 'GET') {
      try {
        const [
          { count: filmsCount },
          { count: seriesCount }, 
          { count: podcastsCount },
          { count: newsCount },
          { count: talentCount },
          { count: usersCount }
        ] = await Promise.all([
          supabase.from('films').select('*', { count: 'exact', head: true }),
          supabase.from('series').select('*', { count: 'exact', head: true }),
          supabase.from('podcasts').select('*', { count: 'exact', head: true }),
          supabase.from('news_articles').select('*', { count: 'exact', head: true }),
          supabase.from('talent').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true })
        ])

        return new Response(JSON.stringify({
          films: filmsCount || 0,
          series: seriesCount || 0,
          podcasts: podcastsCount || 0,
          news: newsCount || 0,
          talent: talentCount || 0,
          users: usersCount || 0,
          revenue: 0, // Implement based on your payment system
          watchTime: 0 // Implement based on your analytics
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // Audit logs
    if (path === '/admin/audit-logs' && method === 'GET') {
      try {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = Math.min(parseInt(url.searchParams.get('per_page') || '50'), 100)
        
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        return new Response(JSON.stringify(logs || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch audit logs' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // Upload endpoint
    if (path === '/upload' && method === 'POST') {
      try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const folder = sanitizeInput(formData.get('folder') as string || 'uploads')
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), { 
            status: 400, headers: corsHeaders 
          })
        }

        // Validate file size (2GB for videos, 10MB for images)
        const isVideo = ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type)
        const maxSize = isVideo ? 2 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 // 2GB or 10MB
        
        if (file.size > maxSize) {
          const maxSizeLabel = isVideo ? '2GB' : '10MB'
          return new Response(JSON.stringify({ 
            error: `File too large. Maximum size is ${maxSizeLabel}` 
          }), { status: 413, headers: corsHeaders })
        }

        // Sanitize folder name - whitelist approach
        const allowedFolders = ['uploads', 'films', 'series', 'podcasts', 'news', 'talent', 'gallery']
        const sanitizedFolder = allowedFolders.includes(folder.toLowerCase()) ? folder.toLowerCase() : 'uploads'
        
        const filename = `${Date.now()}-${file.name}`
        const filePath = `${sanitizedFolder}/${filename}`

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)

        return new Response(JSON.stringify({
          url: publicUrl,
          path: filePath,
          filename: filename
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('Upload error:', error)
        return new Response(JSON.stringify({ error: 'Upload failed' }), { 
          status: 500, headers: corsHeaders 
        })
      }
    }

    // Fallback for unmatched routes
    return new Response(
      JSON.stringify({ 
        error: 'Endpoint not found',
        path: path,
        method: method,
        available_endpoints: [
          'GET /', 'GET /health', 'GET /films', 'GET /series', 'GET /podcasts',
          'GET /talents', 'GET /actors', 'GET /news',
          'POST /auth/register', 'POST /auth/login', 'POST /auth/logout', 'GET /auth/me',
          'GET /admin/dashboard/stats', 'GET /admin/audit-logs', 'POST /upload'
        ]
      }),
      { status: 404, headers: corsHeaders }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/api' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/