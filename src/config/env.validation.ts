import { plainToInstance, Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, validateSync, IsEnum } from 'class-validator';

enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  CLERK_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  CLERK_WEBHOOK_SECRET?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT?: number = 3001;

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  @IsOptional()
  @IsString()
  ALLOWED_ORIGINS?: string = 'http://localhost:3000';

  @IsOptional()
  @IsEnum(LogLevel)
  LOG_LEVEL?: LogLevel = LogLevel.INFO;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  RATE_LIMIT_TTL?: number = 60000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  RATE_LIMIT_MAX?: number = 100;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  CACHE_TTL?: number = 300000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  CACHE_MAX_ITEMS?: number = 100;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}