// Test upload functionality
console.log('📤 Testing Upload Functionality...\n');

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function testUpload() {
  try {
    // First login to get token
    console.log('1️⃣ Getting admin token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@theartainment.co.ke',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful, token:', loginData.token.substring(0, 20) + '...');

    // Test upload endpoint with admin token
    console.log('\n2️⃣ Testing upload endpoint...');
    
    // Create a minimal FormData (no actual file, just testing endpoint)
    const formData = new FormData();
    formData.append('folder', 'test');
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      },
      body: formData
    });

    console.log('✅ Upload Status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('📋 Upload Response:', JSON.stringify(uploadData, null, 2));
      
      if (uploadData.url && uploadData.url.includes('placeholder')) {
        console.log('\n⚠️  ISSUE FOUND:');
        console.log('❌ Upload is returning placeholder data instead of handling real files');
        console.log('🔧 This needs to be fixed for file uploads to work');
      }
    } else {
      const errorData = await uploadResponse.json();
      console.log('❌ Upload Error:', errorData);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testUpload();