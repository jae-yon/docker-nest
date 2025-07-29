import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('welcome')
  async sendTestMail(@Body() email: string, name: string) {
    const to = email;
    const subject = 'Welcome to Our Service';
    const templateName = 'welcome';
    const context = {
      userName: name,
      serviceName: 'Our Awesome Service',
      signupDate: new Date().toLocaleString('ko-KR'),
      currentYear: new Date().getFullYear(),
    };

    try {
      const result = await this.mailService.sendMail(to, subject, templateName, context);
      return {
        success: true,
        message: 'mail sent successfully',
        messageId: result.messageId,
        to,
        subject,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'mail sending failed',
        error: error.message,
        to,
        subject
      };
    }
  }
}
