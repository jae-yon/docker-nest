import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';

import appConfig from './config/app.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [
        appConfig,
        redisConfig
      ]
    }),
    MailModule,
    RedisModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
