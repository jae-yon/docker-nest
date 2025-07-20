import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy{
  private readonly logger = new Logger(RedisService.name);

  private client: Redis;

  constructor(private configService: ConfigService) {}
  
  // 서비스 종료 상태 플래그
  private isShuttingDown = false;
  // 진행 중인 작업을 보관
  private pendingOperations = new Set<Promise<any>>();
  
  async onModuleInit() {
    const redisConfig = this.configService.get('redis');
    
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        if (times > 10) {
          this.logger.error('Redis reconnect attempts exhausted');
          return null;
        }
        return delay;
      }
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client is ready');
    });

    this.client.on('close', () => {
      this.logger.log('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown signal received: ${signal}`);
    await this.gracefulShutdown();
  }

  private async gracefulShutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    // 진행 중인 작업 완료 대기
    if (this.pendingOperations.size > 0) {
      this.logger.log(`Waiting for ${this.pendingOperations.size} pending operations...`);
      await Promise.allSettled(Array.from(this.pendingOperations));
    }

    // 연결 종료
    await this.closeConnection();
  }

  private async closeConnection() {
    if (!this.client || this.client.status === 'end') {
      this.logger.log('Redis connection already closed');
      return;
    }

    try {
      await Promise.race([
        this.client.quit(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Redis quit timeout')), 5000);
        })
      ]);
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
      if (this.client.status !== 'close') {
        this.client.disconnect();
      }
    }
  }

  private trackOperation<T>(operation: Promise<T>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down, no new operation accepted');
    }
    
    this.pendingOperations.add(operation);
    operation.finally(() => this.pendingOperations.delete(operation));
    return operation;
  }
  
  async ping(): Promise<string> {
    this.logger.log('Pinging Redis server...');
    // return await this.client.ping();
    return this.trackOperation(this.client.ping());
  }
  
  async info(): Promise<string> {
    this.logger.log('Fetching Redis server info...');
    // return await this.client.info();
    return this.trackOperation(this.client.info());
  }
}
