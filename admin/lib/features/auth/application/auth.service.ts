import type { IAuthRepository } from './IAuthRepository';
import type { LoginRequest, LoginResponse } from '../../../core/domain/types/api.types';
import { LocalStorage } from '../../../core/infrastructure/storage/LocalStorage';
import { STORAGE_KEYS } from '../../../shared/constants';
import { AppError } from '../../../shared/errors/AppError';
import { Role } from '../../../core/domain/enums';

export class AuthService {
  constructor(private repository: IAuthRepository) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.repository.login(credentials);

    if (!response || !response.user) {
      throw AppError.badRequest('Invalid login response from server');
    }

    const hasAdminRole = response.user.roles?.some((role) => role.name === Role.ADMIN);
    if (!hasAdminRole) {
      throw AppError.forbidden('Bạn không có quyền truy cập trang quản trị');
    }

    this.saveAuthData(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.repository.logout();
    } finally {
      this.clearAuthData();
    }
  }

  getCurrentUser() {
    return LocalStorage.get(STORAGE_KEYS.USER);
  }

  isAuthenticated(): boolean {
    const token = LocalStorage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    const user = this.getCurrentUser();
    return !!token && !!user;
  }

  private saveAuthData(response: LoginResponse): void {
    LocalStorage.set(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    LocalStorage.set(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
    LocalStorage.set(STORAGE_KEYS.USER, response.user);
  }

  private clearAuthData(): void {
    LocalStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    LocalStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    LocalStorage.remove(STORAGE_KEYS.USER);
  }
}
