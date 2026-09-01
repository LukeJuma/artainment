import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Comprehensive CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, x-requested-with, cache-control, pragma',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  console.log('🚀 API Request:', req.method, new URL(req.url).pathname)
  
  // Always handle CORS first
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS Preflight request')
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/api', '').replace('/api', '')
    
    console.log('🔍 Processing path:', path)

    // Test endpoint
    if (path === '/test' || path === '/') {
      return new Response(
        JSON.stringify({ 
          message: 'API is working!', 
          timestamp: new Date().toISOString(),
          cors: 'enabled' 
        }),
        { 
          status: 200,
          headers: corsHeaders 
        }
      )
    }

    // Home endpoint
    if (path === '/home') {
      console.log('🏠 Fetching home data...')
      
      try {
        // Get films
        const { data: films } = await supabase
          .from('films')
          .select('*')
          .eq('status', 'completed')
          .order('sort_order')
          .limit(8)

        // Get talent 
        const { data: talent } = await supabase
          .from('talent')
          .select('*')
          .eq('active', true)
          .order('sort_order')
          .limit(6)

        // Get news
        const { data: news } = await supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(4)

        // Get services
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        console.log('📊 Data counts:', {
          films: films?.length || 0,
          talent: talent?.length || 0, 
          news: news?.length || 0,
          services: services?.length || 0
        })

        const responseData = {
          films: films || [],
          talent: talent || [],
          news: news || [],
          services: services || [],
          message: 'Home data loaded successfully'
        }

        return new Response(
          JSON.stringify(responseData),
          { 
            status: 200,
            headers: corsHeaders 
          }
        )

      } catch (dbError) {
        console.error('❌ Database error:', dbError)
        return new Response(
          JSON.stringify({ 
            error: 'Database error', 
            details: dbError.message,
            cors: 'enabled'
          }),
          { 
            status: 500,
            headers: corsHeaders 
          }
        )
      }
    }

    // Default 404
    return new Response(
      JSON.stringify({ 
        error: 'Endpoint not found', 
        path: path,
        cors: 'enabled'
      }),
      { 
        status: 404,
        headers: corsHeaders 
      }
    )

  } catch (error) {
    console.error('💥 Server error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message,
        cors: 'enabled'
      }),
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
})