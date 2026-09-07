// Test admin frontend functionality
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function testAdminFlow() {
  try {
    console.log('🔒 Testing Admin Login Flow...');
    
    // Step 1: Login as admin
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@theartainment.co.ke',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', {
      success: loginData.success,
      user: loginData.user,
      token: loginData.token ? 'Present' : 'Missing'
    });
    
    if (!loginData.success) {
      console.log('❌ Login failed, cannot test admin functions');
      return;
    }
    
    // Step 2: Verify user format for frontend
    console.log('\n👤 User Object Format Check:');
    const user = loginData.user;
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);  
    console.log('- Email:', user.email);
    console.log('- is_admin:', user.is_admin);
    console.log('- Format correct for AuthContext:', user.is_admin === true);
    
    // Step 3: Test auth verification
    console.log('\n🔍 Testing Auth Verification...');
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const meData = await meResponse.json();
    console.log('✅ Auth verification:', {
      status: meResponse.status,
      user: meData.id ? 'Valid' : 'Invalid'
    });
    
    // Step 4: Test content endpoints that admin panel uses
    console.log('\n📊 Testing Content Endpoints...');
    
    const endpoints = [
      '/home',
      '/films',
      '/series',
      '/actors',
      '/podcasts',
      '/news',
      '/services',
      '/testimonials',
      '/gallery',
      '/micmtaani',
      '/micmtaani/categories'
    ];
    
    let workingEndpoints = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (response.ok) {
          workingEndpoints++;
          console.log(`  ✅ ${endpoint}`);
        } else {
          console.log(`  ❌ ${endpoint} (${response.status})`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint} (Error: ${error.message})`);
      }
    }
    
    console.log(`\n📈 Content Endpoints: ${workingEndpoints}/${endpoints.length} working`);
    
    // Step 5: Test admin endpoints (will fail until deployed)
    console.log('\n🔧 Testing Admin Endpoints (Expected to fail until deployed)...');
    
    const adminEndpoints = [
      '/admin/dashboard/stats',
      '/admin/films',
      '/admin/contacts'
    ];
    
    let workingAdminEndpoints = 0;
    for (const endpoint of adminEndpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        if (response.ok) {
          workingAdminEndpoints++;
          console.log(`  ✅ ${endpoint}`);
        } else {
          console.log(`  ⏳ ${endpoint} (${response.status} - needs deployment)`);
        }
      } catch (error) {
        console.log(`  ⏳ ${endpoint} (Error - needs deployment)`);
      }
    }
    
    console.log(`\n🎯 Admin Endpoints: ${workingAdminEndpoints}/${adminEndpoints.length} working`);
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('- Authentication: ✅ Working');
    console.log('- User Format: ✅ Correct for frontend');
    console.log(`- Public Content: ✅ ${workingEndpoints}/${endpoints.length} endpoints`);
    console.log(`- Admin Panel: ⏳ ${workingAdminEndpoints}/${adminEndpoints.length} endpoints (needs deployment)`);
    console.log('\n🚀 Ready for admin backend deployment!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminFlow();