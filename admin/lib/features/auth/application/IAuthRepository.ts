import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../../../core/domain/types/api.types';

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>;
}
