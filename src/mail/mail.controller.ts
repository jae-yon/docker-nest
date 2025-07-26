import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('status')
  async mailerStatus() {
    const isConnected = await this.mailService.verifyConnection();
    return { connected: isConnected};
  }
}
