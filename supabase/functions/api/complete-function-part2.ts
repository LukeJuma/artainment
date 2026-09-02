serve(async (req) => {
  console.log('🚀 API Request:', req.method, new URL(req.url).pathname)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/api', '').replace('/api', '')
    const method = req.method
    
    console.log('🔍 Processing:', method, path)

    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = await req.json()
      
      const { data: user, error } = await supabase
        .from('users').select('*').eq('email', email).single()

      if (error || !user || !(await verifyPassword(password, user.password))) {
        return new Response(JSON.stringify({ message: 'Invalid credentials' }),
          { status: 401, headers: corsHeaders })
      }

      const tokenPayload = {
        id: user.id, email: user.email, is_admin: user.is_admin,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }
      const token = await createJWT(tokenPayload)

      return new Response(JSON.stringify({
        user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin },
        token
      }), { headers: corsHeaders })
    }

    if (path === '/auth/user' && method === 'GET') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }),
          { status: 401, headers: corsHeaders })
      }

      const payload = await verifyJWT(authHeader.replace('Bearer ', ''))
      if (!payload) {
        return new Response(JSON.stringify({ message: 'Invalid token' }),
          { status: 401, headers: corsHeaders })
      }

      return new Response(JSON.stringify({
        id: payload.id, email: payload.email, 
        name: payload.name || 'User', is_admin: payload.is_admin || false
      }), { headers: corsHeaders })
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN CONTENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════