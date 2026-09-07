// Simple deployment test for Edge Function
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

console.log('🚀 Testing Edge Function Deployment...');
console.log('API Base:', API_BASE);

async function testAPI() {
  try {
    // Test basic endpoint
    console.log('\n📡 Testing /test endpoint...');
    const testResponse = await fetch(`${API_BASE}/test`);
    const testData = await testResponse.json();
    console.log('✅ Test endpoint:', testData.message);

    // Test authentication
    console.log('\n🔒 Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@theartainment.co.ke',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful');
      console.log('Token:', loginData.token);
      console.log('User:', loginData.user);
      
      // Test admin dashboard stats
      console.log('\n📊 Testing admin dashboard stats...');
      const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const statsData = await statsResponse.json();
      console.log('✅ Dashboard stats loaded:', Object.keys(statsData));
    } else {
      console.log('❌ Admin login failed:', loginData.message);
    }

    console.log('\n🎬 Testing content endpoints...');
    const homeResponse = await fetch(`${API_BASE}/home`);
    const homeData = await homeResponse.json();
    console.log('✅ Home data loaded with', Object.keys(homeData).length, 'sections');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();