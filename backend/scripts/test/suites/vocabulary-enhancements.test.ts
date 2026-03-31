import { ApiClient } from '../utils/api-client';
import { testConfig } from '../config/test.config';
import { TestAssertions } from '../utils/assertions';

/**
 * Test Suite: Vocabulary Enhancements
 * Tests for:
 * - Dictionary search API
 * - Batch review API
 * - Admin dashboard API
 */

const client = new ApiClient(testConfig.apiBaseUrl);

export async function runVocabularyEnhancementsTests() {
  console.log('\n🧪 Running Vocabulary Enhancements Tests...\n');

  let adminToken: string;
  let userToken: string;
  let testVocabIds: string[] = [];

  try {
    // Setup: Login as admin and regular user
    console.log('📝 Setup: Logging in...');
    const adminLogin = await client.post('/auth/login', {
      email: 'admin@linvnix.test',
      password: 'Admin123456!',
    });
    adminToken = adminLogin.data.accessToken || adminLogin.data.access_token;

    const userRegister = await client.post('/auth/register', {
      email: `testuser_${Date.now()}@example.com`,
      password: 'Test123!@#',
      fullName: 'Test User',
    });
    userToken = userRegister.data.accessToken || userRegister.data.access_token;
    
    console.log(`✅ Tokens obtained`);

    // Test 1: Dictionary Search
    console.log('\n📚 Test 1: Dictionary Search API');
    
    // Search with empty query
    const emptySearch = await client.get('/vocabularies/search?q=');
    TestAssertions.assertTrue(
      Array.isArray(emptySearch.data) && emptySearch.data.length === 0,
      'Empty query should return empty array',
    );

    // Search for common word
    const searchResult = await client.get('/vocabularies/search?q=xin');
    TestAssertions.assertTrue(
      Array.isArray(searchResult.data),
      'Search should return array',
    );
    console.log(`✅ Found ${searchResult.data.length} results for "xin"`);

    if (searchResult.data.length > 0) {
      const firstResult = searchResult.data[0];
      TestAssertions.assertNotNull(firstResult.id);
      TestAssertions.assertNotNull(firstResult.word);
      TestAssertions.assertNotNull(firstResult.translation);
      console.log(`   Sample: "${firstResult.word}" = "${firstResult.translation}"`);
    }

    // Test 2: Batch Review API
    console.log('\n📝 Test 2: Batch Review API');

    // First, get some vocabularies from existing lessons
    client.setToken(adminToken);
    const coursesResponse = await client.get('/courses');
    
    if (coursesResponse.data && coursesResponse.data.length > 0) {
      const firstCourse = coursesResponse.data[0];
      const unitsResponse = await client.get(`/units/course/${firstCourse.id}`);
      
      if (unitsResponse.data && unitsResponse.data.length > 0) {
        const firstUnit = unitsResponse.data[0];
        const lessonsResponse = await client.get(`/lessons/unit/${firstUnit.id}`);
        
        if (lessonsResponse.data && lessonsResponse.data.length > 0) {
          const firstLesson = lessonsResponse.data[0];
          const vocabsResponse = await client.get(`/vocabularies/lesson/${firstLesson.id}`);
          
          if (vocabsResponse.data && vocabsResponse.data.length > 0) {
            testVocabIds = vocabsResponse.data.slice(0, 3).map((v: any) => v.id);
            
            // Add to learning as user
            client.setToken(userToken);
            for (const vocabId of testVocabIds) {
              await client.post(`/vocabularies/${vocabId}/learn`, {});
            }
            console.log(`✅ Added ${testVocabIds.length} vocabularies to learning list`);
          }
        }
      }
    }

    // Batch review
    if (testVocabIds.length > 0) {
      const batchReviewPayload = {
        reviews: testVocabIds.map((vocabId, index) => ({
          vocabularyId: vocabId,
          rating: 3, // Good rating
        })),
      };

      const batchResult = await client.post(
        '/vocabularies/review/batch',
        batchReviewPayload,
      );

      TestAssertions.assertNotNull(batchResult.data.success);
      TestAssertions.assertNotNull(batchResult.data.results);
      TestAssertions.assertEquals(
        batchResult.data.success,
        testVocabIds.length,
        `Should successfully review ${testVocabIds.length} vocabularies`,
      );
      console.log(`✅ Batch reviewed ${batchResult.data.success} vocabularies`);

      // Verify reviews were recorded
      const myVocabs = await client.get('/vocabularies/my-vocabularies');
      const reviewedVocabs = myVocabs.data.filter((v: any) => 
        testVocabIds.includes(v.vocabularyId) && v.reviewCount > 0
      );
      TestAssertions.assertEquals(
        reviewedVocabs.length,
        testVocabIds.length,
        'All vocabularies should have review count > 0',
      );
      console.log(`✅ Verified ${reviewedVocabs.length} reviews were recorded`);
    }

    // Test 3: Admin Dashboard API
    console.log('\n📊 Test 3: Admin Dashboard API');

    // Test unauthorized access
    console.log('\n🔐 Testing non-admin access...');
    
    let accessDenied = false;
    try {
      client.setToken(userToken);
      await client.get('/admin/dashboard');
      // If we get here without error, access was granted (bad!)
      console.error('❌ ERROR: Regular user was able to access admin dashboard!');
      throw new Error('Regular user should not access admin dashboard');
    } catch (error: any) {
      // Check if this is the expected 403 error from API
      if (error.message && error.message.includes('Missing required permissions')) {
        console.log('✅ Non-admin access correctly blocked with 403 Forbidden');
        accessDenied = true;
      } else if (error.response?.data?.statusCode === 403) {
        console.log('✅ Non-admin access correctly blocked with 403 Forbidden');
        accessDenied = true;
      } else if (error.message === 'Regular user should not access admin dashboard') {
        // This is our own error, re-throw it
        throw error;
      } else {
        console.error('❌ Unexpected error:', error.message);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    }
    
    if (!accessDenied) {
      throw new Error('Failed to verify access denial');
    }

    // Test admin access
    client.setToken(adminToken);
    const dashboard = await client.get('/admin/dashboard');

    TestAssertions.assertNotNull(dashboard.data.totalUsers);
    TestAssertions.assertNotNull(dashboard.data.dailyActiveUsers);
    TestAssertions.assertNotNull(dashboard.data.topCourses);
    TestAssertions.assertNotNull(dashboard.data.exercisesWithHighestErrors);

    console.log(`✅ Dashboard stats:`);
    console.log(`   Total Users: ${dashboard.data.totalUsers}`);
    console.log(`   Daily Active Users: ${dashboard.data.dailyActiveUsers}`);
    console.log(`   Top Courses: ${dashboard.data.topCourses.length}`);
    console.log(`   Problem Exercises: ${dashboard.data.exercisesWithHighestErrors.length}`);

    // Verify data structure
    if (dashboard.data.topCourses.length > 0) {
      const topCourse = dashboard.data.topCourses[0];
      TestAssertions.assertNotNull(topCourse.courseId);
      TestAssertions.assertNotNull(topCourse.userCount);
    }

    if (dashboard.data.exercisesWithHighestErrors.length > 0) {
      const problemExercise = dashboard.data.exercisesWithHighestErrors[0];
      TestAssertions.assertNotNull(problemExercise.exerciseId);
      TestAssertions.assertNotNull(problemExercise.errorRate);
      TestAssertions.assertNotNull(problemExercise.totalAttempts);
    }

    console.log('\n✅ All Vocabulary Enhancement Tests Passed!\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runVocabularyEnhancementsTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
