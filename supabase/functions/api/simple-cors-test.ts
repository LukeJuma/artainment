import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  console.log('🚀 Request received:', req.method, req.url)
  
  // Universal CORS headers that work with any browser
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://the-artainment.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
    'Access-Control-Max-Age': '3600',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS Preflight handled')
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  // Simple test response
  const response = {
    message: 'CORS Test Successful!',
    timestamp: new Date().toISOString(),
    method: req.method,
    origin: req.headers.get('Origin') || 'none',
    userAgent: req.headers.get('User-Agent') || 'none'
  }

  console.log('📤 Sending response with CORS headers')
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: corsHeaders
  })
})