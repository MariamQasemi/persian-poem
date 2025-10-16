// Comprehensive API Testing Script
// Test all the new user management and blog post functionality

console.log('🚀 Starting Comprehensive API Testing');
console.log('=====================================');

// Test user management functions
async function testUserManagement() {
  console.log('\n👤 Testing User Management APIs');
  console.log('--------------------------------');
  
  try {
    // Test 1: Get current user
    console.log('📋 Test 1: Get Current User');
    const currentUser = await ApiService.getCurrentUser();
    console.log('✅ Current user data:', currentUser);
    
    // Test 2: Update user profile
    console.log('\n📋 Test 2: Update User Profile');
    const updateData = {
      name: currentUser.name || 'Updated Name',
      email: currentUser.email
    };
    
    const updatedUser = await ApiService.updateUserProfile(updateData);
    console.log('✅ Profile updated:', updatedUser);
    
    // Test 3: Change password (optional - requires current password)
    console.log('\n📋 Test 3: Change Password (skipped - requires current password)');
    console.log('ℹ️ Password change test requires actual current password');
    
    return true;
    
  } catch (error) {
    console.error('❌ User management test failed:', error);
    return false;
  }
}

// Test blog post functions
async function testBlogPosts() {
  console.log('\n📝 Testing Blog Posts APIs');
  console.log('---------------------------');
  
  try {
    // Test 1: Get all blog posts
    console.log('📋 Test 1: Get All Blog Posts');
    const allPosts = await ApiService.getBlogPosts({ limit: 10, offset: 0 });
    console.log('✅ All posts:', allPosts);
    
    // Test 2: Get my blog posts
    console.log('\n📋 Test 2: Get My Blog Posts');
    const myPosts = await ApiService.getMyBlogPosts(false);
    console.log('✅ My posts:', myPosts);
    
    // Test 3: Get my blog posts including unpublished
    console.log('\n📋 Test 3: Get My Posts (Including Unpublished)');
    const myAllPosts = await ApiService.getMyBlogPosts(true);
    console.log('✅ My all posts:', myAllPosts);
    
    // Test 4: Create a new blog post
    console.log('\n📋 Test 4: Create New Blog Post');
    const newPost = {
      title: 'Test Post ' + Date.now(),
      content: 'This is a test blog post created via API',
      author_name: 'Test Author',
      published: false
    };
    
    const createdPost = await ApiService.createBlogPost(newPost);
    console.log('✅ Post created:', createdPost);
    
    // Test 5: Update the blog post
    if (createdPost.id) {
      console.log('\n📋 Test 5: Update Blog Post');
      const updateData = {
        title: createdPost.title + ' (Updated)',
        content: createdPost.content + '\n\nThis post has been updated!',
        published: true
      };
      
      const updatedPost = await ApiService.updateBlogPost(createdPost.id, updateData);
      console.log('✅ Post updated:', updatedPost);
      
      // Test 6: Delete the blog post
      console.log('\n📋 Test 6: Delete Blog Post');
      await ApiService.deleteBlogPost(createdPost.id);
      console.log('✅ Post deleted successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Blog posts test failed:', error);
    return false;
  }
}

// Test logout functionality
async function testLogout() {
  console.log('\n🚪 Testing Logout API');
  console.log('----------------------');
  
  try {
    const logoutResult = await ApiService.logoutUser();
    console.log('✅ Logout successful:', logoutResult);
    return true;
  } catch (error) {
    console.error('❌ Logout test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running All API Tests...');
  
  const results = {
    userManagement: false,
    blogPosts: false,
    logout: false
  };
  
  try {
    results.userManagement = await testUserManagement();
    results.blogPosts = await testBlogPosts();
    // Don't test logout as it will end the session
    // results.logout = await testLogout();
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log('✅ User Management:', results.userManagement ? 'PASSED' : 'FAILED');
    console.log('✅ Blog Posts:', results.blogPosts ? 'PASSED' : 'FAILED');
    console.log('⏭️ Logout:', 'SKIPPED (would end session)');
    
    const allPassed = results.userManagement && results.blogPosts;
    console.log('\n🎯 Overall Result:', allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export functions for manual testing
window.apiTests = {
  runAll: runAllTests,
  testUserManagement,
  testBlogPosts,
  testLogout
};

console.log('📚 Available test functions:');
console.log('- apiTests.runAll() - Run complete test suite');
console.log('- apiTests.testUserManagement() - Test user management APIs');
console.log('- apiTests.testBlogPosts() - Test blog post APIs');
console.log('- apiTests.testLogout() - Test logout API');
console.log('');
console.log('🚀 Run apiTests.runAll() to start testing...');

// Auto-run the tests
runAllTests();
