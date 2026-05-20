import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get('mail.transport'),
        defaults: configService.get('mail.defaults'),
        template: {
          dir: configService.get('mail.template.dir'),
          adapter: new HandlebarsAdapter(),
          options: configService.get('mail.template.options'),
        },
        // Layout must live at root `options`, not under `template.options`
        // (see HandlebarsAdapter: mailerOptions.options.layout).
        options: {
          layout: 'layout',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
