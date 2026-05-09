import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { TestUsers } from '../utils/test-users';
import { courseFixtures, moduleFixtures, lessonFixtures } from '../fixtures/courses.fixture';

/**
 * Contents Module Test Suite
 */
export async function runContentsTests() {
  console.log('\n📄 Running Contents Tests...\n');

  let adminToken: string;
  let lessonId: string;
  let contentId: string;

  try {
    // Setup: Create course structure với admin token
    const setup = await setupCourseStructure();
    adminToken = setup.token;
    lessonId = setup.lessonId;

    // Test 1: Create content (admin)
    contentId = await testCreateContent(adminToken, lessonId);

    // Test 2: Get contents by lesson (public)
    await testGetContentsByLesson(lessonId);

    // Test 3: Get content by ID (public)
    await testGetContentById(contentId);

    // Test 4: Update content (admin)
    await testUpdateContent(adminToken, contentId);

    // Test 5: Delete content (admin)
    await testDeleteContent(adminToken, contentId);

    console.log('✅ All Contents tests passed!\n');
  } catch (error) {
    console.error('❌ Contents test failed:', error);
    throw error;
  }
}

/**
 * Setup course structure
 */
async function setupCourseStructure() {
  // Login admin để tạo course structure
  const admin = await TestUsers.loginAdmin();
  apiClient.setToken(admin.token);

  const course = courseFixtures.beginnerCourse;
  const courseResponse = await apiClient.post(endpoints.courses.create, course);
  const courseId = courseResponse.data.id;

  const module = moduleFixtures.greetingsModule(courseId);
  const moduleResponse = await apiClient.post('/modules', module);
  const moduleId = moduleResponse.data.id;

  const lesson = lessonFixtures.vocabularyLesson(moduleId);
  const lessonResponse = await apiClient.post('/lessons', lesson);
  const lessonId = lessonResponse.data.id;

  return { token: admin.token, lessonId };
}

/**
 * Test create content
 */
async function testCreateContent(token: string, lessonId: string): Promise<string> {
  console.log('📝 Test: Create content');

  apiClient.setToken(token);
  const content = {
    lessonId,
    contentType: 'text',
    vietnameseText: 'Xin chào! Tôi là Minh.',
    translation: 'Hello! I am Minh.',
    orderIndex: 1,
  };
  const response = await apiClient.post('/contents', content);

  TestAssertions.assertStatus(response.status, 201, 'Create content should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Content ID should be UUID');

  console.log('  ✓ Content created successfully');
  return response.data.id;
}

/**
 * Test get contents by lesson
 */
async function testGetContentsByLesson(lessonId: string) {
  console.log('📖 Test: Get contents by lesson');

  const response = await apiClient.get(`/contents/lesson/${lessonId}`);

  TestAssertions.assertStatus(response.status, 200, 'Get contents should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one content');

  console.log('  ✓ Contents retrieved successfully');
}

/**
 * Test get content by ID
 */
async function testGetContentById(contentId: string) {
  console.log('🔍 Test: Get content by ID');

  const response = await apiClient.get(`/contents/${contentId}`);

  TestAssertions.assertStatus(response.status, 200, 'Get content should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.id, contentId, 'Content ID should match');

  console.log('  ✓ Content retrieved successfully');
}

/**
 * Test update content
 */
async function testUpdateContent(token: string, contentId: string) {
  console.log('✏️ Test: Update content');

  apiClient.setToken(token);
  const updateData = {
    vietnameseText: 'Xin chào! Tôi là Lan.',
    translation: 'Hello! I am Lan.',
  };
  const response = await apiClient.patch(`/contents/${contentId}`, updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update content should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');

  console.log('  ✓ Content updated successfully');
}

/**
 * Test delete content
 */
async function testDeleteContent(token: string, contentId: string) {
  console.log('🗑️ Test: Delete content');

  apiClient.setToken(token);
  const response = await apiClient.delete(`/contents/${contentId}`);

  TestAssertions.assertStatus(response.status, 200, 'Delete content should return 200');

  console.log('  ✓ Content deleted successfully');
}

// Run tests if executed directly
if (require.main === module) {
  runContentsTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
