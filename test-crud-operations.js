// Test CRUD operations for admin functions
console.log('🔧 Testing CRUD Operations...\n');

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
    
    console.log(`${isOk ? '✅' : '❌'} ${name} (${method}): ${status} ${isOk ? '(Working)' : '(Missing/Broken)'}`);
    
    if (!isOk && status !== 404) {
      console.log(`   Error: ${data.message || data.error || 'Unknown error'}`);
    }
    
    return { status, isOk, data };
    
  } catch (error) {
    console.log(`❌ ${name} (${method}): Network Error`);
    return { status: 0, isOk: false, data: null };
  }
}

async function runCrudTests() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed, aborting tests');
    return;
  }
  console.log('✅ Login successful\n');

  // Test Film CRUD
  console.log('🎬 FILM CRUD OPERATIONS:');
  await testCrudOperation('Create Film', 'POST', '/admin/films', {
    title: 'Test Film',
    synopsis: 'Test synopsis',
    genre: 'Drama',
    year: '2024',
    status: 'completed'
  });
  
  await testCrudOperation('Update Film', 'PUT', '/admin/films/1', {
    title: 'Updated Test Film'
  });
  
  // Don't actually delete - just test if endpoint exists
  await testCrudOperation('Delete Film', 'DELETE', '/admin/films/999');

  // Test Series CRUD
  console.log('\n📺 SERIES CRUD OPERATIONS:');
  await testCrudOperation('Create Series', 'POST', '/admin/series', {
    title: 'Test Series',
    synopsis: 'Test synopsis',
    genre: 'Drama',
    year: '2024',
    status: 'completed'
  });
  
  await testCrudOperation('Update Series', 'PUT', '/admin/series/1', {
    title: 'Updated Test Series'
  });
  
  await testCrudOperation('Delete Series', 'DELETE', '/admin/series/999');

  // Test Talent CRUD
  console.log('\n🎭 TALENT CRUD OPERATIONS:');
  await testCrudOperation('Create Talent', 'POST', '/admin/talent', {
    name: 'Test Actor',
    role: 'Actor',
    bio: 'Test bio'
  });
  
  await testCrudOperation('Update Talent', 'PUT', '/admin/talent/1', {
    name: 'Updated Test Actor'
  });
  
  await testCrudOperation('Delete Talent', 'DELETE', '/admin/talent/999');

  // Test Services CRUD
  console.log('\n🛠️ SERVICES CRUD OPERATIONS:');
  await testCrudOperation('Create Service', 'POST', '/admin/services', {
    title: 'Test Service',
    description: 'Test description'
  });
  
  await testCrudOperation('Update Service', 'PUT', '/admin/services/1', {
    title: 'Updated Test Service'
  });
  
  await testCrudOperation('Delete Service', 'DELETE', '/admin/services/999');

  // Test News CRUD
  console.log('\n📰 NEWS CRUD OPERATIONS:');
  await testCrudOperation('Create News', 'POST', '/admin/news', {
    title: 'Test Article',
    category: 'Entertainment',
    body: 'Test content'
  });
  
  await testCrudOperation('Update News', 'PUT', '/admin/news/1', {
    title: 'Updated Test Article'
  });
  
  await testCrudOperation('Delete News', 'DELETE', '/admin/news/999');

  // Test Testimonials CRUD
  console.log('\n💬 TESTIMONIALS CRUD OPERATIONS:');
  await testCrudOperation('Create Testimonial', 'POST', '/admin/testimonials', {
    quote: 'Test testimonial',
    name: 'Test Client',
    role: 'CEO'
  });
  
  await testCrudOperation('Update Testimonial', 'PUT', '/admin/testimonials/1', {
    quote: 'Updated testimonial'
  });
  
  await testCrudOperation('Delete Testimonial', 'DELETE', '/admin/testimonials/999');

  console.log('\n🎯 MISSING CRUD ENDPOINTS:');
  console.log('Any ❌ marks above show missing CRUD operations that need to be implemented!');
}

runCrudTests();