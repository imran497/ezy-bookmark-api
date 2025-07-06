import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  private async ensureUserExists(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      // Create user if doesn't exist
      const user = await this.prisma.user.create({
        data: {
          clerkId: userId,
          username: `user_${userId.slice(-8)}`,
          email: null,
          firstName: null,
          lastName: null,
          profileUrl: null,
        },
      });
      this.logger.log(`Auto-created user: ${user.username} (${user.clerkId})`, 'BookmarksService');
      return user;
    }

    return existingUser;
  }

  async create(userId: string, createBookmarkDto: CreateBookmarkDto) {
    try {
      // Ensure user exists
      await this.ensureUserExists(userId);

      // Check if tool exists
      const tool = await this.prisma.tool.findUnique({
        where: { id: createBookmarkDto.toolId },
      });

      if (!tool) {
        throw new NotFoundException('Tool not found');
      }

      // Check if bookmark already exists
      const existingBookmark = await this.prisma.bookmark.findUnique({
        where: {
          userId_toolId: {
            userId,
            toolId: createBookmarkDto.toolId,
          },
        },
      });

      if (existingBookmark) {
        throw new ConflictException('Tool is already bookmarked');
      }

      const bookmark = await this.prisma.bookmark.create({
        data: {
          userId,
          toolId: createBookmarkDto.toolId,
          isPinned: createBookmarkDto.isPinned || false,
        },
        include: {
          tool: true,
        },
      });

      this.logger.log(`Bookmark created: ${userId} -> ${tool.name}`, 'BookmarksService');
      return bookmark;
    } catch (error) {
      this.logger.error(`Failed to create bookmark: ${error.message}`, error, 'BookmarksService');
      throw error;
    }
  }

  async findUserBookmarks(userId: string) {
    // Ensure user exists
    await this.ensureUserExists(userId);

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        tool: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks;
  }

  async findUserPinnedTools(userId: string) {
    // Ensure user exists
    await this.ensureUserExists(userId);

    const pinnedBookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
        isPinned: true,
      },
      include: {
        tool: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pinnedBookmarks;
  }

  async togglePin(userId: string, toolId: string, isPinned: boolean) {
    try {
      // Ensure user exists
      await this.ensureUserExists(userId);

      // Check if bookmark exists
      const bookmark = await this.prisma.bookmark.findUnique({
        where: {
          userId_toolId: {
            userId,
            toolId,
          },
        },
        include: {
          tool: true,
        },
      });

      if (!bookmark) {
        // If bookmark doesn't exist and we're trying to pin, create it
        if (isPinned) {
          return this.create(userId, { toolId, isPinned: true });
        } else {
          throw new NotFoundException('Bookmark not found');
        }
      }

      // Update pin status
      const updatedBookmark = await this.prisma.bookmark.update({
        where: {
          userId_toolId: {
            userId,
            toolId,
          },
        },
        data: { isPinned },
        include: {
          tool: true,
        },
      });

      this.logger.log(
        `Bookmark ${isPinned ? 'pinned' : 'unpinned'}: ${userId} -> ${bookmark.tool.name}`,
        'BookmarksService',
      );

      return updatedBookmark;
    } catch (error) {
      this.logger.error(`Failed to toggle pin: ${error.message}`, error, 'BookmarksService');
      throw error;
    }
  }

  async update(userId: string, toolId: string, updateBookmarkDto: UpdateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
      data: updateBookmarkDto,
      include: {
        tool: true,
      },
    });

    this.logger.log(`Bookmark updated: ${userId} -> ${toolId}`, 'BookmarksService');
    return updatedBookmark;
  }

  async remove(userId: string, toolId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
      include: {
        tool: true,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    this.logger.log(`Bookmark removed: ${userId} -> ${bookmark.tool.name}`, 'BookmarksService');
  }

  async getBookmarkStatus(userId: string, toolId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });

    return {
      isBookmarked: !!bookmark,
      isPinned: bookmark?.isPinned || false,
    };
  }

  async getUserStats(userId: string) {
    const [totalBookmarks, pinnedCount] = await Promise.all([
      this.prisma.bookmark.count({
        where: { userId },
      }),
      this.prisma.bookmark.count({
        where: {
          userId,
          isPinned: true,
        },
      }),
    ]);

    return {
      totalBookmarks,
      pinnedCount,
      unpinnedCount: totalBookmarks - pinnedCount,
    };
  }
}