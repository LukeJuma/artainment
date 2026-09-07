// Check what dummy/sample data exists in the current database
console.log('🔍 Checking Current Database for Dummy/Sample Data...\n');

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

async function checkTableData(tableName, endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    });
    
    if (!response.ok) {
      console.log(`❌ ${tableName}: Cannot access`);
      return;
    }
    
    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    
    if (items.length === 0) {
      console.log(`✅ ${tableName}: Empty (no dummy data)`);
      return;
    }
    
    console.log(`📋 ${tableName}: ${items.length} items`);
    
    // Check for obvious dummy/sample data patterns
    const dummyPatterns = [
      /test|sample|dummy|mock|lorem|placeholder/i,
      /john.*doe|jane.*doe/i,
      /example\.com|test\.com/i,
      /mama.*njeri|techhub.*nakuru|nakuru.*cultural/i
    ];
    
    let dummyCount = 0;
    items.slice(0, 5).forEach((item, index) => {
      const itemStr = JSON.stringify(item).toLowerCase();
      const isDummy = dummyPatterns.some(pattern => pattern.test(itemStr));
      
      if (isDummy) {
        dummyCount++;
        console.log(`   🚨 DUMMY #${index + 1}: ${item.title || item.name || item.headline || item.quote || 'Item'}`);
      }
    });
    
    if (dummyCount > 0) {
      console.log(`   ⚠️  Found ${dummyCount} potential dummy items (showing first 5)`);
    }
    
  } catch (error) {
    console.log(`❌ ${tableName}: Error - ${error.message}`);
  }
}

async function runCheck() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful\n');

  console.log('📊 CHECKING ALL TABLES FOR DUMMY DATA:\n');

  // Check all tables for dummy data
  await checkTableData('Films', '/admin/films');
  await checkTableData('Series', '/admin/series');  
  await checkTableData('Talent/Actors', '/admin/talent');
  await checkTableData('Podcasts', '/admin/podcasts');
  await checkTableData('Services', '/admin/services');
  await checkTableData('News Articles', '/admin/news');
  await checkTableData('Testimonials', '/admin/testimonials');
  await checkTableData('Gallery', '/admin/gallery');
  await checkTableData('Reviews', '/admin/reviews');
  await checkTableData('Contacts', '/admin/contacts');
  await checkTableData('Users', '/admin/users');

  // Mic Mtaani data
  await checkTableData('Mic Mtaani Articles', '/micmtaani/articles');
  await checkTableData('Mic Mtaani Categories', '/micmtaani/categories');
  await checkTableData('Mic Mtaani Events', '/micmtaani/events');
  await checkTableData('Mic Mtaani Businesses', '/micmtaani/businesses');

  console.log('\n🎯 SUMMARY:');
  console.log('🚨 Items marked with DUMMY contain sample/test data that should be removed');
  console.log('✅ Empty tables are clean');
  console.log('📋 Tables with real data are OK to keep');
}

runCheck();