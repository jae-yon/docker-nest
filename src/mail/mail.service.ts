import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit{
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('MAIL_TRANSPORTER')
    private readonly transporter: nodemailer.Transporter,
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
}
