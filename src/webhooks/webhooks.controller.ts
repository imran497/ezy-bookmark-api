import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';
import { LoggerService } from '../common/logger.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Body() body: any,
    @Headers('clerk-signature') signature: string,
  ) {
    try {
      // Get webhook secret from environment
      const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
      
      if (!webhookSecret) {
        this.logger.warn('Clerk webhook secret not configured', 'WebhooksController');
        // In development, we might want to allow webhooks without verification
        if (this.configService.get<string>('NODE_ENV') !== 'development') {
          throw new UnauthorizedException('Webhook secret not configured');
        }
      }

      // Verify webhook signature in production
      if (webhookSecret && signature) {
        const isValid = await this.webhooksService.verifyWebhookSignature(
          JSON.stringify(body),
          signature,
          webhookSecret,
        );

        if (!isValid) {
          throw new UnauthorizedException('Invalid webhook signature');
        }
      }

      // Process the webhook
      await this.webhooksService.handleClerkWebhook(body);

      return { success: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error, 'WebhooksController');
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to process webhook');
    }
  }
}