import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { userFixtures } from '../fixtures/users.fixture';
import { courseFixtures, unitFixtures, lessonFixtures } from '../fixtures/courses.fixture';

/**
 * Courses Module Test Suite
 */
export async function runCoursesTests() {
  console.log('\n📚 Running Courses Tests...\n');

  let authToken: string;
  let courseId: string;
  let unitId: string;
  let lessonId: string;

  try {
    // Setup: Register and login
    authToken = await setupAuth();

    // Test 1: Create course
    courseId = await testCreateCourse(authToken);

    // Test 2: Get all courses
    await testGetAllCourses(authToken);

    // Test 3: Get course by ID
    await testGetCourseById(authToken, courseId);

    // Test 4: Create unit
    unitId = await testCreateUnit(authToken, courseId);

    // Test 5: Get units by course
    await testGetUnitsByCourse(authToken, courseId);

    // Test 6: Create lesson
    lessonId = await testCreateLesson(authToken, unitId);

    // Test 7: Get lessons by unit
    await testGetLessonsByUnit(authToken, unitId);

    // Test 8: Get lesson by ID
    await testGetLessonById(authToken, lessonId);

    console.log('✅ All Courses tests passed!\n');
  } catch (error) {
    console.error('❌ Courses test failed:', error);
    throw error;
  }
}

/**
 * Setup authentication
 */
async function setupAuth(): Promise<string> {
  const user = userFixtures.randomUser();
  const response = await apiClient.post(endpoints.auth.register, user);
  return response.data.access_token;
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
 * Test create unit
 */
async function testCreateUnit(token: string, courseId: string): Promise<string> {
  console.log('📝 Test: Create unit');

  apiClient.setToken(token);
  const unit = unitFixtures.greetingsUnit(courseId);
  const response = await apiClient.post('/units', unit);

  TestAssertions.assertStatus(response.status, 201, 'Create unit should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Unit ID should be UUID');
  TestAssertions.assertEquals(response.data.title, unit.title, 'Title should match');

  console.log('  ✓ Unit created successfully');
  return response.data.id;
}

/**
 * Test get units by course
 */
async function testGetUnitsByCourse(token: string, courseId: string) {
  console.log('📖 Test: Get units by course');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.units.byCourse(courseId));

  TestAssertions.assertStatus(response.status, 200, 'Get units should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertArrayNotEmpty(response.data, 'Should have at least one unit');

  console.log('  ✓ Units retrieved successfully');
}

/**
 * Test create lesson
 */
async function testCreateLesson(token: string, unitId: string): Promise<string> {
  console.log('📝 Test: Create lesson');

  apiClient.setToken(token);
  const lesson = lessonFixtures.vocabularyLesson(unitId);
  const response = await apiClient.post('/lessons', lesson);

  TestAssertions.assertStatus(response.status, 201, 'Create lesson should return 201');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'Lesson ID should be UUID');
  TestAssertions.assertEquals(response.data.title, lesson.title, 'Title should match');

  console.log('  ✓ Lesson created successfully');
  return response.data.id;
}

/**
 * Test get lessons by unit
 */
async function testGetLessonsByUnit(token: string, unitId: string) {
  console.log('📖 Test: Get lessons by unit');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.lessons.byUnit(unitId));

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
