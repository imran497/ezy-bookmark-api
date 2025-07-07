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
  
  // Enhanced port configuration and logging
  const port = process.env.PORT || configService.get<number>('PORT', 3001);
  
  console.log(`🔧 Environment PORT: ${process.env.PORT}`);
  console.log(`⚙️  Config PORT: ${configService.get<number>('PORT', 3001)}`);
  console.log(`🎯 Final PORT: ${port}`);
  console.log(`🌐 Binding to: 0.0.0.0:${port}`);
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`✅ App successfully listening on 0.0.0.0:${port}`);
  logger.log(`🚀 EzyBookmark API is running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.log('❌ Failed to start EzyBookmark API:', error);
  process.exit(1);
});