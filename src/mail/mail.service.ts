import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
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

  private async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Mail connection verified successfully');
      return true;
    } catch (error) {
      console.error('Mail connection failed:', error);
      return false;
    }
  }

  async renderTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}:`, error.message);
      throw error;
    }
  }

  async sendMail(to: string, subject: string, templateName: string, context: any): Promise<nodemailer.SentMessageInfo> {
    try {
      const html = await this.renderTemplate(templateName, context);
      const info = await this.transporter.sendMail({
        from: `"Our Awesome Service" <${this.configService.get<string>('mail.auth.user')}>`,
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
