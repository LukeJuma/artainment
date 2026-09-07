// Comprehensive test of all major functions
console.log('🔍 Comprehensive Function Test...\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';
let adminToken = null;

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@theartainment.co.ke',
      password: 'Admin123!'
    })
  });
  const data = await response.json();
  adminToken = data.token;
  return data.success;
}

async function testEndpoint(name, path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {},
      ...options
    });
    
    const status = response.status;
    const isOk = response.ok;
    
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    console.log(`${isOk ? '✅' : '❌'} ${name}: ${status} ${isOk ? '(Working)' : '(Issue)'}`);
    
    if (!isOk) {
      console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
    }
    
    if (data && data.data && Array.isArray(data.data)) {
      console.log(`   Data: ${data.data.length} items`);
    } else if (data && typeof data === 'object' && !data.error && !data.message) {
      const keys = Object.keys(data);
      console.log(`   Data: ${keys.length} fields (${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''})`);
    }
    
    return { status, isOk, data };
    
  } catch (error) {
    console.log(`❌ ${name}: Network Error`);
    console.log(`   Error: ${error.message}`);
    return { status: 0, isOk: false, data: null };
  }
}

async function runTests() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed, aborting tests');
    return;
  }
  console.log('✅ Login successful\n');

  // Test public endpoints
  console.log('📋 PUBLIC ENDPOINTS:');
  await testEndpoint('API Test', '/test');
  await testEndpoint('Home Page', '/home');
  await testEndpoint('Films List', '/films');
  await testEndpoint('Series List', '/series');
  await testEndpoint('Actors List', '/actors');
  await testEndpoint('Podcasts List', '/podcasts');
  await testEndpoint('News List', '/news');
  await testEndpoint('Services List', '/services');
  await testEndpoint('Testimonials', '/testimonials');
  await testEndpoint('Gallery', '/gallery');
  await testEndpoint('Productions', '/productions');
  await testEndpoint('Mic Mtaani Homepage', '/micmtaani');
  await testEndpoint('Mic Mtaani Categories', '/micmtaani/categories');
  await testEndpoint('Mic Mtaani Articles', '/micmtaani/articles');
  await testEndpoint('Mic Mtaani Events', '/micmtaani/events');
  await testEndpoint('Mic Mtaani Businesses', '/micmtaani/businesses');
  
  console.log('\n🔒 ADMIN ENDPOINTS:');
  await testEndpoint('Dashboard Stats', '/admin/dashboard/stats');
  await testEndpoint('Admin Films', '/admin/films');
  await testEndpoint('Admin Series', '/admin/series');
  await testEndpoint('Admin Talent', '/admin/talent');
  await testEndpoint('Admin Podcasts', '/admin/podcasts');
  await testEndpoint('Admin Services', '/admin/services');
  await testEndpoint('Admin News', '/admin/news');
  await testEndpoint('Admin Testimonials', '/admin/testimonials');
  await testEndpoint('Admin Gallery', '/admin/gallery');
  await testEndpoint('Admin Contacts', '/admin/contacts');
  await testEndpoint('Admin Reviews', '/admin/reviews');
  await testEndpoint('Admin Users', '/admin/users');
  await testEndpoint('Admin Settings', '/admin/settings');
  await testEndpoint('Admin Mic Mtaani Articles', '/admin/micmtaani/articles');
  
  console.log('\n📤 FORM ENDPOINTS:');
  await testEndpoint('Contact Form', '/contact', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'Test User', 
      email: 'test@example.com', 
      message: 'Test message' 
    })
  });
  
  await testEndpoint('Newsletter Subscribe', '/subscribe', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });

  console.log('\n📤 UPLOAD ENDPOINT:');
  const formData = new FormData();
  formData.append('folder', 'test');
  await testEndpoint('File Upload', '/upload', {
    method: 'POST',
    body: formData
  });

  console.log('\n🎯 SUMMARY:');
  console.log('Check the results above for any ❌ marks - those are broken functions that need fixing!');
}

runTests();