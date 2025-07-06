import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

interface QueueTask {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

@Injectable()
export class QueueService {
  private queue: QueueTask[] = [];
  private processing = false;
  private readonly maxRetries = 3;
  private readonly processInterval = 1000; // 1 second

  constructor(private readonly logger: LoggerService) {
    this.startProcessing();
  }

  async addTask(type: string, data: any, maxAttempts = this.maxRetries): Promise<void> {
    const task: QueueTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    };

    this.queue.push(task);
    this.logger.debug(`Task added to queue: ${type}`, 'QueueService');
  }

  private startProcessing(): void {
    setInterval(() => {
      if (!this.processing && this.queue.length > 0) {
        this.processNextTask();
      }
    }, this.processInterval);
  }

  private async processNextTask(): Promise<void> {
    if (this.queue.length === 0) return;

    this.processing = true;
    const task = this.queue.shift();

    if (!task) {
      this.processing = false;
      return;
    }

    try {
      task.attempts++;
      await this.executeTask(task);
      this.logger.debug(`Task completed: ${task.type}`, 'QueueService');
    } catch (error) {
      this.logger.error(`Task failed: ${task.type} (attempt ${task.attempts}/${task.maxAttempts})`, error, 'QueueService');
      
      if (task.attempts < task.maxAttempts) {
        // Retry with exponential backoff
        setTimeout(() => {
          this.queue.unshift(task);
        }, Math.pow(2, task.attempts) * 1000);
      } else {
        this.logger.error(`Task permanently failed: ${task.type}`, undefined, 'QueueService');
      }
    } finally {
      this.processing = false;
    }
  }

  private async executeTask(task: QueueTask): Promise<void> {
    switch (task.type) {
      case 'increment_usage':
        // This would be handled by the tools service
        break;
      case 'cleanup_old_events':
        // This would be handled by a cleanup service
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  getQueueStats(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing,
    };
  }
}