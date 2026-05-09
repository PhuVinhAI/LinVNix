import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { TestUsers } from '../utils/test-users';
import { courseFixtures, moduleFixtures, lessonFixtures } from '../fixtures/courses.fixture';

/**
 * Courses Module Test Suite
 */
export async function runCoursesTests() {
  console.log('\n📚 Running Courses Tests...\n');

  let authToken: string;
  let courseId: string;
  let moduleId: string;
  let lessonId: string;

  try {
    // Setup: Login admin (cần quyền admin để tạo courses)
    const admin = await TestUsers.loginAdmin();
    authToken = admin.token;

    // Test 1: Create course
    courseId = await testCreateCourse(authToken);

    // Test 2: Get all courses
    await testGetAllCourses(authToken);

    // Test 3: Get course by ID
    await testGetCourseById(authToken, courseId);

    // Test 4: Create module
    moduleId = await testCreateModule(authToken, courseId);

    // Test 5: Get modules by course
    await testGetModulesByCourse(authToken, courseId);

    // Test 6: Create lesson
    lessonId = await testCreateLesson(authToken, moduleId);

    // Test 7: Get lessons by module
    await testGetLessonsByModule(authToken, moduleId);

    // Test 8: Get lesson by ID
    await testGetLessonById(authToken, lessonId);

    // Test 9: Update course
    await testUpdateCourse(authToken, courseId);

    // Test 10: Update module
    await testUpdateModule(authToken, moduleId);

    // Test 11: Get module by ID
    await testGetModuleById(authToken, moduleId);

    // Test 12: Update lesson
    await testUpdateLesson(authToken, lessonId);

    // Test 13: Delete lesson
    await testDeleteLesson(authToken, lessonId);

    // Test 14: Delete module
    await testDeleteModule(authToken, moduleId);

    // Test 15: Delete course
    await testDeleteCourse(authToken, courseId);

    console.log('✅ All Courses tests passed!\n');
  } catch (error) {
    console.error('❌ Courses test failed:', error);
    throw error;
  }
}



/**
 * Test create course
 */
async function testCreateCourse(token: string): Promise<string> {
  console.log('📝 Test: Create course');

  apiClient.setToken(token);
  const course = courseFixtures.beginnerCourse;
  const response = await apiClient.post(endpoints.courses.create, course);

  TestAssertions.assertStatus(response.status, 201, 'Create course should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Course ID should be UUID');
  TestAssertions.assertEquals(response.data.title, course.title, 'Title should match');

  console.log('  ✓ Course created successfully');
  return response.data.id;
}

/**
 * Test get all courses
 */
async function testGetAllCourses(token: string) {
  console.log('📖 Test: Get all courses');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.courses.list);

  TestAssertions.assertStatus(response.status, 200, 'Get courses should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one course');

  console.log('  ✓ Courses retrieved successfully');
}

/**
 * Test get course by ID
 */
async function testGetCourseById(token: string, courseId: string) {
  console.log('🔍 Test: Get course by ID');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.courses.detail(courseId));

  TestAssertions.assertStatus(response.status, 200, 'Get course should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.id, courseId, 'Course ID should match');

  console.log('  ✓ Course retrieved successfully');
}

/**
 * Test create module
 */
async function testCreateModule(token: string, courseId: string): Promise<string> {
  console.log('📝 Test: Create module');

  apiClient.setToken(token);
  const module = moduleFixtures.greetingsModule(courseId);
  const response = await apiClient.post('/modules', module);

  TestAssertions.assertStatus(response.status, 201, 'Create module should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Module ID should be UUID');
  TestAssertions.assertEquals(response.data.title, module.title, 'Title should match');

  console.log('  ✓ Module created successfully');
  return response.data.id;
}

/**
 * Test get modules by course
 */
async function testGetModulesByCourse(token: string, courseId: string) {
  console.log('📖 Test: Get modules by course');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.modules.byCourse(courseId));

  TestAssertions.assertStatus(response.status, 200, 'Get modules should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one module');

  console.log('  ✓ Modules retrieved successfully');
}

/**
 * Test create lesson
 */
