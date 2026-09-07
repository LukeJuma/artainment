// Test if Mic Mtaani tables and data are working
const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';

async function testMicMtaaniTables() {
  console.log('🔍 Testing Mic Mtaani Tables and Data...');

  try {
    // Test main micmtaani endpoint
    console.log('\n📰 Testing /micmtaani endpoint...');
    const mmResponse = await fetch(`${API_BASE}/micmtaani`);
    console.log('Status:', mmResponse.status);
    
    if (mmResponse.ok) {
      const mmData = await mmResponse.json();
      console.log('✅ Mic Mtaani data loaded:');
      console.log('- Latest articles:', mmData.latest?.length || 0);
      console.log('- Categories:', mmData.categories?.length || 0);
      console.log('- Events:', mmData.events?.length || 0);
      console.log('- Businesses:', mmData.businesses?.length || 0);
      
      if (mmData.latest?.length > 0) {
        console.log('- Sample article:', mmData.latest[0].headline);
      }
    } else {
      const errorText = await mmResponse.text();
      console.log('❌ Mic Mtaani endpoint failed:', errorText);
    }

    // Test categories endpoint
    console.log('\n🏷️ Testing /micmtaani/categories...');
    const categoriesResponse = await fetch(`${API_BASE}/micmtaani/categories`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('✅ Categories loaded:', categories.length);
      categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    } else {
      console.log('❌ Categories failed:', categoriesResponse.status);
    }

    // Test articles endpoint
    console.log('\n📝 Testing /micmtaani/articles...');
    const articlesResponse = await fetch(`${API_BASE}/micmtaani/articles`);
    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      console.log('✅ Articles loaded:', articlesData.data?.length || 0);
      if (articlesData.data?.length > 0) {
        console.log('- Sample article:', articlesData.data[0].headline);
      }
    } else {
      console.log('❌ Articles failed:', articlesResponse.status);
    }

    // Test businesses endpoint
    console.log('\n🏢 Testing /micmtaani/businesses...');
    const businessesResponse = await fetch(`${API_BASE}/micmtaani/businesses`);
    if (businessesResponse.ok) {
      const businesses = await businessesResponse.json();
      console.log('✅ Businesses loaded:', businesses.length);
      if (businesses.length > 0) {
        console.log('- Sample business:', businesses[0].name);
      }
    } else {
      console.log('❌ Businesses failed:', businessesResponse.status);
    }

    // Test events endpoint (might be empty due to constraints)
    console.log('\n🎉 Testing /micmtaani/events...');
    const eventsResponse = await fetch(`${API_BASE}/micmtaani/events`);
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      console.log('✅ Events loaded:', events.length, '(might be empty due to constraints)');
    } else {
      console.log('❌ Events failed:', eventsResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMicMtaaniTables();