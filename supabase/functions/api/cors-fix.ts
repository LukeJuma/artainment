import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Comprehensive CORS headers
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

    // Films endpoints
    if (path === '/films') {
      console.log('🎬 Fetching films list...')
      
      try {
        const { data: films } = await supabase
          .from('films')
          .select('*')
          .eq('status', 'completed')
          .order('sort_order')

        return new Response(
          JSON.stringify({ data: films || [], message: 'Films loaded successfully' }),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Films error:', error)
        return new Response(
          JSON.stringify({ error: 'Films error', details: error.message }),
          { status: 500, headers: corsHeaders }
        )
      }
    }

    // Series endpoints
    if (path === '/series') {
      console.log('📺 Fetching series list...')
      
      try {
        const { data: series } = await supabase
          .from('series')
          .select('*')
          .order('sort_order')

        return new Response(
          JSON.stringify({ data: series || [], message: 'Series loaded successfully' }),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Series error:', error)
        return new Response(
          JSON.stringify({ data: [], message: 'No series available' }),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    // Actors endpoints 
    if (path === '/actors') {
      console.log('🎭 Fetching actors list...')
      
      try {
        const { data: talent } = await supabase
          .from('talent')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        return new Response(
          JSON.stringify({ data: talent || [], message: 'Actors loaded successfully' }),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Actors error:', error)
        return new Response(
          JSON.stringify({ data: [], message: 'No actors available' }),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    // Podcasts endpoints
    if (path === '/podcasts') {
      console.log('🎙️ Fetching podcasts list...')
      
      try {
        const { data: podcasts } = await supabase
          .from('podcasts')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        return new Response(
          JSON.stringify({ data: podcasts || [], message: 'Podcasts loaded successfully' }),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Podcasts error:', error)
        return new Response(
          JSON.stringify({ data: [], message: 'No podcasts available' }),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    // Mic Mtaani additional endpoints
    if (path === '/micmtaani/categories') {
      console.log('📂 Fetching Mic Mtaani categories...')
      
      try {
        const { data: categories } = await supabase
          .from('mic_mtaani_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        return new Response(
          JSON.stringify(categories || []),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Categories error:', error)
        return new Response(
          JSON.stringify([]),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    if (path === '/micmtaani/articles') {
      console.log('📰 Fetching Mic Mtaani articles...')
      
      try {
        const { data: articles } = await supabase
          .from('mic_mtaani_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        return new Response(
          JSON.stringify({ data: articles || [] }),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Articles error:', error)
        return new Response(
          JSON.stringify({ data: [] }),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    if (path === '/micmtaani/events') {
      console.log('📅 Fetching Mic Mtaani events...')
      
      try {
        const { data: events } = await supabase
          .from('mic_mtaani_events')
          .select('*')
          .eq('status', 'active')
          .order('starts_at')

        return new Response(
          JSON.stringify(events || []),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Events error:', error)
        return new Response(
          JSON.stringify([]),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    if (path === '/micmtaani/businesses') {
      console.log('🏢 Fetching Mic Mtaani businesses...')
      
      try {
        const { data: businesses } = await supabase
          .from('mic_mtaani_businesses')
          .select('*')
          .order('name')

        return new Response(
          JSON.stringify(businesses || []),
          { status: 200, headers: corsHeaders }
        )
      } catch (error) {
        console.error('❌ Businesses error:', error)
        return new Response(
          JSON.stringify([]),
          { status: 200, headers: corsHeaders }
        )
      }
    }

    // Mic Mtaani endpoints
    if (path === '/micmtaani') {
      console.log('📰 Fetching Mic Mtaani homepage...')
      
      try {
        // Get featured articles
        const { data: articles } = await supabase
          .from('mic_mtaani_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(10)

        // Get categories
        const { data: categories } = await supabase
          .from('mic_mtaani_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        // Get events
        const { data: events } = await supabase
          .from('mic_mtaani_events')
          .select('*')
          .eq('status', 'active')
          .order('starts_at')
          .limit(6)

        // Get businesses
        const { data: businesses } = await supabase
          .from('mic_mtaani_businesses')
          .select('*')
          .eq('is_featured', true)
          .limit(6)

        console.log('📊 Mic Mtaani data counts:', {
          articles: articles?.length || 0,
          categories: categories?.length || 0,
          events: events?.length || 0,
          businesses: businesses?.length || 0
        })

        const responseData = {
          latest: articles || [],
          categories: categories || [],
          events: events || [],
          businesses: businesses || [],
          breaking: null,
          featured: articles?.[0] || null,
          trending: [],
          message: 'Mic Mtaani data loaded successfully'
        }

        return new Response(
          JSON.stringify(responseData),
          { 
            status: 200,
            headers: corsHeaders 
          }
        )

      } catch (dbError) {
        console.error('❌ Mic Mtaani database error:', dbError)
        return new Response(
          JSON.stringify({ 
            error: 'Mic Mtaani database error', 
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