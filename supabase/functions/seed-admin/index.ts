import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Admin credentials from environment
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@theartainment.co.ke'
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'SecureAdmin2024!#$'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single()

    if (existingAdmin) {
      return new Response(JSON.stringify({
        message: 'Admin user already exists',
        email: ADMIN_EMAIL
      }), { headers: corsHeaders })
    }

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: ADMIN_EMAIL,
          password: hashPassword(ADMIN_PASSWORD),
          name: 'System Administrator',
          is_admin: true,
          is_verified: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error creating admin user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      })
    }

    return new Response(JSON.stringify({
      message: 'Admin user created successfully',
      email: ADMIN_EMAIL,
      data: data?.[0]
    }), { headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    })
  }
})