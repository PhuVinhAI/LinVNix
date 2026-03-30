import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { userFixtures } from '../fixtures/users.fixture';

/**
 * Users Module Test Suite
 */
export async function runUsersTests() {
  console.log('\n👤 Running Users Tests...\n');

  let authToken: string;
  let userId: string;

  try {
    // Setup: Register and login
    const user = userFixtures.randomUser();
    const registerResponse = await apiClient.post(endpoints.auth.register, user);
    authToken = registerResponse.data.access_token;
    userId = registerResponse.data.user.id;
    apiClient.setToken(authToken);

    // Test 1: Get profile
    await testGetProfile(authToken, user.email);

    // Test 2: Update profile
    await testUpdateProfile(authToken);

    console.log('✅ All Users tests passed!\n');
  } catch (error) {
    console.error('❌ Users test failed:', error);
    throw error;
  }
}

/**
 * Test get profile
 */
async function testGetProfile(token: string, expectedEmail: string) {
  console.log('👤 Test: Get profile');

  apiClient.setToken(token);
  const response = await apiClient.get(endpoints.users.me);

  TestAssertions.assertStatus(response.status, 200, 'Get profile should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertIsUUID(response.data.id, 'User ID should be UUID');
  TestAssertions.assertEquals(response.data.email, expectedEmail, 'Email should match');

  console.log('  ✓ Profile retrieved successfully');
}

/**
 * Test update profile
 */
async function testUpdateProfile(token: string) {
  console.log('✏️ Test: Update profile');

  apiClient.setToken(token);
  const updateData = {
    fullName: 'Updated Name',
    currentLevel: 'A2',
  };
  const response = await apiClient.patch(endpoints.users.me, updateData);

  TestAssertions.assertStatus(response.status, 200, 'Update profile should return 200');
  TestAssertions.assertHasData(response, 'Response should have data');
  TestAssertions.assertEquals(response.data.fullName, updateData.fullName, 'Name should be updated');
  TestAssertions.assertEquals(response.data.currentLevel, updateData.currentLevel, 'Level should be updated');

  console.log('  ✓ Profile updated successfully');
}

// Run tests if executed directly
if (require.main === module) {
  runUsersTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
