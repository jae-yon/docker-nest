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
    try {
      await this.transporter.verify();
      this.logger.log('Mail connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(`Mail connection failed: ${error}`);
      return false;
    }
  }

  // 이메일 형식 검증
  private async isValidEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 템플릿 생성
  private async renderTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join('dist/assets', 'templates', `${templateName}.hbs`);
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}: ${error.message}`);
      throw error;
    }
  }

  // 테스트 메일 발송
  async sendTestMail(email: string, name: string): Promise<nodemailer.SentMessageInfo> {
    const context = {
      name,
      timestamp: new Date().toISOString(),
    }

    const html = await this.renderTemplate('test', context);

    try {
      const info = await this.transporter.sendMail({
        from: 'Jae Young Kim',
        to: email,
        subject: '[Test Email]',
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
