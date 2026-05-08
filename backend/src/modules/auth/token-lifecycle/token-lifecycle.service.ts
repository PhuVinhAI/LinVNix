import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { ITokenRepository } from './interfaces';
import {
  TOKEN_REPOSITORY,
  VerificationTokenResult,
  VerifiedEmailResult,
} from './interfaces';

@Injectable()
export class TokenLifecycle {
  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly repo: ITokenRepository,
  ) {}

  async createVerificationToken(
    userId: string,
  ): Promise<VerificationTokenResult> {
    await this.repo.deleteUnverifiedByUserId(userId);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.repo.save(token, userId, expiresAt);

    return { token, expiresAt };
  }

  async verifyEmailToken(token: string): Promise<VerifiedEmailResult | null> {
    const entry = await this.repo.findUnverifiedByToken(token);
    if (!entry) return null;
    if (entry.expiresAt < new Date()) return null;

    await this.repo.markVerified(token);

    return {
      userId: entry.userId,
      email: entry.email,
      fullName: entry.fullName,
    };
  }

  async cleanupExpired(): Promise<void> {
    await this.repo.deleteExpired();
  }
}
