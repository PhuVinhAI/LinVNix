import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/application/users.service';
import { LoggingService } from '../../infrastructure/logging/logging.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private loggingService: LoggingService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);
      const token = this.generateToken(user.id, user.email);
      
      this.loggingService.log(
        `User registered: ${user.email}`,
        'AuthService',
      );
      
      return {
        user,
        access_token: token,
      };
    } catch (error) {
      this.loggingService.error(
        `Registration failed: ${registerDto.email}`,
        error.stack,
        'AuthService',
      );
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        this.loggingService.warn(
          `Login attempt with non-existent email: ${loginDto.email}`,
          'AuthService',
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.usersService.validatePassword(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        this.loggingService.warn(
          `Failed login attempt for user: ${loginDto.email}`,
          'AuthService',
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.generateToken(user.id, user.email);
      
      this.loggingService.log(
        `User logged in: ${user.email}`,
        'AuthService',
      );
      
      return {
        user,
        access_token: token,
      };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        this.loggingService.error(
          `Login error: ${loginDto.email}`,
          error.stack,
          'AuthService',
        );
      }
      throw error;
    }
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
