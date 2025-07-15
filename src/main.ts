import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port');
  const host = configService.get<string>('app.host');

  await app.listen(port ?? 5000);

  logger.log(`Application is running on: http://${host}:${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
});
