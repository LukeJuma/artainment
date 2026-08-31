import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // SECURITY AUDIT QUERIES
    const auditResults: any = {}

    // 1. Check all tables and their RLS status
    const { data: tablesRLS, error: rlsError } = await supabase.rpc('get_tables_rls_status')
    
    if (rlsError && rlsError.code !== '42883') { // Function might not exist
      // Fallback: Try to query information_schema directly
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')

      auditResults.tables = tables || []
      auditResults.tables_error = tablesError
    } else {
      auditResults.tables_rls = tablesRLS
    }

    // 2. Check existing policies
    const { data: policies, error: policiesError } = await supabase.rpc('get_rls_policies')
    auditResults.policies = policies || []
    auditResults.policies_error = policiesError

    // 3. Test table access with different roles
    const testResults: any = {}

    // Test critical Laravel system tables
    const criticalTables = [
      'users', 'password_reset_tokens', 'sessions', 'cache', 'cache_locks', 
      'jobs', 'job_batches', 'migrations', 'personal_access_tokens'
    ]

    for (const table of criticalTables) {
      try {
        // Test with service role (should work)
        const { data: serviceData, error: serviceError } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        testResults[table] = {
          service_role_access: !serviceError,
          service_error: serviceError?.message,
          has_data: serviceData && serviceData.length > 0
        }

        // Test basic table info
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        testResults[table].row_count = count
        testResults[table].count_error = countError?.message

      } catch (error) {
        testResults[table] = {
          error: error.message,
          table_exists: false
        }
      }
    }

    // 4. Test content tables
    const contentTables = [
      'films', 'series', 'services', 'talent', 'productions', 
      'news_articles', 'testimonials', 'gallery_images', 'podcasts'
    ]

    for (const table of contentTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        testResults[table] = {
          accessible: !error,
          error: error?.message,
          has_data: data && data.length > 0
        }
      } catch (error) {
        testResults[table] = {
          error: error.message,
          table_exists: false
        }
      }
    }

    auditResults.table_access_tests = testResults

    // 5. Check for sensitive columns in users table
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (userData && userData.length > 0) {
        const userColumns = Object.keys(userData[0])
        const sensitiveColumns = userColumns.filter(col => 
          col.includes('password') || 
          col.includes('token') || 
          col.includes('secret') || 
          col.includes('hash') ||
          col.includes('salt')
        )
        
        auditResults.users_table = {
          columns: userColumns,
          sensitive_columns: sensitiveColumns,
          sample_record_keys: userColumns
        }
      }
    } catch (error) {
      auditResults.users_table = { error: error.message }
    }

    // 6. Environment variable check (from Edge Function perspective)
    auditResults.environment = {
      supabase_url: !!Deno.env.get('SUPABASE_URL'),
      service_role_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      jwt_secret: !!Deno.env.get('JWT_SECRET')
    }

    return new Response(
      JSON.stringify({
        audit_timestamp: new Date().toISOString(),
        audit_results: auditResults,
        security_notes: [
          "This audit was performed using Supabase Edge Functions",
          "Direct PostgreSQL system catalog access may be limited",
          "Manual verification of RLS policies and grants is recommended",
          "Check Supabase dashboard for additional security findings"
        ]
      }, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Security audit error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Security audit failed',
        details: error.message,
        stack: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})