import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../common/queue.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private logger: LoggerService,
  ) {}

  async getBasicHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }

  async getDetailedHealth() {
    const startTime = Date.now();

    try {
      // Check database health
      const dbHealthy = await this.checkDatabaseHealth();
      
      // Check memory usage
      const memoryUsage = this.getMemoryUsage();
      
      // Check queue status
      const queueStats = this.queueService.getQueueStats();
      
      // Get system stats
      const systemStats = await this.getSystemStats();

      const responseTime = Date.now() - startTime;

      return {
        status: dbHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        uptime: process.uptime(),
        version: '1.0.0',
        checks: {
          database: {
            status: dbHealthy ? 'healthy' : 'unhealthy',
            responseTime: `${responseTime}ms`,
          },
          queue: {
            status: 'healthy',
            pending: queueStats.pending,
            processing: queueStats.processing,
          },
          memory: {
            status: memoryUsage.percentage < 90 ? 'healthy' : 'warning',
            usage: memoryUsage,
          },
        },
        system: systemStats,
      };
    } catch (error) {
      this.logger.error('Health check failed', error, 'HealthService');
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      return await this.prisma.healthCheck();
    } catch (error) {
      this.logger.error('Database health check failed', error, 'HealthService');
      return false;
    }
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal + usage.external;
    const usedMemory = usage.heapUsed + usage.external;
    
    return {
      heapUsed: this.formatBytes(usage.heapUsed),
      heapTotal: this.formatBytes(usage.heapTotal),
      external: this.formatBytes(usage.external),
      rss: this.formatBytes(usage.rss),
      total: this.formatBytes(totalMemory),
      used: this.formatBytes(usedMemory),
      percentage: Math.round((usedMemory / totalMemory) * 100),
    };
  }

  private async getSystemStats() {
    const toolsCount = await this.prisma.tool.count();
    const usersCount = await this.prisma.user.count();
    const bookmarksCount = await this.prisma.bookmark.count();
    const clickEventsCount = await this.prisma.clickEvent.count();

    return {
      tools: toolsCount,
      users: usersCount,
      bookmarks: bookmarksCount,
      clickEvents: clickEventsCount,
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}