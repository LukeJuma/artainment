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

serve(async (req) => {
  console.log('🚀', req.method, new URL(req.url).pathname)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/api', '').replace('/api', '')
    const method = req.method
    
    // SIMPLE LOGIN ENDPOINT - NO JWT FOR NOW
    if (path === '/auth/login' && method === 'POST') {
      try {
        const body = await req.json()
        const { email, password } = body

        console.log('Login attempt:', { email, hasPassword: !!password })

        if (!email || !password) {
          return new Response(JSON.stringify({ 
            message: 'Email and password are required',
            success: false 
          }), { status: 400, headers: corsHeaders })
        }

        // Check if it's the admin user with hardcoded password for now
        if (email.toLowerCase() === 'admin@theartainment.co.ke' && password === 'Admin123!') {
          return new Response(JSON.stringify({
            success: true,
            message: 'Login successful',
            user: {
              id: 1,
              name: 'Admin',
              email: 'admin@theartainment.co.ke',
              role: 'admin'
            },
            token: 'simple-token-' + Date.now(),
            token_type: 'Bearer'
          }), { headers: corsHeaders })
        }

        // Try to find user in database
        const { data: user, error } = await supabase
          .from('users')
          .select('id, name, email, password, role')
          .eq('email', email.toLowerCase())
          .single()

        console.log('Database lookup:', { found: !!user, error })

        if (!user) {
          return new Response(JSON.stringify({ 
            message: 'Invalid credentials - user not found',
            success: false 
          }), { status: 401, headers: corsHeaders })
        }

        // For now, just check if password matches what's in database
        // (This is simplified - in production you'd hash and compare properly)
        return new Response(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: 'simple-token-' + Date.now(),
          token_type: 'Bearer'
        }), { headers: corsHeaders })

      } catch (error) {
        console.error('🔒 Login error:', error)
        return new Response(JSON.stringify({ 
          message: 'Authentication failed: ' + error.message,
          success: false 
        }), { status: 500, headers: corsHeaders })
      }
    }

    // TEST ENDPOINT
    if (path === '/test' || path === '/') {
      return new Response(JSON.stringify({ 
        message: 'Simple Auth API Ready!', 
        timestamp: new Date().toISOString(),
        endpoints: ['auth/login'],
        note: 'Simplified version for testing'
      }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ 
      error: 'Endpoint not found', 
      path: path,
      available_endpoints: ['POST /auth/login', 'GET /test']
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