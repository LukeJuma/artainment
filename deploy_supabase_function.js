// Deploy the complete function to Supabase using curl commands
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying Complete Edge Function to Supabase...');

try {
  // Check if function file exists and has the admin endpoints
  const functionContent = fs.readFileSync('supabase/functions/api/index.ts', 'utf8');
  
  if (functionContent.includes('/admin/dashboard/stats')) {
    console.log('✅ Function file contains admin endpoints');
  } else {
    console.log('❌ Function file missing admin endpoints - deployment may not work');
  }
  
  console.log('\n📡 Attempting to deploy via Supabase CLI...');
  console.log('Note: This requires Supabase CLI to be installed and authenticated');
  
  // Try to deploy using supabase CLI if available
  try {
    const result = execSync('supabase functions deploy api --project-ref etjkivwwnqafyphqamgh', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log('✅ Function deployed successfully via CLI');
  } catch (cliError) {
    console.log('❌ CLI deployment failed:', cliError.message);
    console.log('\n🔧 Alternative: Manual deployment needed');
    console.log('1. Install Supabase CLI: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Deploy: supabase functions deploy api --project-ref etjkivwwnqafyphqamgh');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
}