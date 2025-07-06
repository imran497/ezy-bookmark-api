import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ClerkGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // In a real implementation, you would verify the Clerk JWT token here
      // For now, we'll just check if the token exists and starts with expected format
      if (!token.startsWith('eyJ')) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Extract user information from token (simplified for demo)
      // In production, use Clerk's JWT verification
      const payload = this.decodeToken(token);
      request['user'] = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private decodeToken(token: string): any {
    // Simplified token decoding - in production use proper JWT verification
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return {
        userId: payload.sub || payload.user_id,
        email: payload.email,
        username: payload.username,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to decode token');
    }
  }
}