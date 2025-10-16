// Quick test to verify the CORS fix
// Run this in the browser console

console.log('🧪 Testing CORS Fix');
console.log('==================');

async function testCORSFix() {
  try {
    console.log('📤 Testing registration through proxy...');
    
    const testData = {
      name: 'CORS Test User',
      email: `cors-test-${Date.now()}@example.com`,
      password: 'password123',
      password_confirmation: 'password123'
    };
    
    console.log('📝 Test data:', testData);
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration successful!');
      console.log('📋 Response:', result);
      
      // Test login with the same user
      console.log('\n🔐 Testing login...');
      
      const loginResponse = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: testData.email,
          password: testData.password
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('📋 Login response:', loginResult);
        console.log('\n🎉 CORS fix is working correctly!');
      } else {
        console.error('❌ Login failed:', loginResponse.status);
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ Registration failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCORSFix();
