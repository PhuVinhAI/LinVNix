import { apiClient } from '../utils/api-client';
import { TestAssertions } from '../utils/assertions';
import { endpoints } from '../config/test.config';
import { userFixtures } from '../fixtures/users.fixture';

/**
 * Scenario 1: Complete Authentication Flow
 * 
 * User journey:
 * 1. Register new account
 * 2. Login with credentials
 * 3. Access protected resource
 * 4. Update profile
 * 5. Logout (clear token)
 */
export async function runAuthScenario() {
  console.log('\n🎬 Scenario 1: Complete Authentication Flow\n');
  console.log('User Story: New user registers, logs in, and manages their profile\n');

  let userId: string;
  let authToken: string;
  const user = userFixtures.randomUser();

  try {
    // Step 1: Register new account
    console.log('Step 1: User registers a new account');
    const registerResponse = await apiClient.post(endpoints.auth.register, user);
    
    TestAssertions.assertStatus(registerResponse.status, 201);
    TestAssertions.assertHasProperty(registerResponse.data, 'access_token');
    TestAssertions.assertHasProperty(registerResponse.data, 'user');
    
    authToken = registerResponse.data.access_token;
    userId = registerResponse.data.user.id;
    
    console.log(`  ✓ User registered with ID: ${userId}`);
    console.log(`  ✓ Received access token\n`);

    // Step 2: Login with credentials
    console.log('Step 2: User logs in with credentials');
    const loginResponse = await apiClient.post(endpoints.auth.login, {
      email: user.email,
      password: user.password,
    });
    
    TestAssertions.assertStatus(loginResponse.status, 201);
    TestAssertions.assertHasProperty(loginResponse.data, 'access_token');
    
    authToken = loginResponse.data.access_token;
    console.log('  ✓ Login successful');
    console.log('  ✓ New access token received\n');

    // Step 3: Access protected resource (get profile)
    console.log('Step 3: User accesses their profile');
    apiClient.setToken(authToken);
    const profileResponse = await apiClient.get(endpoints.users.me);
    
    TestAssertions.assertStatus(profileResponse.status, 200);
    TestAssertions.assertEquals(profileResponse.data.id, userId);
    TestAssertions.assertEquals(profileResponse.data.email, user.email);
    
    console.log('  ✓ Profile retrieved successfully');
    console.log(`  ✓ Email: ${profileResponse.data.email}`);
    console.log(`  ✓ Level: ${profileResponse.data.currentLevel}\n`);

    // Step 4: Update profile
    console.log('Step 4: User updates their profile');
    const updateData = {
      fullName: 'Updated Name',
      currentLevel: 'A2',
    };
    const updateResponse = await apiClient.patch(endpoints.users.updateMe, updateData);
    
    TestAssertions.assertStatus(updateResponse.status, 200);
    TestAssertions.assertEquals(updateResponse.data.fullName, updateData.fullName);
    TestAssertions.assertEquals(updateResponse.data.currentLevel, updateData.currentLevel);
    
    console.log('  ✓ Profile updated successfully');
    console.log(`  ✓ New name: ${updateResponse.data.fullName}`);
    console.log(`  ✓ New level: ${updateResponse.data.currentLevel}\n`);

    // Step 5: Logout (clear token)
    console.log('Step 5: User logs out');
    apiClient.clearToken();
    console.log('  ✓ Token cleared\n');

    console.log('✅ Authentication scenario completed successfully!\n');
    console.log('Summary:');
    console.log(`  - User ID: ${userId}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Final Level: A2`);
    console.log(`  - All authentication flows working correctly\n`);

  } catch (error) {
    console.error('❌ Authentication scenario failed:', error);
    throw error;
  }
}

// Run scenario if executed directly
if (require.main === module) {
  runAuthScenario()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
