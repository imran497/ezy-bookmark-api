import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger.service';

interface ClerkWebhookData {
  type: string;
  data: {
    id: string;
    username?: string;
    email_addresses?: Array<{ email_address: string; id: string }>;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
}

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async handleClerkWebhook(webhookData: ClerkWebhookData) {
    const { type, data } = webhookData;

    try {
      switch (type) {
        case 'user.created':
          await this.handleUserCreated(data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(data);
          break;
        default:
          this.logger.warn(`Unhandled webhook type: ${type}`, 'WebhooksService');
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook ${type}`, error, 'WebhooksService');
      throw error;
    }
  }

  private async handleUserCreated(userData: any) {
    const primaryEmail = userData.email_addresses?.find((email: any) => 
      email.id === userData.primary_email_address_id
    )?.email_address;

    const user = await this.prisma.user.create({
      data: {
        clerkId: userData.id,
        username: userData.username || `user_${userData.id.slice(-8)}`,
        email: primaryEmail,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profileUrl: userData.profile_image_url,
      },
    });

    this.logger.log(`User created: ${user.username} (${user.clerkId})`, 'WebhooksService');
    return user;
  }

  private async handleUserUpdated(userData: any) {
    const primaryEmail = userData.email_addresses?.find((email: any) => 
      email.id === userData.primary_email_address_id
    )?.email_address;

    const user = await this.prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        username: userData.username,
        email: primaryEmail,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profileUrl: userData.profile_image_url,
      },
    });

    this.logger.log(`User updated: ${user.username} (${user.clerkId})`, 'WebhooksService');
    return user;
  }

  private async handleUserDeleted(userData: any) {
    // Delete user and all associated data
    const deletedUser = await this.prisma.user.delete({
      where: { clerkId: userData.id },
    });

    this.logger.log(`User deleted: ${deletedUser.username} (${deletedUser.clerkId})`, 'WebhooksService');
    return deletedUser;
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    try {
      // In a real implementation, you would verify the Clerk webhook signature
      // This is a simplified version for demo purposes
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch (error) {
      this.logger.error('Failed to verify webhook signature', error, 'WebhooksService');
      return false;
    }
  }
}