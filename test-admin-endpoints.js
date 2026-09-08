// Admin Endpoints Audit Script
// Run this to test which admin endpoints are working

const API_BASE = 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';
const ADMIN_TOKEN = 'admin-token-1737310858623'; // Your admin token

const endpoints = [
  // Core CRUD endpoints that should have POST, PUT, DELETE
  { name: 'Films', path: '/admin/films', methods: ['GET', 'POST'] },
  { name: 'Series', path: '/admin/series', methods: ['GET', 'POST'] },
  { name: 'Talent', path: '/admin/talent', methods: ['GET', 'POST'] },
  { name: 'Podcasts', path: '/admin/podcasts', methods: ['GET', 'POST'] },
  { name: 'Services', path: '/admin/services', methods: ['GET', 'POST'] },
  { name: 'News', path: '/admin/news', methods: ['GET', 'POST'] },
  { name: 'Testimonials', path: '/admin/testimonials', methods: ['GET', 'POST'] },
  { name: 'Gallery', path: '/admin/gallery', methods: ['GET', 'POST'] },
  
  // Mic Mtaani endpoints
  { name: 'MM Articles', path: '/admin/micmtaani/articles', methods: ['GET', 'POST'] },
  { name: 'MM Categories', path: '/admin/micmtaani/categories', methods: ['GET', 'POST'] },
  { name: 'MM Events', path: '/admin/micmtaani/events', methods: ['GET', 'POST'] },
  { name: 'MM Businesses', path: '/admin/micmtaani/businesses', methods: ['GET', 'POST'] }
];

async function testEndpoint(endpoint) {
  const results = {};
  
  for (const method of endpoint.methods) {
    try {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Add dummy body for POST requests
      if (method === 'POST') {
        options.body = JSON.stringify({ 
          title: 'Test Item', 
          slug: 'test-item-' + Date.now(),
          description: 'Test description' 
        });
      }
      
      const response = await fetch(API_BASE + endpoint.path, options);
      results[method] = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };
      
      // Don't actually create test data, just check if endpoint exists
      if (method === 'POST' && response.ok) {
        console.warn(`⚠️  ${endpoint.name} POST actually created test data - you may want to clean it up`);
      }
      
    } catch (error) {
      results[method] = { error: error.message };
    }
  }
  
  return results;
}

async function auditAllEndpoints() {
  console.log('🔍 Admin Endpoints Audit\n');
  
  for (const endpoint of endpoints) {
    const results = await testEndpoint(endpoint);
    
    let status = '✅';
    const issues = [];
    
    for (const [method, result] of Object.entries(results)) {
      if (result.error) {
        status = '❌';
        issues.push(`${method}: ${result.error}`);
      } else if (!result.ok) {
        if (result.status === 404) {
          status = '❌';
          issues.push(`${method}: Endpoint not found (404)`);
        } else if (result.status === 401) {
          issues.push(`${method}: Unauthorized (401) - expected for auth test`);
        } else {
          status = '⚠️';
          issues.push(`${method}: ${result.status} ${result.statusText}`);
        }
      }
    }
    
    console.log(`${status} ${endpoint.name.padEnd(15)} ${endpoint.path}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ${issue}`));
    }
  }
}

// Run the audit
if (typeof window === 'undefined') {
  // Node.js environment
  auditAllEndpoints();
} else {
  // Browser environment
  console.log('Run auditAllEndpoints() in the console');
}