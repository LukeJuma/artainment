// Test if Supabase storage bucket exists and works
console.log('🗄️ Testing Supabase Storage Bucket...\n');

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

async function testUploadEndpoint() {
  try {
    // Test 1: Try upload without file (should get proper error)
    console.log('1️⃣ Testing upload endpoint without file...');
    const formData1 = new FormData();
    formData1.append('folder', 'test');
    
    const response1 = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData1
    });
    
    const data1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    
    if (response1.status === 400 && data1.error === 'file_required') {
      console.log('✅ Upload endpoint is working (correctly requires file)');
    } else {
      console.log('❌ Upload endpoint issue:', data1);
    }

    // Test 2: Try upload with a tiny fake file (will test storage connection)
    console.log('\n2️⃣ Testing upload with fake file...');
    const formData2 = new FormData();
    
    // Create a tiny blob to simulate a file
    const blob = new Blob(['test content'], { type: 'text/plain' });
    formData2.append('file', blob, 'test.txt');
    formData2.append('folder', 'test');
    
    const response2 = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData2
    });
    
    const data2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    
    if (response2.status === 200) {
      console.log('✅ Upload successful! Storage is working perfectly.');
      console.log(`📁 File URL: ${data2.url}`);
    } else if (response2.status === 500 && data2.error === 'storage_upload_failed') {
      console.log('❌ Storage bucket issue detected');
      console.log(`Error: ${data2.message}`);
      console.log(`Details: ${data2.details}`);
      console.log(`\n🔧 FIX NEEDED:`);
      console.log('1. Go to Supabase Dashboard → Storage');
      console.log('2. Create "uploads" bucket with public access');
      console.log('3. Set proper storage policies');
    } else {
      console.log('❌ Unexpected response:', data2);
    }

    // Test 3: Check current file size limits
    console.log('\n3️⃣ Testing file size validation...');
    
    // Test with a "large" text file (simulate video)
    const largeBlob = new Blob([new Array(1000000).join('x')], { type: 'video/mp4' });
    const formData3 = new FormData();
    formData3.append('file', largeBlob, 'large-video.mp4');
    formData3.append('folder', 'test');
    
    const response3 = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData3
    });
    
    const data3 = await response3.json();
    
    if (response3.status === 200) {
      console.log('✅ Video file size limits working (1MB test file accepted)');
    } else if (response3.status === 400 && data3.error === 'file_too_large') {
      console.log(`📏 File size validation working: ${data3.message}`);
    } else {
      console.log('❓ Unexpected file size response:', data3);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

async function runTests() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful\n');

  await testUploadEndpoint();

  console.log('\n🎯 SUMMARY:');
  console.log('If you see ✅ marks above, uploads are working!');
  console.log('If you see ❌ marks, follow the fix instructions in fix-upload-issues.md');
}

runTests();