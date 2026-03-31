import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { userFixtures } from '../fixtures/users.fixture';

/**
 * RBAC (Role-Based Access Control) Test Suite
 * Tests permissions and role-based authorization
 */
export async function runRbacTests() {
  console.log('\n🎭 Running RBAC Tests...\n');

  let normalUser = userFixtures.randomUser();
  let normalUserToken: string;

  try {
    // Setup: Create normal user
    const registerResponse = await apiClient.post(endpoints.auth.register, normalUser);
    normalUserToken = registerResponse.data.access_token;

    // Test 1: Normal user can read courses (public)
    await testUserCanReadCourses();

    // Test 2: Normal user cannot create courses (admin only)
    await testUserCannotCreateCourse(normalUserToken);

    // Test 3: Normal user cannot delete courses (admin only)
    await testUserCannotDeleteCourse(normalUserToken);

    // Test 4: Normal user has USER role
    await testUserHasUserRole(normalUserToken);

    // Test 5: Normal user can access own profile
    await testUserCanAccessOwnProfile(normalUserToken);

    console.log('✅ All RBAC tests passed!\n');
  } catch (error) {
    console.error('❌ RBAC test failed:', error);
    throw error;
  }
}

/**
 * Test user can read courses (public endpoint)
 */
async function testUserCanReadCourses() {
  console.log('📖 Test: User can read courses (public)');

  const response = await apiClient.get(endpoints.courses.list);

  TestAssertions.assertStatus(response.status, 200, 'Should be able to read courses');
  TestAssertions.assertTrue(Array.isArray(response.data), 'Should return array of courses');

  console.log('  ✓ User can read courses');
}

/**
 * Test user cannot create course (requires COURSE_CREATE permission)
 */
async function testUserCannotCreateCourse(token: string) {
  console.log('🚫 Test: User cannot create course (admin only)');

  apiClient.setToken(token);

  try {
    await apiClient.post(endpoints.courses.create, {
      title: 'Test Course',
      description: 'Test Description',
      level: 'A1',
    });
    throw new Error('Should have been denied - user does not have COURSE_CREATE permission');
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('  ✓ User correctly denied from creating course');
    } else {
      throw error;
    }
  }
}

/**
 * Test user cannot delete course (requires COURSE_DELETE permission)
 */
async function testUserCannotDeleteCourse(token: string) {
  console.log('🚫 Test: User cannot delete course (admin only)');

  apiClient.setToken(token);

  try {
    // Try to delete a fake course ID
    await apiClient.delete(endpoints.courses.delete('00000000-0000-0000-0000-000000000000'));
    throw new Error('Should have been denied - user does not have COURSE_DELETE permission');
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.log('  ✓ User correctly denied from deleting course');
    } else {
      throw error;
    }
  }
}

/**
 * Test user has USER role
 */
async function testUserHasUserRole(token: string) {
  console.log('🎭 Test: User has USER role');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.users.me);

  TestAssertions.assertHasProperty(response.data, 'roles', 'User should have roles');
  TestAssertions.assertTrue(Array.isArray(response.data.roles), 'Roles should be array');
  
  const hasUserRole = response.data.roles.some((role: any) => role.name === 'USER');
  TestAssertions.assertTrue(hasUserRole, 'User should have USER role');

  const hasAdminRole = response.data.roles.some((role: any) => role.name === 'ADMIN');
  TestAssertions.assertFalse(hasAdminRole, 'Normal user should NOT have ADMIN role');

  console.log('  ✓ User has correct USER role');
}

/**
 * Test user can access own profile
 */
async function testUserCanAccessOwnProfile(token: string) {
  console.log('👤 Test: User can access own profile');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.users.me);

  TestAssertions.assertStatus(response.status, 200, 'Should access own profile');
  TestAssertions.assertHasProperty(response.data, 'id', 'Should have user ID');
  TestAssertions.assertHasProperty(response.data, 'email', 'Should have email');

  console.log('  ✓ User can access own profile');
}

// Run tests if executed directly
if (require.main === module) {
  runRbacTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
