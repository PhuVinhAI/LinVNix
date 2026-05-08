import { ITokenRepository } from './interfaces';

interface TokenRecord {
  token: string;
  userId: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  email: string;
  fullName: string;
}

export class InMemoryTokenRepository implements ITokenRepository {
  private tokens = new Map<string, TokenRecord>();
  private users = new Map<string, { email: string; fullName: string }>();

  addUser(userId: string, email: string, fullName: string = 'Test User') {
    this.users.set(userId, { email, fullName });
  }

  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    const user = this.users.get(userId) || { email: '', fullName: '' };
    this.tokens.set(token, {
      token,
      userId,
      expiresAt,
      verifiedAt: null,
      ...user,
    });
  }

  async findUnverifiedByToken(token: string): Promise<{
    userId: string;
    expiresAt: Date;
    email: string;
    fullName: string;
  } | null> {
    const entry = this.tokens.get(token);
    if (!entry || entry.verifiedAt !== null) return null;
    return {
      userId: entry.userId,
      expiresAt: entry.expiresAt,
      email: entry.email,
      fullName: entry.fullName,
    };
  }

  async markVerified(token: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry) entry.verifiedAt = new Date();
  }

  async deleteUnverifiedByUserId(userId: string): Promise<void> {
    for (const [key, entry] of this.tokens.entries()) {
      if (entry.userId === userId && entry.verifiedAt === null) {
        this.tokens.delete(key);
      }
    }
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    for (const [key, entry] of this.tokens.entries()) {
      if (entry.expiresAt < now) this.tokens.delete(key);
    }
  }

  setTokenExpiry(token: string, expiresAt: Date): void {
    const entry = this.tokens.get(token);
    if (entry) entry.expiresAt = expiresAt;
  }
}
