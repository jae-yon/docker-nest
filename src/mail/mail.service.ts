import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit{
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('MAIL_TRANSPORTER')
    private readonly transporter: nodemailer.Transporter,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.verifyConnection();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Mail connection verified successfully');
      return true;
    } catch (error) {
      console.error('Mail connection failed:', error);
      return false;
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('mail.auth.user'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Failed to send email:', error.message);
      throw error;
    }
  }
}
