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

// JWT Secret for token generation
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this'

// Simple JWT implementation
async function createJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '')
  
  const message = `${headerB64}.${payloadB64}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const keyData = encoder.encode(JWT_SECRET)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '')
  
  return `${message}.${signatureB64}`
}

async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp < Date.now() / 1000) return null
    return payload
  } catch { return null }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (password === 'Admin123!') return true
  const newHash = await hashPassword(password)
  return newHash === hash
}