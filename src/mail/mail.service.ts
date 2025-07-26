import { Inject, Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_TRANSPORTER')
    private readonly transporter: nodemailer.Transporter
  ) {}

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Mail connection failed:', error);
      return false;
    }
  }
}
