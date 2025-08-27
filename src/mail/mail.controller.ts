import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async sendTestMail(@Body() email: string, name: string) {
    return await this.mailService.sendTestMail(email, name);
  }
}
