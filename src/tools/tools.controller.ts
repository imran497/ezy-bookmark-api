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
import { Throttle } from '@nestjs/throttler';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolsByCategoryDto, PopularToolsDto, CleanupDto } from './dto/analytics.dto';
import { ClerkGuard } from '../auth/clerk.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  create(@Body() createToolDto: CreateToolDto) {
    return this.toolsService.create(createToolDto);
  }

  @Get()
  findAll(@Query() query: QueryToolsDto) {
    return this.toolsService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.toolsService.getCategories();
  }

  @Get('by-category')
  getToolsByCategories(@Query() query: ToolsByCategoryDto) {
    return this.toolsService.getToolsByCategories(query);
  }

  @Get('popular')
  getPopularTools(@Query() query: PopularToolsDto) {
    return this.toolsService.getPopularTools(query);
  }

  @Get('analytics/clicks')
  getClickAnalytics(@Query('toolId') toolId?: string) {
    return this.toolsService.getClickAnalytics(toolId);
  }

  @Get('analytics/top')
  getTopTools(@Query() query: PopularToolsDto) {
    return this.toolsService.getPopularTools(query);
  }

  @Post('cleanup/click-events')
  @Throttle({ default: { limit: 1, ttl: 3600000 } }) // 1 request per hour
  cleanupOldClickEvents(@Query() query: CleanupDto) {
    return this.toolsService.cleanupOldClickEvents(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolsService.update(id, updateToolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toolsService.remove(id);
  }

  @Post(':id/visit')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 visits per minute per tool
  incrementUsage(@Param('id') id: string) {
    return this.toolsService.incrementUsage(id);
  }

  @Delete('clear-all')
  @UseGuards(ClerkGuard)
  async clearAll(@CurrentUser() user: CurrentUserData) {
    // This is a dangerous operation, should be restricted to admins
    // For now, just log who attempted it
    console.log(`User ${user.userId} attempted to clear all tools`);
    throw new Error('This operation is not implemented for safety reasons');
  }
}