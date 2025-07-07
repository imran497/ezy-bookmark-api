import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { LoggerService } from './common/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  
  // Security
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  // CORS
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  
  const port = configService.get<number>('PORT', 3001);
  
  await app.listen(configService.get('PORT', '3001'), () =>
    console.log('App listening on ' + configService.get('PORT', '3001')),
  );
  logger.log(`🚀 EzyBookmark API is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start EzyBookmark API:', error);
  process.exit(1);
});