// Test what's currently deployed
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function testCurrentDeployment() {
  try {
    console.log('🔍 Testing current deployment...');
    
    // Test with admin token
    const token = 'admin-token-1788382698531';
    
    console.log('\n📊 Testing admin dashboard endpoint...');
    const statsResponse = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', statsResponse.status);
    const statsText = await statsResponse.text();
    console.log('Response body:', statsText);
    
    // Test available endpoints
    console.log('\n🔍 Testing 404 response to see available endpoints...');
    const notFoundResponse = await fetch(`${API_BASE}/nonexistent`);
    const notFoundData = await notFoundResponse.json();
    console.log('Available endpoints:', notFoundData.available_endpoints);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCurrentDeployment();