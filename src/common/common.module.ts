import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { QueueService } from './queue.service';

@Global()
@Module({
  providers: [LoggerService, QueueService],
  exports: [LoggerService, QueueService],
})
export class CommonModule {}