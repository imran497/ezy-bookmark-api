import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const responseTime = Date.now() - startTime;
        
        // Log request details
        this.logger.log(
          `${method} ${url} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`,
          'HTTP',
        );

        // Log slow requests
        if (responseTime > 1000) {
          this.logger.warn(
            `Slow request detected: ${method} ${url} took ${responseTime}ms`,
            'PerformanceMonitor',
          );
        }
      }),
    );
  }
}