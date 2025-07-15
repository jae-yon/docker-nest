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

  app.enableShutdownHooks();

  process.on('SIGTERM', async () => {
	  logger.log('SIGTERM received, shutting down gracefully');
	  await app.close();
	});
	
	process.on('SIGINT', async () => {
	  logger.log('SIGINT received, shutting down gracefully');
	  await app.close();
	});

  process.on('uncaughtException', (error) => {
	  logger.error('Uncaught Exception:', error);
	  process.exit(1);
	});

  process.on('unhandledRejection', (reason, promise) => {
	  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
	  process.exit(1);
	});
  
  await app.listen(port ?? 5000);

  logger.log(`Application is running on: http://${host}:${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
});
