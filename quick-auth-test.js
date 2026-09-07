// Quick test to see what's happening with auth
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

console.log('🧪 Testing Authentication Flow...\n');

async function testAuthFlow() {
  try {
    // Test 1: Check API is working
    console.log('1️⃣ Testing API connection...');
    const testResponse = await fetch(`${API_BASE}/test`);
    const testData = await testResponse.json();
    console.log('✅ API Status:', testResponse.status);
    console.log('📋 Response:', testData.message);

    // Test 2: Try login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@theartainment.co.ke',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login Status:', loginResponse.status);
    console.log('📋 Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.token) {
      // Test 3: Try /auth/user (what frontend expects)
      console.log('\n3️⃣ Testing /auth/user...');
      const userResponse = await fetch(`${API_BASE}/auth/user`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ /auth/user Status:', userResponse.status);
        console.log('📋 User Data:', JSON.stringify(userData, null, 2));
      } else {
        console.log('❌ /auth/user Status:', userResponse.status);
        const errorData = await userResponse.json();
        console.log('📋 Error:', errorData);
      }

      // Test 4: Try /auth/me (current endpoint)
      console.log('\n4️⃣ Testing /auth/me...');
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ /auth/me Status:', meResponse.status);
        console.log('📋 Me Data:', JSON.stringify(meData, null, 2));
      } else {
        console.log('❌ /auth/me Status:', meResponse.status);
        const errorData = await meResponse.json();
        console.log('📋 Error:', errorData);
      }

      // Test 5: Try admin dashboard
      console.log('\n5️⃣ Testing admin dashboard...');
      const dashboardResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard Status:', dashboardResponse.status);
        console.log('📋 Dashboard has content_counts:', !!dashboardData.content_counts);
      } else {
        console.log('❌ Dashboard Status:', dashboardResponse.status);
        const errorData = await dashboardResponse.json();
        console.log('📋 Error:', errorData);
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAuthFlow();