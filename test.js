const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testCases = [
  { country: 'US', query: 'iPhone 16 Pro, 128GB' },
  { country: 'IN', query: 'boAt Airdopes 311 Pro' }
];

async function runTests() {
  console.log('🧪 Testing Universal Price Comparator\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${JSON.stringify(testCase)}`);
    console.log('-'.repeat(50));
    
    try {
      const response = await axios.post(`${BASE_URL}/search`, testCase, {
        timeout: 30000
      });
      
      const results = response.data;
      console.log(`✅ Found ${results.length} results\n`);
      
      results.slice(0, 3).forEach((result, i) => {
        console.log(`${i + 1}. ${result.productName.substring(0, 60)}...`);
        console.log(`   Price: ${result.currency} ${result.price}`);
        console.log(`   Website: ${result.website}`);
        console.log(`   Link: ${result.link.substring(0, 70)}...\n`);
      });
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

if (require.main === module) {
  runTests();
}