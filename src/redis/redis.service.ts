import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0,
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.redis.on('ready', () => {
      console.log('Redis client is ready');
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
  // Redis 연결 상태 확인
  async ping(): Promise<string> {
    return await this.redis.ping();
  }
  // Redis 서버 정보 조회
  async info(): Promise<string> {
    return await this.redis.info();
  }
}
