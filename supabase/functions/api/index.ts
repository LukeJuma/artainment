import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts'
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

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

// Verify a password against either this function's scheme (SHA256+salt)
// or a legacy Laravel bcrypt hash. Returns which scheme matched so callers
// can transparently upgrade legacy hashes on successful login.
async function verifyPassword(plain: string, stored: string): Promise<'edge' | 'bcrypt' | null> {
  if (!plain || !stored) return null
  if ((await hashPassword(plain)) === stored) return 'edge'
  try {
    if (typeof stored === 'string' && stored.startsWith('$2') && bcrypt.compareSync(plain, stored)) {
      return 'bcrypt'
    }
  } catch {
    // Not a bcrypt hash — fall through to failure
  }
  return null
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

// Audit logging — audit_logs columns: id, action, user_id, details,
// ip_address, user_agent, created_at (no event_type/message/level).
async function logAuditEvent(eventType: string, userId?: string, metadata?: any) {
  try {
    await supabase.from('audit_logs').insert({
      action: eventType,
      user_id: userId || null,
      details: metadata || {},
      ip_address: '0.0.0.0', // Edge function limitation
      user_agent: 'Supabase Edge Function',
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
        // NOTE: films/series use the completed/in_production/upcoming vocabulary
        // (see the Laravel migrations) — there is no 'published' status.
        // Tables are `talents` and `news` (plural/singular exactly as migrated).
        const [
          { data: featuredFilm },
          { data: films },
          { data: comingSoon },
          { data: series },
          { data: services },
          { data: talent },
          { data: gallery },
          { data: news },
          { data: testimonials },
          { data: podcasts }
        ] = await Promise.all([
          supabase.from('films').select('*').eq('featured', true).in('status', ['completed', 'in_production']).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('films').select('*').in('status', ['completed', 'in_production']).order('created_at', { ascending: false }).limit(6),
          supabase.from('films').select('*').eq('status', 'upcoming').order('sort_order').limit(6),
          supabase.from('series').select('*').in('status', ['completed', 'in_production']).order('sort_order').limit(4),
          supabase.from('services').select('*').eq('active', true).order('sort_order'),
          supabase.from('talents').select('*').eq('active', true).order('sort_order').limit(5),
          supabase.from('gallery_images').select('*').order('sort_order').limit(6),
          supabase.from('news').select('*').not('published_at', 'is', null).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(3),
          supabase.from('testimonials').select('*').eq('active', true).order('sort_order'),
          supabase.from('podcasts').select('*').order('created_at', { ascending: false }).limit(6)
        ])

        return new Response(JSON.stringify({
          featured_film: featuredFilm || null,
          films: films || [],
          coming_soon: comingSoon || [],
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
        version: '2.1.0'
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

      } catch (error: any) {
        console.error('Registration error:', error)
        return new Response(JSON.stringify({ error: 'Registration failed', detail: String(error?.message || error) }), {
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

        // Get user (maybeSingle: unknown emails must 401, never 500)
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle()

        if (userError) throw new Error(`user lookup failed: ${userError.message}`)
        if (!user) {
          await logAuditEvent('LOGIN_FAILED', null, { email, reason: 'user_not_found' })
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
            status: 401, headers: corsHeaders 
          })
        }

        // Verify password (supports legacy Laravel bcrypt hashes and
        // transparently upgrades them to this function's scheme on success)
        const scheme = await verifyPassword(password, user.password)
        if (!scheme) {
          await logAuditEvent('LOGIN_FAILED', user.id, { email, reason: 'invalid_password' })
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
            status: 401, headers: corsHeaders 
          })
        }
        if (scheme === 'bcrypt') {
          try {
            await supabase.from('users').update({ password: await hashPassword(password) }).eq('id', user.id)
          } catch {
            // Non-fatal: login still succeeds with the legacy hash
          }
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

      } catch (error: any) {
        console.error('Login error:', error)
        return new Response(JSON.stringify({ error: 'Login failed', detail: String(error?.message || error) }), {
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

    // The Laravel API exposes the session user at /auth/user — support both names
    if ((path === '/auth/me' || path === '/auth/user') && method === 'GET') {
      const user = await getAuthenticatedUser(req)
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: corsHeaders
        })
      }
      return new Response(JSON.stringify({ ...user, password: undefined }), { headers: corsHeaders })
    }

    if (path === '/auth/profile' && method === 'PUT') {
      try {
        const user = await getAuthenticatedUser(req)
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: corsHeaders
          })
        }
        const body = sanitizeInput(await req.json())
        const updates: any = {}
        if (body.name) updates.name = body.name
        if (body.email && body.email !== user.email) {
          const { data: taken } = await supabase.from('users').select('id').eq('email', body.email).maybeSingle()
          if (taken) {
            return new Response(JSON.stringify({ error: 'Email already in use' }), {
              status: 422, headers: corsHeaders
            })
          }
          updates.email = body.email
        }
        if (Object.keys(updates).length === 0) {
          return new Response(JSON.stringify({ ...user, password: undefined }), { headers: corsHeaders })
        }
        const { data: updated, error } = await supabase
          .from('users').update(updates).eq('id', user.id).select().single()
        if (error) throw error
        return new Response(JSON.stringify({ ...updated, password: undefined }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Profile update failed' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    // Stateless password-reset tokens: HMAC-signed email+expiry, no table needed.
    // (Always returns success to avoid leaking which emails are registered.)
    if (path === '/auth/forgot-password' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        const email = (body.email || '').toString().trim().toLowerCase()
        if (email) {
          const { data: user } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
          if (user) await logAuditEvent('PASSWORD_RESET_REQUESTED', user.id, { email })
        }
        return new Response(JSON.stringify({ message: 'If an account with that email exists, a reset link has been sent.' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ message: 'If an account with that email exists, a reset link has been sent.' }), { headers: corsHeaders })
      }
    }

    if (path === '/auth/reset-password' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        const { token, email, password, password_confirmation } = body
        if (!token || !email || !password || password.length < 8 || password !== password_confirmation) {
          return new Response(JSON.stringify({ error: 'Invalid reset request' }), {
            status: 422, headers: corsHeaders
          })
        }
        // Token format: base64url(email).expiry_hex.hmac_hex
        const parts = String(token).split('.')
        if (parts.length !== 3) {
          return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 422, headers: corsHeaders
          })
        }
        const [emailB64, expiryHex, mac] = parts
        const expected = createHash('sha256').update(`${emailB64}.${expiryHex}.${JWT_SECRET}`).digest('hex')
        if (mac !== expected || parseInt(expiryHex, 16) < Math.floor(Date.now() / 1000)) {
          return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 422, headers: corsHeaders
          })
        }
        let tokenEmail = ''
        try {
          tokenEmail = atob(emailB64.replace(/-/g, '+').replace(/_/g, '/'))
        } catch { /* invalid */ }
        if (!tokenEmail || tokenEmail.toLowerCase() !== String(email).toLowerCase()) {
          return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { data: user } = await supabase.from('users').select('id').eq('email', tokenEmail).maybeSingle()
        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 422, headers: corsHeaders
          })
        }
        await supabase.from('users').update({ password: await hashPassword(password) }).eq('id', user.id)
        await logAuditEvent('PASSWORD_RESET_COMPLETED', user.id, { email: tokenEmail })
        return new Response(JSON.stringify({ message: 'Password reset successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Password reset failed' }), {
          status: 500, headers: corsHeaders
        })
      }
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

        // Films use completed/in_production/upcoming — public sees released films
        if (!user || !user.is_admin) {
          query = query.in('status', ['completed', 'in_production'])
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

        // Films use completed/in_production/upcoming — public sees released films
        if (!user || !user.is_admin) {
          query = query.in('status', ['completed', 'in_production'])
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

        // Series use completed/in_production/upcoming — public sees released series
        if (!user || !user.is_admin) {
          query = query.in('status', ['completed', 'in_production'])
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

        // Honor ?paginate=true (the frontend's list() helpers expect { data })
        if (url.searchParams.get('paginate')) {
          const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
          return new Response(JSON.stringify(paginate(seriesWithCounts, page, 12)), { headers: corsHeaders })
        }

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

        // Series use completed/in_production/upcoming — public sees released series
        if (!user || !user.is_admin) {
          query = query.in('status', ['completed', 'in_production'])
        }
        
        const { data: series } = await query.single()

        if (!series) {
          return new Response(JSON.stringify({ error: 'Series not found' }), { 
            status: 404, headers: corsHeaders 
          })
        }

        // Get seasons with episodes (select * : column sets differ
        // across environments, and one missing column voids the join)
        const { data: seasons } = await supabase
          .from('seasons')
          .select('*, episodes(*)')
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
        const paginateParam = url.searchParams.get('paginate')
        const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)

        const { data: podcasts } = await supabase
          .from('podcasts')
          .select('*')
          .order('created_at', { ascending: false })

        // Honor ?paginate=true (the frontend's list() helpers expect { data })
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(podcasts || [], page, 12)), { headers: corsHeaders })
        }

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

    if (path.startsWith('/podcasts/') && method === 'GET') {
      try {
        const slug = decodeURIComponent(path.replace('/podcasts/', ''))
        const { data: podcast } = await supabase
          .from('podcasts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (!podcast) {
          return new Response(JSON.stringify({ error: 'Podcast not found' }), {
            status: 404, headers: corsHeaders
          })
        }

        const { data: episodes } = await supabase
          .from('podcast_episodes')
          .select('*')
          .eq('podcast_id', podcast.id)
          .order('published_at', { ascending: false })

        return new Response(JSON.stringify({ ...podcast, episodes: episodes || [] }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Podcast not found' }), {
          status: 404, headers: corsHeaders
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SIMPLE PUBLIC CONTENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    if (path === '/services' && method === 'GET') {
      const { data } = await supabase.from('services').select('*').eq('active', true).order('sort_order')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/productions' && method === 'GET') {
      const { data } = await supabase.from('productions').select('*').order('sort_order')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/testimonials' && method === 'GET') {
      const { data } = await supabase.from('testimonials').select('*').eq('active', true).order('sort_order')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/gallery' && method === 'GET') {
      const { data } = await supabase.from('gallery_images').select('*').order('sort_order')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/contact' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        if (!body.name || !body.email || !body.message) {
          return new Response(JSON.stringify({ error: 'Name, email and message are required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { error } = await supabase.from('contacts').insert({
          name: body.name, email: body.email,
          service: body.service || null, message: body.message,
          status: 'pending',
        })
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Message sent successfully' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to send message' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path === '/subscribe' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        if (!body.email) {
          return new Response(JSON.stringify({ error: 'Email is required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { error } = await supabase.from('subscribers').insert({ email: body.email })
        if (error && !String(error.message || '').toLowerCase().includes('duplicate')) throw error
        return new Response(JSON.stringify({ message: 'Successfully subscribed to our newsletter.' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Subscription failed. Please try again.' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path === '/reviews' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        if (!body.name || !body.rating) {
          return new Response(JSON.stringify({ error: 'Name and rating are required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { data, error } = await supabase.from('reviews').insert({
          film_id: body.film_id || null, name: body.name,
          rating: body.rating, comment: body.comment || null,
          is_approved: false,
        }).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit review' }), {
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
          .from('talents')
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
          .from('talents')
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
    
    if (path === '/news') {
      try {
        const paginateParam = url.searchParams.get('paginate')
        const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)

        const { data: articles } = await supabase
          .from('news')
          .select('*')
          .not('published_at', 'is', null)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })

        // Honor ?paginate=true (the frontend's list() helpers expect { data })
        if (paginateParam) {
          return new Response(JSON.stringify(paginate(articles || [], page, 12)), { headers: corsHeaders })
        }

        return new Response(JSON.stringify(articles || []), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path.startsWith('/news/') && method === 'GET') {
      try {
        const slug = decodeURIComponent(path.replace('/news/', ''))
        const { data: article } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404, headers: corsHeaders
          })
        }
        return new Response(JSON.stringify(article), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Article not found' }), {
          status: 404, headers: corsHeaders
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // MIC MTAANI PUBLIC ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    if (path === '/micmtaani' && method === 'GET') {
      try {
        const now = new Date().toISOString()
        const [
          { data: breaking },
          { data: featured },
          { data: latest },
          { data: categories },
          { data: trending },
          { data: events },
          { data: businesses },
        ] = await Promise.all([
          supabase.from('mic_mtaani_articles').select('*').eq('status', 'published').eq('is_breaking', true).order('published_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('mic_mtaani_articles').select('*').eq('status', 'published').eq('is_featured', true).order('published_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('mic_mtaani_articles').select('*').eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false }).limit(6),
          supabase.from('mic_mtaani_categories').select('*').order('sort_order'),
          supabase.from('mic_mtaani_articles').select('id, headline, slug, views, published_at, category_id').eq('status', 'published').order('views', { ascending: false }).limit(5),
          supabase.from('mic_mtaani_events').select('*').gte('starts_at', now).order('starts_at').limit(4),
          supabase.from('mic_mtaani_businesses').select('*').eq('is_featured', true).limit(6),
        ])
        return new Response(JSON.stringify({
          breaking: breaking || null, featured: featured || null,
          latest: latest || [], categories: categories || [],
          trending: trending || [], events: events || [], businesses: businesses || [],
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch Mic Mtaani homepage' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path === '/micmtaani/articles' && method === 'GET') {
      try {
        const category = url.searchParams.get('category')
        const tag = url.searchParams.get('tag')
        const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
        const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '12'), 50)

        let categoryId: number | null = null
        if (category) {
          const { data: cat } = await supabase.from('mic_mtaani_categories').select('id').eq('slug', category).maybeSingle()
          categoryId = cat ? cat.id : -1
        }

        let query = supabase.from('mic_mtaani_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (categoryId !== null) query = query.eq('category_id', categoryId)
        if (tag) query = query.contains('tags', [tag])

        const { data: articles } = await query
        // Attach categories in one extra query (avoids guessing the FK constraint name)
        const catIds = [...new Set((articles || []).map((a: any) => a.category_id).filter(Boolean))]
        let catMap: Record<number, any> = {}
        if (catIds.length > 0) {
          const { data: cats } = await supabase.from('mic_mtaani_categories').select('*').in('id', catIds)
          for (const c of cats || []) catMap[c.id] = c
        }
        const shaped = (articles || []).map((a: any) => ({
          ...a,
          category: (a.category_id && catMap[a.category_id]) || null,
        }))
        const total = shaped.length
        const paged = shaped.slice((page - 1) * perPage, page * perPage)
        return new Response(JSON.stringify({
          data: paged, current_page: page,
          last_page: Math.max(Math.ceil(total / perPage), 1),
          per_page: perPage, total,
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path.startsWith('/micmtaani/articles/') && path.endsWith('/comments') && method === 'POST') {
      try {
        const slug = decodeURIComponent(path.replace('/micmtaani/articles/', '').replace('/comments', ''))
        const body = sanitizeInput(await req.json())
        if (!body.name || !body.body) {
          return new Response(JSON.stringify({ error: 'Name and comment are required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { data: article } = await supabase.from('mic_mtaani_articles').select('id').eq('slug', slug).maybeSingle()
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404, headers: corsHeaders
          })
        }
        const { error } = await supabase.from('mic_mtaani_comments').insert({
          article_id: article.id, name: body.name, body: body.body, is_approved: false,
        })
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Comment submitted for review.' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit comment' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path.startsWith('/micmtaani/articles/') && method === 'GET') {
      try {
        const slug = decodeURIComponent(path.replace('/micmtaani/articles/', ''))
        const { data: article } = await supabase
          .from('mic_mtaani_articles').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
        if (!article) {
          return new Response(JSON.stringify({ error: 'Article not found' }), {
            status: 404, headers: corsHeaders
          })
        }
        // Best-effort view count (non-blocking on failure)
        try {
          await supabase.from('mic_mtaani_articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id)
          article.views = (article.views || 0) + 1
        } catch { /* ignore */ }

        const [{ data: category }, { data: author }, { data: comments }, { data: related }] = await Promise.all([
          article.category_id
            ? supabase.from('mic_mtaani_categories').select('*').eq('id', article.category_id).maybeSingle()
            : Promise.resolve({ data: null }),
          article.author_id
            ? supabase.from('users').select('id, name').eq('id', article.author_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('mic_mtaani_comments').select('*').eq('article_id', article.id).eq('is_approved', true).order('created_at'),
          supabase.from('mic_mtaani_articles').select('*').eq('status', 'published').neq('id', article.id)
            .order('published_at', { ascending: false }).limit(3),
        ])
        return new Response(JSON.stringify({
          article: { ...article, category: category || null, author: author || null, comments: comments || [] },
          related: related || [],
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Article not found' }), {
          status: 404, headers: corsHeaders
        })
      }
    }

    if (path === '/micmtaani/categories' && method === 'GET') {
      const { data } = await supabase.from('mic_mtaani_categories').select('*').order('sort_order')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/micmtaani/journalists' && method === 'GET') {
      const { data } = await supabase.from('mic_mtaani_journalists').select('*').eq('is_active', true)
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path.startsWith('/micmtaani/journalists/') && method === 'GET') {
      try {
        const slug = decodeURIComponent(path.replace('/micmtaani/journalists/', ''))
        const { data: journalist } = await supabase
          .from('mic_mtaani_journalists').select('*').eq('slug', slug).maybeSingle()
        if (!journalist) {
          return new Response(JSON.stringify({ error: 'Journalist not found' }), {
            status: 404, headers: corsHeaders
          })
        }
        // Legacy join: articles.author_id references the journalist's user_id
        const { data: articles } = await supabase.from('mic_mtaani_articles')
          .select('*').eq('status', 'published').eq('author_id', journalist.user_id)
          .order('published_at', { ascending: false })
        return new Response(JSON.stringify({ journalist, articles: articles || [] }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Journalist not found' }), {
          status: 404, headers: corsHeaders
        })
      }
    }

    if (path === '/micmtaani/events' && method === 'GET') {
      const { data } = await supabase.from('mic_mtaani_events').select('*').order('starts_at')
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path === '/micmtaani/businesses' && method === 'GET') {
      const { data } = await supabase.from('mic_mtaani_businesses').select('*').order('is_featured', { ascending: false })
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }

    if (path.startsWith('/micmtaani/businesses/') && method === 'GET') {
      try {
        const slug = decodeURIComponent(path.replace('/micmtaani/businesses/', ''))
        const { data: business } = await supabase
          .from('mic_mtaani_businesses').select('*').eq('slug', slug).maybeSingle()
        if (!business) {
          return new Response(JSON.stringify({ error: 'Business not found' }), {
            status: 404, headers: corsHeaders
          })
        }
        return new Response(JSON.stringify(business), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Business not found' }), {
          status: 404, headers: corsHeaders
        })
      }
    }

    if (path === '/micmtaani/search' && method === 'GET') {
      try {
        const q = (url.searchParams.get('q') || '').trim()
        if (!q) return new Response(JSON.stringify({ articles: [], query: q }), { headers: corsHeaders })
        const like = `%${q.replace(/[%_]/g, '')}%`
        const { data } = await supabase.from('mic_mtaani_articles').select('*')
          .eq('status', 'published')
          .or(`headline.ilike.${like},subtitle.ilike.${like}`)
          .order('published_at', { ascending: false }).limit(20)
        return new Response(JSON.stringify({ articles: data || [], query: q }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ articles: [], query: '' }), { headers: corsHeaders })
      }
    }

    if (path === '/micmtaani/submit' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        if (!body.title || !body.description || !body.submitter_name || !body.submitter_email) {
          return new Response(JSON.stringify({ error: 'Title, description, name and email are required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { error } = await supabase.from('mic_mtaani_submissions').insert({
          type: body.type || 'story', title: body.title, description: body.description,
          submitter_name: body.submitter_name, submitter_email: body.submitter_email,
          status: 'pending',
        })
        if (error) throw error
        return new Response(JSON.stringify({ message: 'Submission received. Thank you!' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Submission failed. Please try again.' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    if (path === '/micmtaani/subscribe' && method === 'POST') {
      try {
        const body = sanitizeInput(await req.json())
        if (!body.email) {
          return new Response(JSON.stringify({ error: 'Email is required' }), {
            status: 422, headers: corsHeaders
          })
        }
        const { error } = await supabase.from('mic_mtaani_newsletter_subscribers').insert({
          email: body.email, name: body.name || null, frequency: 'weekly',
        })
        if (error && !String(error.message || '').toLowerCase().includes('duplicate')) throw error
        return new Response(JSON.stringify({ message: 'Subscribed successfully!' }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Subscription failed. Please try again.' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // VIDEO STREAM ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    // Public trailer/proxy stream: HTTP(S) URLs redirect away; anything
    // else is resolved against the `media` storage bucket and redirected
    // to its public URL (mirrors the Laravel VideoStreamController).
    if (path === '/stream' && method === 'GET') {
      const file = url.searchParams.get('file') || ''
      if (!file) {
        return new Response(JSON.stringify({ error: 'The file parameter is required' }), {
          status: 422, headers: corsHeaders
        })
      }
      if (/^https?:\/\//i.test(file) || file.startsWith('//')) {
        return Response.redirect(file.startsWith('//') ? `https:${file}` : file, 302)
      }
      if (file.includes('..')) {
        return new Response(JSON.stringify({ error: 'Invalid file path' }), {
          status: 422, headers: corsHeaders
        })
      }
      const storagePath = file.replace(/^\/+/, '').replace(/^storage\//, '')
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(storagePath)
      return Response.redirect(publicUrl, 302)
    }

    // Protected full-film stream: requires auth + active subscription.
    // YouTube films redirect straight to YouTube; uploads redirect to storage.
    if (path.startsWith('/stream/') && method === 'GET') {
      const user = await getAuthenticatedUser(req)
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: corsHeaders
        })
      }
      const slug = decodeURIComponent(path.replace('/stream/', ''))
      const { data: film } = await supabase.from('films').select('*').eq('slug', slug).maybeSingle()
      if (!film) {
        return new Response(JSON.stringify({ error: 'Film not found' }), {
          status: 404, headers: corsHeaders
        })
      }
      if (!user.is_admin) {
        const now = new Date().toISOString()
        const { data: sub } = await supabase.from('subscriptions').select('id')
          .eq('user_id', user.id).eq('status', 'active')
          .or(`ends_at.is.null,ends_at.gt.${now}`)
          .order('created_at', { ascending: false }).limit(1).maybeSingle()
        if (!sub) {
          return new Response(JSON.stringify({ error: 'Active subscription required', code: 'subscription_required' }), {
            status: 403, headers: corsHeaders
          })
        }
      }
      const target = film.youtube_url || film.full_video_url
      if (!target) {
        return new Response(JSON.stringify({ error: 'No playable source for this film' }), {
          status: 404, headers: corsHeaders
        })
      }
      if (/^https?:\/\//i.test(target)) return Response.redirect(target, 302)
      const storagePath = String(target).replace(/^\/+/, '').replace(/^storage\//, '')
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(storagePath)
      return Response.redirect(publicUrl, 302)
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

    // Dashboard stats — must match the DashboardStats shape the admin
    // Dashboard page reads (a missing nested key crashes the page).
    if (path === '/admin/dashboard/stats' && method === 'GET') {
      try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const startOfWeek = new Date(now.getTime() - 7 * 86400000).toISOString()
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString()

        const countOf = async (table: string) => {
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
          return count || 0
        }

        const [
          filmsCount, seriesCount, podcastsCount, newsCount, talentCount,
          servicesCount, galleryCount, testimonialsCount,
          usersCount, newMonthCount, newTodayCount, activeSubsCount,
          articlesCount, categoriesCount, eventsCount,
          payments, ticketsSold,
          latestUsers, latestFilms, latestNews, topFilms,
        ] = await Promise.all([
          countOf('films'), countOf('series'), countOf('podcasts'), countOf('news'),
          countOf('talents'), countOf('services'), countOf('gallery_images'), countOf('testimonials'),
          countOf('users'),
          supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth).then(r => r.count || 0),
          supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).then(r => r.count || 0),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true })
            .eq('status', 'active').or(`ends_at.is.null,ends_at.gt.${now.toISOString()}`).then(r => r.count || 0),
          countOf('mic_mtaani_articles'), countOf('mic_mtaani_categories'), countOf('mic_mtaani_events'),
          supabase.from('payments').select('amount, status, paid_at, description').then(r => r.data || []),
          supabase.from('tickets').select('sold').then(r => (r.data || []).reduce((s: number, t: any) => s + (t.sold || 0), 0)),
          supabase.from('users').select('id, name, created_at').order('created_at', { ascending: false }).limit(5).then(r => r.data || []),
          supabase.from('films').select('id, title, created_at').order('created_at', { ascending: false }).limit(3).then(r => r.data || []),
          supabase.from('news').select('id, title, published_at').order('published_at', { ascending: false }).limit(3).then(r => r.data || []),
          supabase.from('films').select('id, title, rating, genre, year, poster_url, slug').order('rating', { ascending: false }).limit(5).then(r => r.data || []),
        ])

        const okPayments = payments.filter((p: any) => p.status === 'success')
        const sumIn = (rows: any[], since?: string) =>
          rows.filter(p => !since || (p.paid_at && p.paid_at >= since)).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
        const has = (p: any, word: string) => String(p.description || '').toLowerCase().includes(word)

        // Last 6 calendar months of revenue, oldest first
        const monthly_revenue = []
        for (let back = 5; back >= 0; back--) {
          const d = new Date(now.getFullYear(), now.getMonth() - back, 1)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const inMonth = okPayments.filter((p: any) => typeof p.paid_at === 'string' && p.paid_at.startsWith(key))
          monthly_revenue.push({
            month: d.toLocaleString('en-US', { month: 'short' }),
            revenue: inMonth.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
            subscriptions: inMonth.filter((p: any) => has(p, 'subscription')).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
            tickets: inMonth.filter((p: any) => has(p, 'ticket')).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
            streaming: inMonth.filter((p: any) => !has(p, 'subscription') && !has(p, 'ticket')).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0),
          })
        }

        const timeAgo = (iso: string | null) => {
          if (!iso) return 'recently'
          const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
          if (mins < 1) return 'just now'
          if (mins < 60) return `${mins}m ago`
          const hrs = Math.floor(mins / 60)
          if (hrs < 24) return `${hrs}h ago`
          return `${Math.floor(hrs / 24)}d ago`
        }

        const recent_activity = [
          ...latestUsers.map((u: any) => ({ type: 'user', label: 'New user registration', desc: `${u.name} created an account`, time: timeAgo(u.created_at) })),
          ...latestFilms.map((f: any) => ({ type: 'film', label: 'Film added', desc: `"${f.title}" was published`, time: timeAgo(f.created_at) })),
          ...latestNews.map((n: any) => ({ type: 'news', label: 'News published', desc: n.title, time: timeAgo(n.published_at) })),
        ].slice(0, 10)

        return new Response(JSON.stringify({
          content_counts: {
            films: filmsCount, series: seriesCount, podcasts: podcastsCount, news: newsCount,
            talent: talentCount, services: servicesCount, gallery: galleryCount, testimonials: testimonialsCount,
          },
          user_counts: {
            total_users: usersCount, new_this_month: newMonthCount,
            new_today: newTodayCount, active_subscribers: activeSubsCount,
          },
          revenue: {
            total_all_time: sumIn(okPayments),
            this_month: sumIn(okPayments, startOfMonth),
            this_week: sumIn(okPayments, startOfWeek),
            today: sumIn(okPayments, startOfDay),
          },
          monthly_revenue,
          ticket_stats: { total_sold: ticketsSold, this_month: 0 },
          mic_mtaani: { articles: articlesCount, categories: categoriesCount, events: eventsCount },
          recent_activity,
          top_films: topFilms,
          // Compact aliases kept for older admin screens
          films: filmsCount, users: usersCount,
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch stats' }),
          { status: 500, headers: corsHeaders })
      }
    }

    // Audit logs — paginated shape the Logs page reads (logs.data)
    if (path === '/admin/audit-logs' && method === 'GET') {
      try {
        const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
        const limit = Math.min(parseInt(url.searchParams.get('per_page') || '50'), 100)

        // Prefer the user join; fall back to plain rows when the FK
        // constraint name differs in this database.
        let logQuery = supabase
          .from('audit_logs')
          .select('*, users!audit_logs_user_id_fkey(id, name, email)', { count: 'exact' })
        let logRes = await logQuery
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)
        if (logRes.error) {
          logRes = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)
        }
        const rows = logRes.data || []

        const mapped = rows.map((l: any) => {
          const evt = String(l.action || 'INFO')
          const level = /fail|error|denied|reject/i.test(evt) ? 'ERROR' : (/warn/i.test(evt) ? 'WARN' : 'INFO')
          const details = typeof l.details === 'object' && l.details !== null ? l.details : null
          return {
            id: l.id,
            action: evt,
            message: (details && (details.email || details.reason)) || evt,
            level,
            user: l.users || (l.user_id ? { id: l.user_id } : undefined),
            ip_address: l.ip_address,
            user_agent: l.user_agent,
            created_at: l.created_at,
            time_ago: l.created_at,
          }
        })
        const total = logRes.count ?? mapped.length
        return new Response(JSON.stringify({
          data: mapped, current_page: page,
          last_page: Math.max(Math.ceil(total / limit), 1),
          per_page: limit, total,
        }), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch audit logs' }),
          { status: 500, headers: corsHeaders })
      }
    }

    // ── Admin specials (must come before the generic CRUD matcher) ──

    // Audit-log stats — shape the Logs page reads (stats.stats.*)
    if (path === '/admin/audit-logs/stats' && method === 'GET') {
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      const [all, today] = await Promise.all([
        supabase.from('audit_logs').select('action, user_id, created_at'),
        supabase.from('audit_logs').select('action, user_id')
          .gte('created_at', dayStart.toISOString()),
      ])
      const rows = all.data || []
      const todayRows = today.data || []
      const isErr = (e: string) => /fail|error|denied|reject/i.test(String(e || ''))
      return new Response(JSON.stringify({
        stats: {
          total_logs: rows.length,
          logs_today: todayRows.length,
          error_logs_today: todayRows.filter((l: any) => isErr(l.action)).length,
          unique_users_today: new Set(todayRows.map((l: any) => l.user_id).filter(Boolean)).size,
        },
        recent_actions: rows.slice(0, 8).map((l: any) => ({
          action: l.action, created_at: l.created_at,
        })),
      }), { headers: corsHeaders })
    }

    // Users (never expose password hashes)
    if (path === '/admin/users' && method === 'GET') {
      const { data } = await supabase.from('users')
        .select('id, name, email, is_admin, created_at').order('created_at', { ascending: false })
      return new Response(JSON.stringify(data || []), { headers: corsHeaders })
    }
    {
      const m = path.match(/^\/admin\/users\/(\d+)\/role$/)
      if (m && method === 'PUT') {
        const body = sanitizeInput(await req.json())
        const { data, error } = await supabase.from('users')
          .update({ is_admin: Boolean(body.is_admin) }).eq('id', Number(m[1]))
          .select('id, name, email, is_admin, created_at').single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      }
    }

    // Settings: GET returns a key=>value object; PUT upserts { settings: {...} }
    if (path === '/admin/settings' && method === 'GET') {
      try {
        const { data } = await supabase.from('settings').select('key, value')
        const out: any = {}
        for (const row of data || []) out[row.key] = row.value
        return new Response(JSON.stringify(out), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({}), { headers: corsHeaders })
      }
    }
    if (path === '/admin/settings' && method === 'PUT') {
      try {
        const body = sanitizeInput(await req.json())
        const settings = body.settings || body
        for (const [key, value] of Object.entries(settings || {})) {
          await supabase.from('settings').upsert({ key, value: String(value ?? '') }, { onConflict: 'key' })
        }
        const { data } = await supabase.from('settings').select('key, value')
        const out: any = {}
        for (const row of data || []) out[row.key] = row.value
        return new Response(JSON.stringify(out), { headers: corsHeaders })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
          status: 500, headers: corsHeaders
        })
      }
    }

    // Mic Mtaani submissions moderation
    if (path === '/admin/micmtaani/submissions' && method === 'GET') {
      const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
      const { data } = await supabase.from('mic_mtaani_submissions').select('*').order('created_at', { ascending: false })
      return new Response(JSON.stringify(paginate(data || [], page, 12)), { headers: corsHeaders })
    }
    {
      const m = path.match(/^\/admin\/micmtaani\/submissions\/(\d+)\/(approve|reject)$/)
      if (m && method === 'POST') {
        const { data, error } = await supabase.from('mic_mtaani_submissions')
          .update({ status: m[2] === 'approve' ? 'approved' : 'rejected' }).eq('id', Number(m[1])).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      }
    }
    if (path === '/admin/micmtaani/comments' && method === 'GET') {
      const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
      const { data } = await supabase.from('mic_mtaani_comments').select('*')
        .eq('is_approved', false).order('created_at', { ascending: false })
      return new Response(JSON.stringify(paginate(data || [], page, 12)), { headers: corsHeaders })
    }
    {
      const m = path.match(/^\/admin\/micmtaani\/comments\/(\d+)\/approve$/)
      if (m && method === 'POST') {
        const { data, error } = await supabase.from('mic_mtaani_comments')
          .update({ is_approved: true }).eq('id', Number(m[1])).select().single()
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: corsHeaders })
      }
    }

    // Nested: series seasons, season episodes, podcast episodes
    {
      const m = path.match(/^\/admin\/series\/(\d+)\/seasons$/)
      if (m) {
        const seriesId = Number(m[1])
        if (method === 'GET') {
          const { data } = await supabase.from('seasons').select('*').eq('series_id', seriesId).order('season_number')
          return new Response(JSON.stringify(data || []), { headers: corsHeaders })
        }
        if (method === 'POST') {
          const body = sanitizeInput(await req.json())
          const { data, error } = await supabase.from('seasons')
            .insert({ ...body, series_id: seriesId }).select().single()
          if (error) throw error
          return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders })
        }
      }
    }
    {
      const m = path.match(/^\/admin\/seasons\/(\d+)\/episodes$/)
      if (m) {
        const seasonId = Number(m[1])
        if (method === 'GET') {
          const { data } = await supabase.from('episodes').select('*').eq('season_id', seasonId).order('episode_number')
          return new Response(JSON.stringify(data || []), { headers: corsHeaders })
        }
        if (method === 'POST') {
          const body = sanitizeInput(await req.json())
          const { data, error } = await supabase.from('episodes')
            .insert({ ...body, season_id: seasonId }).select().single()
          if (error) throw error
          return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders })
        }
      }
    }
    {
      const m = path.match(/^\/admin\/podcasts\/(\d+)\/episodes$/)
      if (m) {
        const podcastId = Number(m[1])
        if (method === 'GET') {
          const { data } = await supabase.from('podcast_episodes').select('*')
            .eq('podcast_id', podcastId).order('published_at', { ascending: false })
          return new Response(JSON.stringify(data || []), { headers: corsHeaders })
        }
        if (method === 'POST') {
          const body = sanitizeInput(await req.json())
          const { data, error } = await supabase.from('podcast_episodes')
            .insert({ ...body, podcast_id: podcastId }).select().single()
          if (error) throw error
          return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders })
        }
      }
    }

    // ── Generic admin CRUD ──
    // Covers every other /admin/<resource>[/<id>] route via allowlisted tables.
    {
      const ADMIN_TABLES: Record<string, string> = {
        'films': 'films', 'series': 'series', 'podcasts': 'podcasts',
        'services': 'services', 'talents': 'talents', 'productions': 'productions',
        'news': 'news', 'testimonials': 'testimonials', 'gallery': 'gallery_images',
        'contacts': 'contacts', 'reviews': 'reviews', 'tickets': 'tickets',
        'notifications': 'notifications', 'seasons': 'seasons', 'episodes': 'episodes',
        'podcast-episodes': 'podcast_episodes', 'users': 'users',
        'micmtaani/articles': 'mic_mtaani_articles',
        'micmtaani/categories': 'mic_mtaani_categories',
        'micmtaani/journalists': 'mic_mtaani_journalists',
        'micmtaani/events': 'mic_mtaani_events',
        'micmtaani/businesses': 'mic_mtaani_businesses',
        'micmtaani/submissions': 'mic_mtaani_submissions',
        'micmtaani/comments': 'mic_mtaani_comments',
        'subscription-plans': 'subscription_plans',
        'subscriptions': 'subscriptions', 'payments': 'payments',
      }
      const crud = path.match(/^\/admin\/([\w\-\/]+?)(?:\/(\d+))?$/)
      if (crud && ADMIN_TABLES[crud[1]]) {
        const table = ADMIN_TABLES[crud[1]]
        const id = crud[2] ? Number(crud[2]) : null
        const selectCols = table === 'users' ? 'id, name, email, is_admin, created_at' : '*'
        try {
          if (method === 'GET') {
            if (id) {
              const { data, error } = await supabase.from(table).select(selectCols).eq('id', id).maybeSingle()
              if (error) throw error
              if (!data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders })
              return new Response(JSON.stringify(data), { headers: corsHeaders })
            }
            const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
            const wantsPagination = table === 'mic_mtaani_articles'
            let query = supabase.from(table).select(selectCols).order('id', { ascending: false })
            if (wantsPagination) {
              const { data } = await query
              return new Response(JSON.stringify(paginate(data || [], page, 12)), { headers: corsHeaders })
            }
            const { data, error } = await query
            if (error) throw error
            return new Response(JSON.stringify(data || []), { headers: corsHeaders })
          }
          if (method === 'POST') {
            const body = sanitizeInput(await req.json())
            // Auto-slug common title fields when the client omits slug —
            // only for tables that actually have a slug column.
            const SLUGGED = new Set(['films', 'series', 'podcasts', 'talents', 'productions', 'news', 'micmtaani_articles', 'micmtaani_categories', 'micmtaani_journalists', 'micmtaani_events', 'micmtaani_businesses'])
            if (SLUGGED.has(table) && !body.slug && (body.title || body.headline || body.name)) {
              body.slug = String(body.title || body.headline || body.name)
                .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            }
            // Never store a plain-text password (admin-created users)
            if (table === 'users') {
              if (!body.password) {
                return new Response(JSON.stringify({ error: 'Password is required' }), {
                  status: 422, headers: corsHeaders
                })
              }
              body.password = await hashPassword(body.password)
              delete body.is_admin // role changes go through /users/:id/role
            }
            const { data, error } = await supabase.from(table).insert(body).select(selectCols).single()
            if (error) throw error
            return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders })
          }
          if ((method === 'PUT' || method === 'PATCH') && id) {
            const body = sanitizeInput(await req.json())
            // Never store a plain-text password: hash it like the app does
            if (table === 'users' && body.password) body.password = await hashPassword(body.password)
            const { data, error } = await supabase.from(table).update(body).eq('id', id).select(selectCols).single()
            if (error) throw error
            return new Response(JSON.stringify(data), { headers: corsHeaders })
          }
          if (method === 'DELETE' && id) {
            const { error } = await supabase.from(table).delete().eq('id', id)
            if (error) throw error
            return new Response(JSON.stringify({ message: 'Deleted' }), { headers: corsHeaders })
          }
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message || 'Request failed' }), {
            status: 422, headers: corsHeaders
          })
        }
      }
    }

    // Upload endpoint (multipart form only)
    if (path === '/upload' && method === 'POST') {
      let formData: FormData
      try {
        formData = await req.formData()
      } catch {
        return new Response(JSON.stringify({ error: 'Send the file as multipart form data' }), {
          status: 400, headers: corsHeaders
        })
      }
      try {
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

        // Sanitize folder name - whitelist approach (mirrors Laravel UploadController)
        const allowedFolders = ['uploads', 'films', 'series', 'podcasts', 'news', 'talent', 'gallery', 'posters', 'thumbnails', 'mic-mtaani', 'trailers']
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
          'GET /', 'GET /health', 'GET /home',
          'GET /films', 'GET /films/:slug',
          'GET /series', 'GET /series/:slug',
          'GET /podcasts', 'GET /podcasts/:slug',
          'GET /talents|/actors', 'GET /talents|/actors/:slug',
          'GET /news', 'GET /news/:slug',
          'GET /services', 'GET /productions', 'GET /testimonials', 'GET /gallery',
          'POST /contact', 'POST /subscribe', 'POST /reviews',
          'GET /stream?file=', 'GET /stream/:slug (auth + subscription)',
          'GET /micmtaani', 'GET /micmtaani/articles', 'GET /micmtaani/articles/:slug',
          'POST /micmtaani/articles/:slug/comments', 'GET /micmtaani/categories',
          'GET /micmtaani/journalists', 'GET /micmtaani/journalists/:slug',
          'GET /micmtaani/events', 'GET /micmtaani/businesses', 'GET /micmtaani/businesses/:slug',
          'GET /micmtaani/search', 'POST /micmtaani/submit', 'POST /micmtaani/subscribe',
          'POST /auth/register', 'POST /auth/login', 'POST /auth/logout',
          'GET /auth/me|/auth/user', 'PUT /auth/profile',
          'POST /auth/forgot-password', 'POST /auth/reset-password',
          'GET /admin/dashboard/stats', 'GET /admin/audit-logs', 'GET /admin/audit-logs/stats',
          'GET /admin/users', 'PUT /admin/users/:id/role', 'DELETE /admin/users/:id',
          'GET|PUT /admin/settings', 'GET /admin/<resource>', 'POST /admin/<resource>',
          'PUT|DELETE /admin/<resource>/:id', 'POST /upload'
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