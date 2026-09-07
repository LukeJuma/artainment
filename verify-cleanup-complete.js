// Verify that dummy data cleanup was successful
console.log('✅ Verifying Dummy Data Cleanup...\n');

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

async function verifyTableClean(tableName, endpoint, checkFields) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    });
    
    if (!response.ok) {
      console.log(`❌ ${tableName}: Cannot access`);
      return false;
    }
    
    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    
    if (items.length === 0) {
      console.log(`✅ ${tableName}: Empty (perfectly clean)`);
      return true;
    }
    
    // Check for dummy data patterns
    const dummyPatterns = [
      /test|sample|dummy|mock|lorem/i,
      /updated test film/i,
      /james kamau|amina hassan|peter otieno|grace wanjiku/i,
      /mama njeri|techhub nakuru|nakuru cultural/i,
      /community center.*nakuru/i,
      /test user/i
    ];
    
    let foundDummy = false;
    let cleanItems = [];
    let dummyItems = [];
    
    items.forEach(item => {
      const itemStr = JSON.stringify(item).toLowerCase();
      const isDummy = dummyPatterns.some(pattern => pattern.test(itemStr));
      
      if (isDummy) {
        foundDummy = true;
        dummyItems.push(item[checkFields[0]] || item.id);
      } else {
        cleanItems.push(item[checkFields[0]] || item.id);
      }
    });
    
    if (!foundDummy) {
      console.log(`✅ ${tableName}: ${items.length} items, all clean`);
      return true;
    } else {
      console.log(`⚠️  ${tableName}: ${cleanItems.length} clean, ${dummyItems.length} still have dummy data:`);
      dummyItems.slice(0, 3).forEach(item => {
        console.log(`   🚨 "${item}"`);
      });
      if (dummyItems.length > 3) {
        console.log(`   ... and ${dummyItems.length - 3} more`);
      }
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ${tableName}: Error - ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('🔑 Logging in...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful\n');

  console.log('🔍 VERIFYING CLEANUP RESULTS:\n');

  const tables = [
    ['Films', '/admin/films', ['title']],
    ['Contacts', '/admin/contacts', ['name']],
    ['News Articles', '/admin/news', ['title']],
    ['Mic Mtaani Businesses', '/micmtaani/businesses', ['name']],
    ['Mic Mtaani Articles', '/micmtaani/articles', ['headline']],
    ['Mic Mtaani Events', '/micmtaani/events', ['title']],
    ['Mic Mtaani Categories', '/micmtaani/categories', ['name']],
    ['Talent/Actors', '/admin/talent', ['name']],
    ['Services', '/admin/services', ['title']],
    ['Testimonials', '/admin/testimonials', ['name']],
    ['Gallery', '/admin/gallery', ['caption']],
    ['Series', '/admin/series', ['title']],
    ['Podcasts', '/admin/podcasts', ['title']]
  ];

  let allClean = true;
  let cleanCount = 0;
  let needsCleaningCount = 0;

  for (const [name, endpoint, fields] of tables) {
    const isClean = await verifyTableClean(name, endpoint, fields);
    if (isClean) {
      cleanCount++;
    } else {
      needsCleaningCount++;
      allClean = false;
    }
  }

  console.log('\n📊 CLEANUP SUMMARY:');
  console.log(`✅ Clean tables: ${cleanCount}`);
  console.log(`⚠️  Tables needing attention: ${needsCleaningCount}`);
  
  if (allClean) {
    console.log('\n🎉 EXCELLENT! All dummy data has been successfully removed!');
    console.log('🎯 Your database is now clean and production-ready.');
  } else {
    console.log('\n⚠️  Some dummy data still remains.');
    console.log('💡 Consider running a more aggressive cleanup script or manually removing the flagged items.');
  }

  console.log('\n🚀 NEXT STEPS:');
  if (allClean) {
    console.log('✅ Database is clean - ready for production!');
    console.log('✅ Admin panel is ready for real content creation');
    console.log('✅ All systems are go!');
  } else {
    console.log('🔧 Review the items marked with 🚨 above');
    console.log('🔧 Remove them manually via admin panel or run additional cleanup');
    console.log('🔧 Run this verification again after cleanup');
  }
}

runVerification();