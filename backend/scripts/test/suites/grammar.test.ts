import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { TestUsers } from '../utils/test-users';
import { courseFixtures, unitFixtures, lessonFixtures } from '../fixtures/courses.fixture';

/**
 * Grammar Module Test Suite
 */
export async function runGrammarTests() {
  console.log('\n📚 Running Grammar Tests...\n');

  let adminToken: string;
  let lessonId: string;
  let grammarId: string;

  try {
    // Setup: Create course structure với admin token
    const setup = await setupCourseStructure();
    adminToken = setup.token;
    lessonId = setup.lessonId;

    // Test 1: Create grammar rule (admin)
    grammarId = await testCreateGrammar(adminToken, lessonId);

    // Test 2: Get grammar by lesson (public)
    await testGetGrammarByLesson(lessonId);

    // Test 3: Get grammar by ID (public)
    await testGetGrammarById(grammarId);

    // Test 4: Update grammar (admin)
    await testUpdateGrammar(adminToken, grammarId);

    // Test 5: Delete grammar (admin)
    await testDeleteGrammar(adminToken, grammarId);

    console.log('✅ All Grammar tests passed!\n');
  } catch (error) {
    console.error('❌ Grammar test failed:', error);
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

  const unit = unitFixtures.greetingsUnit(courseId);
  const unitResponse = await apiClient.post('/units', unit);
  const unitId = unitResponse.data.id;

  const lesson = lessonFixtures.grammarLesson(unitId);
  const lessonResponse = await apiClient.post('/lessons', lesson);
  const lessonId = lessonResponse.data.id;

  return { token: admin.token, lessonId };
}

/**
 * Test create grammar
 */
async function testCreateGrammar(token: string, lessonId: string): Promise<string> {
  console.log('📝 Test: Create grammar rule');

  apiClient.setToken(token);
  const grammar = {
    lessonId,
    title: 'Subject-Verb-Object Order',
    explanation: 'Vietnamese follows SVO word order like English',
    examples: [
      { vietnamese: 'Tôi ăn cơm', english: 'I eat rice' },
      { vietnamese: 'Anh học tiếng Việt', english: 'You study Vietnamese' },
    ],
    notes: 'This is the most basic sentence structure',
  };
  const response = await apiClient.post('/grammar', grammar);

  TestAssertions.assertStatus(response.status, 201, 'Create grammar should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Grammar ID should be UUID');
  TestAssertions.assertEquals(response.data.title, grammar.title, 'Title should match');

  console.log('  ✓ Grammar rule created successfully');
  return response.data.id;
}

/**
 * Test get grammar by lesson
 */
async function testGetGrammarByLesson(lessonId: string) {
  console.log('📖 Test: Get grammar by lesson');

  const response = await apiClient.get(`/grammar/lesson/${lessonId}`);

  TestAssertions.assertStatus(response.status, 200, 'Get grammar should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one grammar rule');

  console.log('  ✓ Grammar rules retrieved successfully');
}

/**
 * Test get grammar by ID
 */
async function testGetGrammarById(grammarId: string) {
  console.log('🔍 Test: Get grammar by ID');

  const response = await apiClient.get(`/grammar/${grammarId}`);

  TestAssertions.assertStatus(response.status, 200, 'Get grammar should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.id, grammarId, 'Grammar ID should match');

  console.log('  ✓ Grammar rule retrieved successfully');
}

/**
 * Test update grammar
 */
async function testUpdateGrammar(token: string, grammarId: string) {
  console.log('✏️ Test: Update grammar');

  apiClient.setToken(token);
  const updateData = {
    title: 'Updated Grammar Title',
    notes: 'Updated notes',
  };
  const response = await apiClient.patch(`/grammar/${grammarId}`, updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update grammar should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.title, updateData.title, 'Title should be updated');

  console.log('  ✓ Grammar rule updated successfully');
}

/**
 * Test delete grammar
 */
async function testDeleteGrammar(token: string, grammarId: string) {
  console.log('🗑️ Test: Delete grammar');

  apiClient.setToken(token);
  const response = await apiClient.delete(`/grammar/${grammarId}`);

  TestAssertions.assertStatus(response.status, 200, 'Delete grammar should return 200');

  console.log('  ✓ Grammar rule deleted successfully');
}

// Run tests if executed directly
if (require.main === module) {
  runGrammarTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
