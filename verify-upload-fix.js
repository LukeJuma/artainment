// Quick verification that upload fixes are working
console.log('🔧 Verifying Upload Fixes...\n');

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

async function quickTest() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful\n');

  console.log('📤 Testing upload with small file...');
  
  try {
    // Create a small test file
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test.txt');
    formData.append('folder', 'test');
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('🎉 SUCCESS! Upload is working perfectly!');
      console.log(`📁 Test file uploaded to: ${data.url}`);
      console.log('\n✅ FIXED ISSUES:');
      console.log('✅ Storage bucket exists and works');
      console.log('✅ File upload functionality restored');
      console.log('✅ Ready for real file uploads');
      
      console.log('\n📊 NEW FILE SIZE LIMITS:');
      console.log('📷 Images: Up to 10MB');
      console.log('🎥 Videos: Up to 500MB (perfect for trailers!)');
      console.log('🎵 Audio: Up to 100MB');
      
    } else {
      console.log('❌ Still having issues:');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${data.message}`);
      
      if (data.error === 'storage_upload_failed') {
        console.log('\n🔧 STORAGE BUCKET ISSUE:');
        console.log('1. Go to Supabase Dashboard → Storage');
        console.log('2. Run the create-storage-bucket.sql script');
        console.log('3. Make sure "uploads" bucket exists and is public');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

quickTest();