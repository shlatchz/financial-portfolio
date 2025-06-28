// Test script to verify Netlify MCP deployment
// Usage: 
//   npm run test:mcp                                    (uses default URL)
//   TEST_MCP_URL=https://your-site.netlify.app/api/mcp npm run test:mcp
//   node test-netlify-mcp.js https://your-site.netlify.app/api/mcp

const MCP_URL = process.argv[2] ||
  process.env.TEST_MCP_URL ||
  process.env.NETLIFY_MCP_URL ||
  'http://localhost:8888/api/mcp';

const TEST_SECURITY_ID = process.env.TEST_SECURITY_ID || '5113022';

async function testNetlifyMcp() {
  console.log(`🚀 Testing MCP deployment at: ${MCP_URL}\n`);

  // Test 1: Test connections (should work without configuration)
  try {
    console.log('1️⃣ Testing connections...');
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'test_connections',
        args: {}
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Test connections result:');
    console.log(result.result);
    console.log();

  } catch (error) {
    console.error('❌ Test connections failed:', error.message);
    console.log();
  }

  // Test 2: Get security info for a known TASE fund
  try {
    console.log('2️⃣ Testing security info lookup...');
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'get_security_info',
        args: { securityId: TEST_SECURITY_ID } // Known security from previous tests
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Security info result (first 500 chars):');
    console.log(result.result.substring(0, 500) + '...');
    console.log();

  } catch (error) {
    console.error('❌ Security info test failed:', error.message);
    console.log();
  }

  // Test 3: Test portfolio status (should show not configured)
  try {
    console.log('3️⃣ Testing portfolio status...');
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'get_portfolio_status',
        args: {}
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Portfolio status result:');
    console.log(result.result);
    console.log();

  } catch (error) {
    console.error('❌ Portfolio status test failed:', error.message);
    console.log();
  }

  // Test 4: Test invalid tool (should return error)
  try {
    console.log('4️⃣ Testing error handling...');
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'invalid_tool',
        args: {}
      })
    });

    const result = await response.json();
    if (result.error) {
      console.log('✅ Error handling works correctly:', result.error);
    } else {
      console.log('❌ Expected error for invalid tool');
    }
    console.log();

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    console.log();
  }

  console.log('🎉 MCP testing complete!');
  console.log(`📊 Tested URL: ${MCP_URL}`);
}

// Add timeout to prevent hanging
const timeout = setTimeout(() => {
  console.error('❌ Tests timed out after 30 seconds');
  process.exit(1);
}, 30000);

testNetlifyMcp().finally(() => {
  clearTimeout(timeout);
}); 