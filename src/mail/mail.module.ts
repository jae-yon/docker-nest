import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

@Module({
  providers: [
    {
      provide: 'MAIL_TRANSPORTER',
      useFactory: (configService: ConfigService) => {
        return nodemailer.createTransport({
          host: configService.get('mail.host'),
          port: configService.get('mail.port'),
          secure: configService.get('mail.secure'),
          auth: configService.get('mail.auth')
        });
      },
      inject: [ConfigService],
    },
    MailService
  ],
  controllers: [MailController]
})
export class MailModule {}
