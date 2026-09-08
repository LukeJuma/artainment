// Test if the latest API changes are deployed
console.log('🔍 TESTING API DEPLOYMENT STATUS\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function checkDeployment() {
  try {
    // Test 1: Check if the 404 endpoint shows our new endpoints
    console.log('1️⃣ Checking available endpoints...');
    const response = await fetch(`${API_BASE}/nonexistent-endpoint`);
    const data = await response.json();
    
    console.log('Available endpoints:', data.available_endpoints);
    
    // Check if our new seasons endpoints are listed
    const hasSeasons = data.available_endpoints?.some(endpoint => 
      endpoint.includes('seasons') || endpoint.includes('episodes')
    );
    
    if (hasSeasons) {
      console.log('✅ Seasons endpoints are listed - deployment successful!');
    } else {
      console.log('❌ Seasons endpoints NOT listed - deployment failed or not pushed');
      console.log('\n🔧 The API function needs to be manually deployed.');
      console.log('📝 This happens because Supabase Edge Functions need explicit deployment.');
    }
    
    // Test 2: Try to hit the debug endpoint directly
    console.log('\n2️⃣ Testing direct debug endpoint access...');
    try {
      const debugResponse = await fetch(`${API_BASE}/admin/debug/seasons`);
      const debugData = await debugResponse.json();
      
      if (debugResponse.status === 401) {
        console.log('✅ Debug endpoint exists but requires auth (expected)');
      } else if (debugResponse.status === 404) {
        console.log('❌ Debug endpoint not found - function not deployed');
      } else {
        console.log('🔍 Debug endpoint response:', debugData);
      }
    } catch (error) {
      console.log('❌ Debug endpoint error:', error.message);
    }
    
    // Test 3: Check if YouTube endpoints exist
    console.log('\n3️⃣ Testing YouTube endpoints...');
    const youtubeResponse = await fetch(`${API_BASE}/youtube/info/test123`);
    const youtubeData = await youtubeResponse.json();
    
    if (youtubeResponse.status !== 404) {
      console.log('✅ YouTube endpoints deployed');
    } else {
      console.log('❌ YouTube endpoints not found');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

async function showDeploymentInstructions() {
  console.log('\n📋 DEPLOYMENT INSTRUCTIONS:');
  console.log('');
  console.log('🔧 The Supabase Edge Function needs manual deployment because:');
  console.log('   - Git push only updates the code repository');
  console.log('   - Edge Functions require explicit deployment to Supabase');
  console.log('');
  console.log('💡 SOLUTIONS:');
  console.log('');
  console.log('1️⃣ INSTALL SUPABASE CLI & DEPLOY:');
  console.log('   npm install -g supabase');
  console.log('   supabase login');
  console.log('   supabase functions deploy api --project-ref etjkivwwnqafyphqamgh');
  console.log('');
  console.log('2️⃣ OR USE SUPABASE DASHBOARD:');
  console.log('   → Go to Supabase Dashboard');
  console.log('   → Edge Functions → api');
  console.log('   → Deploy new version');
  console.log('   → Upload the index.ts file manually');
  console.log('');
  console.log('3️⃣ OR ALTERNATIVE SOLUTION:');
  console.log('   → I can create a simpler fix that works with current deployment');
  console.log('   → Add seasons endpoints to existing working function');
  console.log('');
  console.log('🎯 Once deployed, the seasons creation will work immediately!');
}

checkDeployment().then(() => {
  showDeploymentInstructions();
});