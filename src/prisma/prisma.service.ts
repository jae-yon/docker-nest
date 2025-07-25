import { Injectable, OnModuleInit, OnModuleDestroy, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  // 서비스 종료 상태 플래그
  private isShuttingDown = false;
  // 진행 중인 작업을 보관
  private pendingOperations = new Set<Promise<any>>();
  // 재시도 관련 변수
  private retries = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000;

  async onModuleInit() {
    await this.retryStrategy();
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown signal received: ${signal}`);
    await this.gracefulShutdown();
  }
  // 재연결 전략
  private async retryStrategy() {
    this.retries = 0;
    while (this.retries < this.maxRetries) {
      try {
        await this.$connect();
        this.logger.log('Prisma connected successfully');
        break;
      } catch (error) {
        this.retries++;
        this.logger.error(`Connection attempt ${this.retries} failed:`, error.message);

        if (this.retries < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retries));
        } else {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }
      }
    }
  }
  
  private async gracefulShutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    if (this.pendingOperations.size > 0) {
      this.logger.log(`Waiting for ${this.pendingOperations.size} pending operations...`);
      await Promise.allSettled(Array.from(this.pendingOperations));
    }

    await this.closeConnection();
  }
  // 연결 종료 메소드
  private async closeConnection() {
    try {
      await Promise.race([
        this.$disconnect(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Prisma disconnect timeout')), 5000);
        })
      ]);
      this.logger.log('Prisma connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Prisma connection:', error);
    }
  }
  // 작업 추적 메소드
  private async trackOperation<T>(operation: Promise<T>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down, no new operation accepted');
    }

    this.pendingOperations.add(operation);

    try {
      const result = await operation;
      return result;
    } finally {
      this.pendingOperations.delete(operation);
    }
  }
}
