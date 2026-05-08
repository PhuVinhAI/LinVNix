import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ITokenRepository } from './interfaces';
import { EmailVerificationToken } from '../domain/email-verification-token.entity';

@Injectable()
export class TypeOrmTokenRepository implements ITokenRepository {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly repo: Repository<EmailVerificationToken>,
  ) {}

  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    const entity = this.repo.create({ token, userId, expiresAt });
    await this.repo.save(entity);
  }

  async findUnverifiedByToken(token: string): Promise<{
    userId: string;
    expiresAt: Date;
    email: string;
    fullName: string;
  } | null> {
    const entity = await this.repo.findOne({
      where: { token, verifiedAt: null as any },
      relations: ['user'],
    });
    if (!entity) return null;
    return {
      userId: entity.userId,
      expiresAt: entity.expiresAt,
      email: entity.user.email,
      fullName: entity.user.fullName,
    };
  }

  async markVerified(token: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { token } });
    if (entity) {
      entity.verifiedAt = new Date();
      await this.repo.save(entity);
    }
  }

  async deleteUnverifiedByUserId(userId: string): Promise<void> {
    await this.repo.delete({ userId, verifiedAt: null as any });
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({ expiresAt: LessThan(new Date()) });
  }
}
