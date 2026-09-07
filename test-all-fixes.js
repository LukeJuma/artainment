// Test all the fixes we just implemented
console.log('🔧 Testing All Fixed Components...\n');

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

async function testCrudOperation(name, method, path, body = null) {
  try {
    const options = {
      method,
      headers: { 'Authorization': `Bearer ${adminToken}` }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${path}`, options);
    const status = response.status;
    const isOk = response.ok;
    
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    console.log(`${isOk ? '✅' : '❌'} ${name} (${method}): ${status} ${isOk ? '(Fixed!)' : '(Still Broken)'}`);
    
    if (!isOk && status !== 404) {
      console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
    }
    
    return { status, isOk, data };
    
  } catch (error) {
    console.log(`❌ ${name} (${method}): Network Error`);
    return { status: 0, isOk: false, data: null };
  }
}

async function testUpload() {
  console.log('📤 Testing Upload Functionality...');
  
  // Create a simple test form data
  const formData = new FormData();
  formData.append('folder', 'test');
  // Note: Not adding actual file, just testing endpoint structure
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: formData
  });
  
  const data = await response.json();
  console.log(`Upload Status: ${response.status}`);
  
  if (response.status === 400 && data.error === 'file_required') {
    console.log('✅ Upload endpoint is now properly implemented (correctly requires file)');
  } else if (data.url && data.url.includes('placeholder')) {
    console.log('❌ Upload still returning placeholder data');
  } else {
    console.log(`📋 Upload response: ${JSON.stringify(data, null, 2)}`);
  }
}

async function runAllTests() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed, aborting tests');
    return;
  }
  console.log('✅ Login successful\n');

  // Test upload first
  await testUpload();
  console.log();

  // Test all CRUD operations we just fixed
  console.log('🔧 Testing CRUD Operations...');

  // Series CRUD (newly added PUT/DELETE)
  await testCrudOperation('Update Series', 'PUT', '/admin/series/1', { title: 'Test Update' });
  await testCrudOperation('Delete Series', 'DELETE', '/admin/series/999');

  // Talent CRUD (newly added PUT/DELETE)  
  await testCrudOperation('Update Talent', 'PUT', '/admin/talent/1', { name: 'Test Update' });
  await testCrudOperation('Delete Talent', 'DELETE', '/admin/talent/999');

  // Services CRUD (newly added POST/PUT/DELETE)
  await testCrudOperation('Create Service', 'POST', '/admin/services', { title: 'Test Service', description: 'Test' });
  await testCrudOperation('Update Service', 'PUT', '/admin/services/1', { title: 'Updated Service' });
  await testCrudOperation('Delete Service', 'DELETE', '/admin/services/999');

  // News CRUD (newly added POST/PUT/DELETE)
  await testCrudOperation('Create News', 'POST', '/admin/news', { title: 'Test Article', category: 'Test', body: 'Test content' });
  await testCrudOperation('Update News', 'PUT', '/admin/news/1', { title: 'Updated Article' });
  await testCrudOperation('Delete News', 'DELETE', '/admin/news/999');

  // Testimonials CRUD (newly added POST/PUT/DELETE)
  await testCrudOperation('Create Testimonial', 'POST', '/admin/testimonials', { quote: 'Test quote', name: 'Test Client', role: 'CEO' });
  await testCrudOperation('Update Testimonial', 'PUT', '/admin/testimonials/1', { quote: 'Updated quote' });
  await testCrudOperation('Delete Testimonial', 'DELETE', '/admin/testimonials/999');

  // Gallery CRUD (newly added POST/PUT/DELETE)  
  await testCrudOperation('Create Gallery Image', 'POST', '/admin/gallery', { image_url: 'test.jpg', caption: 'Test' });
  await testCrudOperation('Update Gallery Image', 'PUT', '/admin/gallery/1', { caption: 'Updated caption' });
  await testCrudOperation('Delete Gallery Image', 'DELETE', '/admin/gallery/999');

  console.log('\n🎯 RESULTS SUMMARY:');
  console.log('✅ marks = Fixed and working');
  console.log('❌ marks = Still needs attention');
  console.log('\nNote: 500 errors on CREATE operations may indicate database schema issues');
  console.log('Note: 404 errors on DELETE operations with ID 999 are expected (testing non-existent record)');
}

runAllTests();