import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { ClerkGuard } from '../auth/clerk.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('bookmarks')
@UseGuards(ClerkGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarksService.create(user.userId, createBookmarkDto);
  }

  @Get()
  findUserBookmarks(@CurrentUser() user: CurrentUserData) {
    return this.bookmarksService.findUserBookmarks(user.userId);
  }

  @Get('pinned')
  findUserPinnedTools(@CurrentUser() user: CurrentUserData) {
    return this.bookmarksService.findUserPinnedTools(user.userId);
  }

  @Get('stats')
  getUserStats(@CurrentUser() user: CurrentUserData) {
    return this.bookmarksService.getUserStats(user.userId);
  }

  @Get('status')
  getBookmarkStatus(
    @CurrentUser() user: CurrentUserData,
    @Query('toolId') toolId: string,
  ) {
    return this.bookmarksService.getBookmarkStatus(user.userId, toolId);
  }

  @Patch(':toolId/pin')
  togglePin(
    @CurrentUser() user: CurrentUserData,
    @Param('toolId') toolId: string,
    @Body() body: { isPinned: boolean },
  ) {
    return this.bookmarksService.togglePin(user.userId, toolId, body.isPinned);
  }

  @Patch(':toolId')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('toolId') toolId: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    return this.bookmarksService.update(user.userId, toolId, updateBookmarkDto);
  }

  @Delete(':toolId')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('toolId') toolId: string,
  ) {
    return this.bookmarksService.remove(user.userId, toolId);
  }
}