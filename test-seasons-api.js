// Test the seasons API endpoints
console.log('🧪 Testing Seasons API Endpoints\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

// You'll need to replace this with a valid admin token
const ADMIN_TOKEN = 'your-admin-token-here'; // Get this from localStorage when logged into admin

async function testSeasonsAPI() {
  console.log('🔑 Testing with admin token...\n');
  
  try {
    // Test 1: Check if debug endpoint works
    console.log('1️⃣ Testing debug endpoint...');
    const debugResponse = await fetch(`${API_BASE}/admin/debug/seasons`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const debugData = await debugResponse.json();
    console.log('Debug response:', debugData);
    
    if (!debugResponse.ok) {
      console.log('❌ Debug endpoint failed');
      return;
    }
    
    // Test 2: Get seasons for series ID 1
    console.log('\n2️⃣ Testing GET seasons...');
    const getResponse = await fetch(`${API_BASE}/admin/series/1/seasons`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const getData = await getResponse.json();
    console.log('GET seasons response:', getData);
    console.log('GET seasons status:', getResponse.status);
    
    // Test 3: Create a new season
    console.log('\n3️⃣ Testing POST season...');
    const postResponse = await fetch(`${API_BASE}/admin/series/1/seasons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        season_number: 1,
        title: 'Test Season',
        synopsis: 'This is a test season created by the API test script'
      })
    });
    
    const postData = await postResponse.json();
    console.log('POST season response:', postData);
    console.log('POST season status:', postResponse.status);
    
    if (postResponse.ok) {
      console.log('✅ Season creation successful!');
    } else {
      console.log('❌ Season creation failed:', postData);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

console.log('📝 Instructions:');
console.log('1. Login to https://the-artainment.vercel.app/login');  
console.log('2. Open browser devtools → Console');
console.log('3. Run: localStorage.getItem("auth_token")');
console.log('4. Copy the token and replace ADMIN_TOKEN above');
console.log('5. Run this script again\n');

// For now, just show what the test would do
console.log('🔍 This test will check:');
console.log('- If seasons table is accessible');
console.log('- If GET /admin/series/1/seasons works'); 
console.log('- If POST /admin/series/1/seasons works');
console.log('\n⚠️  Update ADMIN_TOKEN first, then run testSeasonsAPI()');

// Uncomment this line after adding your admin token:
// testSeasonsAPI();