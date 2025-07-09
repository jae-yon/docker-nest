import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0,
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis client is ready');
    });

    this.redis.on('close', () => {
      this.logger.log('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
  
  async ping(): Promise<string> {
    this.logger.log('Pinging Redis server...');
    return await this.redis.ping();
  }
  
  async info(): Promise<string> {
    this.logger.log('Fetching Redis server info...');
    return await this.redis.info();
  }
}
