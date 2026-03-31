import { apiClient } from './api-client';
import { endpoints } from '../config/test.config';

/**
 * Test user helpers - tạo admin và user cho tests
 */
export class TestUsers {
  /**
   * Login admin user (phải tạo trước bằng npm run admin:create)
   */
  static async loginAdmin(): Promise<{ email: string; password: string; token: string }> {
    const adminEmail = 'admin@linvnix.test';
    const adminPassword = 'Admin123456!';

    try {
      const loginResponse = await apiClient.post(endpoints.auth.login, {
        email: adminEmail,
        password: adminPassword,
      });
      
      return {
        email: adminEmail,
        password: adminPassword,
        token: loginResponse.data.access_token,
      };
    } catch (error) {
      console.log('\n  ⚠️  Admin user chưa tồn tại!');
      console.log('  📝 Chạy lệnh: npm run admin:create');
      console.log('  📧 Email: admin@linvnix.test');
      console.log('  🔑 Password: Admin123456!\n');
      throw new Error('Admin user not found. Please run: npm run admin:create');
    }
  }

  /**
   * Tạo normal user cho test
   */
  static async createUser(): Promise<{ email: string; password: string; token: string }> {
    const email = `user-${Date.now()}@linvnix.test`;
    const password = 'User123456!';

    const registerResponse = await apiClient.post(endpoints.auth.register, {
      email,
      password,
      fullName: 'Test User',
      nativeLanguage: 'English',
    });

    return {
      email,
      password,
      token: registerResponse.data.access_token,
    };
  }
}
