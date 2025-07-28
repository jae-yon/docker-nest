import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('status')
  async mailerStatus() {
    const isConnected = await this.mailService.verifyConnection();
    return { connected: isConnected};
  }

  @Post('test')
  async sendTestMail(@Body() mail) {
    const { to, subject = 'Test Email', message = 'This is a test email.' } = mail;

    // HTML 템플릿 생성
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              margin: 20px 0;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .footer {
              margin-top: 20px;
              padding: 10px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>테스트 이메일</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
            <p>이 메일은 ${new Date().toLocaleString('ko-KR')}에 전송되었습니다.</p>
          </div>
          <div class="footer">
            <p>이 메일은 테스트 목적으로 전송된 메일입니다.</p>
          </div>
        </body>
      </html>
    `;

    try {
      const result = await this.mailService.sendMail(to, subject, html);
      
      return {
        success: true,
        message: '메일이 성공적으로 전송되었습니다.',
        messageId: result.messageId,
        to,
        subject,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: '메일 전송에 실패했습니다.',
        error: error.message,
        to,
        subject
      };
    }
  }
}
