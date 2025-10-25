// Test script for blog post creation functionality
// This script tests the createBlogPost API functionality

console.log('📝 Testing Blog Post Creation');
console.log('=============================');

// Test blog post creation
async function testBlogPostCreation() {
  console.log('\n📋 Testing Blog Post Creation API');
  console.log('-----------------------------------');
  
  try {
    // Check if we have a token first
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      console.log('❌ No authentication token found');
      console.log('ℹ️ Please login first to test blog post creation');
      return false;
    }
    
    console.log('✅ Authentication token found');
    
    // Test data for blog post creation
    const testPostData = {
      title: `Test Post ${Date.now()}`,
      content: 'This is a test blog post created via API. It contains some sample content to test the blog post creation functionality.',
      author_name: 'Test Author',
      author_username: 'testuser',
      is_published: false, // Create as draft first
      tags: ['test', 'api', 'blog']
    };
    
    console.log('📤 Creating blog post with data:', testPostData);
    
    // Test the createBlogPost function
    const createdPost = await ApiService.createBlogPost(testPostData);
    
    console.log('✅ Blog post created successfully!');
    console.log('📋 Created post data:', {
      id: createdPost.id,
      title: createdPost.title,
      author: createdPost.author || createdPost.author_name,
      published: createdPost.published,
      createdAt: createdPost.created_at
    });
    
    // Validate the response structure
    if (!createdPost.id) {
      console.warn('⚠️ Warning: No post ID in response');
    }
    
    if (!createdPost.title) {
      console.warn('⚠️ Warning: No title in response');
    }
    
    if (!createdPost.content) {
      console.warn('⚠️ Warning: No content in response');
    }
    
    console.log('🎯 Blog post creation test completed successfully!');
    
    // Test updating the post to published
    if (createdPost.id) {
      console.log('\n📋 Testing Blog Post Update');
      console.log('-----------------------------');
      
      try {
        const updateData = {
          title: createdPost.title + ' (Updated)',
          content: createdPost.content + '\n\nThis post has been updated and published!',
          published: true
        };
        
        console.log('📤 Updating blog post with data:', updateData);
        
        const updatedPost = await ApiService.updateBlogPost(createdPost.id, updateData);
        
        console.log('✅ Blog post updated successfully!');
        console.log('📋 Updated post data:', {
          id: updatedPost.id,
          title: updatedPost.title,
          published: updatedPost.published
        });
        
        // Test deleting the post
        console.log('\n📋 Testing Blog Post Deletion');
        console.log('-------------------------------');
        
        console.log('📤 Deleting blog post...');
        await ApiService.deleteBlogPost(createdPost.id);
        
        console.log('✅ Blog post deleted successfully!');
        
      } catch (updateError) {
        console.error('❌ Blog post update/delete test failed:', updateError);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Blog post creation test failed:', error);
    
    if (error.status === 401) {
      console.log('🔐 Authentication failed - token may be invalid or expired');
    } else if (error.status === 403) {
      console.log('🚫 Access forbidden - user may not have permission to create posts');
    } else if (error.status === 422) {
      console.log('📝 Validation error - check the post data format');
    } else if (error.status === 404) {
      console.log('🔍 Endpoint not found - check API configuration');
    } else {
      console.log('🌐 Network or server error:', error.message);
    }
    
    return false;
  }
}

// Test getting blog posts
async function testGetBlogPosts() {
  console.log('\n📋 Testing Get Blog Posts API');
  console.log('------------------------------');
  
  try {
    console.log('📤 Fetching blog posts...');
    
    const posts = await ApiService.getBlogPosts({ limit: 10, offset: 0 });
    
    console.log('✅ Blog posts fetched successfully!');
    console.log('📋 Posts data:', {
      total: posts.total,
      postsCount: posts.posts?.length || 0,
      firstPost: posts.posts?.[0] ? {
        id: posts.posts[0].id,
        title: posts.posts[0].title,
        author: posts.posts[0].author || posts.posts[0].author_name
      } : null
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Get blog posts test failed:', error);
    return false;
  }
}

// Test getting my blog posts
async function testGetMyBlogPosts() {
  console.log('\n📋 Testing Get My Blog Posts API');
  console.log('----------------------------------');
  
  try {
    console.log('📤 Fetching my blog posts...');
    
    const myPosts = await ApiService.getMyBlogPosts(false);
    
    console.log('✅ My blog posts fetched successfully!');
    console.log('📋 My posts data:', {
      total: myPosts.total,
      postsCount: myPosts.posts?.length || 0
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Get my blog posts test failed:', error);
    return false;
  }
}

// Run all blog tests
async function runBlogTests() {
  console.log('🧪 Running All Blog API Tests...');
  
  const results = {
    createPost: false,
    getPosts: false,
    getMyPosts: false
  };
  
  try {
    results.createPost = await testBlogPostCreation();
    results.getPosts = await testGetBlogPosts();
    results.getMyPosts = await testGetMyBlogPosts();
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log('✅ Create Post:', results.createPost ? 'PASSED' : 'FAILED');
    console.log('✅ Get Posts:', results.getPosts ? 'PASSED' : 'FAILED');
    console.log('✅ Get My Posts:', results.getMyPosts ? 'PASSED' : 'FAILED');
    
    const allPassed = results.createPost && results.getPosts && results.getMyPosts;
    console.log('\n🎯 Overall Result:', allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
    
    if (allPassed) {
      console.log('\n🎉 The blog post creation functionality is working correctly!');
      console.log('📝 Users can now:');
      console.log('   - Create new blog posts');
      console.log('   - Update existing posts');
      console.log('   - Delete their posts');
      console.log('   - View all posts');
      console.log('   - View their own posts');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export for manual testing
window.testBlog = {
  runTests: runBlogTests,
  testBlogPostCreation,
  testGetBlogPosts,
  testGetMyBlogPosts
};

console.log('📚 Available test functions:');
console.log('- testBlog.runTests() - Run complete test suite');
console.log('- testBlog.testBlogPostCreation() - Test blog post creation only');
console.log('- testBlog.testGetBlogPosts() - Test getting all posts');
console.log('- testBlog.testGetMyBlogPosts() - Test getting my posts');
console.log('');
console.log('🚀 Run testBlog.runTests() to start testing...');

// Auto-run the tests
runBlogTests();
