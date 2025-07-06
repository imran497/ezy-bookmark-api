import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): { message: string; version: string; documentation: string } {
    return {
      message: '🔖 Welcome to EzyBookmark API',
      version: '1.0.0',
      documentation: '/api/health for health checks',
    };
  }
}