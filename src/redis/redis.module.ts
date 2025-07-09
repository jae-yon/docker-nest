import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

import { ConfigModule } from '@nestjs/config';
import redisConfig from '@/config/redis.config';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
