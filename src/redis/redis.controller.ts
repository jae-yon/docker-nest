import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('ping')
  async ping() {
    try {
      const result = await this.redisService.ping();
      return {
        success: true,
        message: 'Redis connection is healthy',
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Redis connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  @Get('info')
  async getInfo() {
    try {
      const info = await this.redisService.info();
      return {
        success: true,
        info,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Redis info',
        error: error.message,
      };
    }
  }
}
