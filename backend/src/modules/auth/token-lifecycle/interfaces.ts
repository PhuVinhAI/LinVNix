export interface VerificationTokenResult {
  token: string;
  expiresAt: Date;
}

export interface VerifiedEmailResult {
  userId: string;
  email: string;
  fullName: string;
}

export interface ITokenRepository {
  save(token: string, userId: string, expiresAt: Date): Promise<void>;
  findUnverifiedByToken(token: string): Promise<{
    userId: string;
    expiresAt: Date;
    email: string;
    fullName: string;
  } | null>;
  markVerified(token: string): Promise<void>;
  deleteUnverifiedByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');
