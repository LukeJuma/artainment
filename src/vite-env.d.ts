/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Configuration
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_SUPABASE_URL?: string
  
  // Vite Built-in Variables
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  
  // Add other VITE_ prefixed env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}