async function testCreateLesson(token: string, moduleId: string): Promise<string> {
  console.log('📝 Test: Create lesson');

  apiClient.setToken(token);
  const lesson = lessonFixtures.vocabularyLesson(moduleId);
  const response = await apiClient.post('/lessons', lesson);

  TestAssertions.assertStatus(response.status, 201, 'Create lesson should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Lesson ID should be UUID');
  TestAssertions.assertEquals(response.data.title, lesson.title, 'Title should match');

  console.log('  ✓ Lesson created successfully');
  return response.data.id;
}

/**
 * Test get lessons by module
 */
async function testGetLessonsByModule(token: string, moduleId: string) {
  console.log('📖 Test: Get lessons by module');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.lessons.byModule(moduleId));

  TestAssertions.assertStatus(response.status, 200, 'Get lessons should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one lesson');

  console.log('  ✓ Lessons retrieved successfully');
}

/**
 * Test get lesson by ID
 */
async function testGetLessonById(token: string, lessonId: string) {
  console.log('🔍 Test: Get lesson by ID');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.lessons.detail(lessonId));

  TestAssertions.assertStatus(response.status, 200, 'Get lesson should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.id, lessonId, 'Lesson ID should match');

  console.log('  ✓ Lesson retrieved successfully');
}

// Run tests if executed directly
if (require.main === module) {
  runCoursesTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

/**
 * Test update course
 */
async function testUpdateCourse(token: string, courseId: string) {
  console.log('✏️ Test: Update course');

  apiClient.setToken(token);
  const updateData = {
    title: 'Updated Course Title',
    description: 'Updated description',
  };
  const response = await apiClient.patch(endpoints.courses.update(courseId), updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update course should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.title, updateData.title, 'Title should be updated');

  console.log('  ✓ Course updated successfully');
}

/**
 * Test update module
 */
async function testUpdateModule(token: string, moduleId: string) {
  console.log('✏️ Test: Update module');

  apiClient.setToken(token);
  const updateData = {
    title: 'Updated Module Title',
    description: 'Updated module description',
  };
  const response = await apiClient.patch(`/modules/${moduleId}`, updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update module should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.title, updateData.title, 'Title should be updated');

  console.log('  ✓ Module updated successfully');
}

/**
 * Test get module by ID
 */
async function testGetModuleById(token: string, moduleId: string) {
  console.log('🔍 Test: Get module by ID');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.modules.detail(moduleId));

  TestAssertions.assertStatus(response.status, 200, 'Get module should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.id, moduleId, 'Module ID should match');

  console.log('  ✓ Module retrieved successfully');
}

/**
 * Test update lesson
 */
async function testUpdateLesson(token: string, lessonId: string) {
  console.log('✏️ Test: Update lesson');

  apiClient.setToken(token);
  const updateData = {
    title: 'Updated Lesson Title',
    description: 'Updated lesson description',
  };
  const response = await apiClient.patch(`/lessons/${lessonId}`, updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update lesson should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.title, updateData.title, 'Title should be updated');

  console.log('  ✓ Lesson updated successfully');
}

/**
 * Test delete lesson
 */
async function testDeleteLesson(token: string, lessonId: string) {
  console.log('🗑️ Test: Delete lesson');

  apiClient.setToken(token);
  const response = await apiClient.delete(`/lessons/${lessonId}`);

  TestAssertions.assertStatus(response.status, 200, 'Delete lesson should return 200');

  console.log('  ✓ Lesson deleted successfully');
}

/**
 * Test delete module
 */
async function testDeleteModule(token: string, moduleId: string) {
  console.log('🗑️ Test: Delete module');

  apiClient.setToken(token);
  const response = await apiClient.delete(`/modules/${moduleId}`);

  TestAssertions.assertStatus(response.status, 200, 'Delete module should return 200');

  console.log('  ✓ Module deleted successfully');
}

/**
 * Test delete course
 */
async function testDeleteCourse(token: string, courseId: string) {
  console.log('🗑️ Test: Delete course');

  apiClient.setToken(token);
  const response = await apiClient.delete(endpoints.courses.delete(courseId));

  TestAssertions.assertStatus(response.status, 200, 'Delete course should return 200');

  console.log('  ✓ Course deleted successfully');
}
