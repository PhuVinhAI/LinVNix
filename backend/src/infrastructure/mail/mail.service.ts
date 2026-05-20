import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggingService } from '../logging/logging.service';
import {
  buildMailTemplateContext,
  formatMailTimestamp,
} from './mail-template.context';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private loggingService: LoggingService,
  ) {}

  private baseContext() {
    return buildMailTemplateContext();
  }

  async sendVerificationEmail(
    email: string,
    fullName: string,
    _token: string,
    code?: string,
  ) {
    if (process.env.SKIP_MAIL_SENDING === 'true') {
      this.loggingService.log(
        `[SKIPPED] Verification email for: ${email}`,
        'MailService',
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[LinVNix] Verify your email',
        template: 'verification',
        context: {
          ...this.baseContext(),
          fullName,
          code: code || '',
        },
      });

      this.loggingService.log(
        `Verification email sent to: ${email}`,
        'MailService',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to send verification email to: ${email}`,
        error.stack,
        'MailService',
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    if (process.env.SKIP_MAIL_SENDING === 'true') {
      this.loggingService.log(
        `[SKIPPED] Welcome email for: ${email}`,
        'MailService',
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[LinVNix] Welcome to LinVNix',
        template: 'welcome',
        context: {
          ...this.baseContext(),
          fullName,
        },
      });

      this.loggingService.log(`Welcome email sent to: ${email}`, 'MailService');
    } catch (error) {
      this.loggingService.error(
        `Failed to send welcome email to: ${email}`,
        error.stack,
        'MailService',
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    _token: string,
    code?: string,
  ) {
    if (process.env.SKIP_MAIL_SENDING === 'true') {
      this.loggingService.log(
        `[SKIPPED] Password reset email for: ${email}`,
        'MailService',
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[LinVNix] Reset your password',
        template: 'password-reset',
        context: {
          ...this.baseContext(),
          fullName,
          code: code || '',
          expiresIn: '15 phút',
        },
      });

      this.loggingService.log(
        `Password reset email sent to: ${email}`,
        'MailService',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to send password reset email to: ${email}`,
        error.stack,
        'MailService',
      );
      throw error;
    }
  }

  async sendPasswordChangedEmail(email: string, fullName: string) {
    if (process.env.SKIP_MAIL_SENDING === 'true') {
      this.loggingService.log(
        `[SKIPPED] Password changed email for: ${email}`,
        'MailService',
      );
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[LinVNix] Your password was changed',
        template: 'password-changed',
        context: {
          ...this.baseContext(),
          fullName,
          timestamp: formatMailTimestamp(),
        },
      });

      this.loggingService.log(
        `Password changed notification sent to: ${email}`,
        'MailService',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to send password changed email to: ${email}`,
        error.stack,
        'MailService',
      );
    }
  }
}
