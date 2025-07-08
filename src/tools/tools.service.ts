import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger.service';
import { QueueService } from '../common/queue.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolsByCategoryDto, PopularToolsDto, CleanupDto } from './dto/analytics.dto';

@Injectable()
export class ToolsService {
  private readonly categories = [
    'Development & Technical',
    'Data & Analytics',
    'Business & Productivity',
    'Communication & Chat',
    'Creative & Media',
    'Content & Writing',
    'SEO & Marketing',
    'Entertainment',
    'AI Tools',
  ];

  private readonly categoryPatterns = {
    'Development & Technical': [
      'github.com', 'stackoverflow.com', 'codepen.io', 'replit.com',
      'vercel.com', 'netlify.com', 'heroku.com', 'docker.com'
    ],
    'Data & Analytics': [
      'tableau.com', 'powerbi.microsoft.com', 'analytics.google.com',
      'mixpanel.com', 'amplitude.com', 'segment.com'
    ],
    'Business & Productivity': [
      'notion.so', 'airtable.com', 'monday.com', 'asana.com',
      'trello.com', 'slack.com', 'zoom.us', 'calendly.com'
    ],
    'Communication & Chat': [
      'discord.com', 'telegram.org', 'whatsapp.com', 'messenger.com',
      'teams.microsoft.com', 'meet.google.com'
    ],
    'Creative & Media': [
      'figma.com', 'canva.com', 'adobe.com', 'unsplash.com',
      'pexels.com', 'dribbble.com', 'behance.net'
    ],
    'Content & Writing': [
      'grammarly.com', 'hemingwayapp.com', 'medium.com',
      'substack.com', 'wordpress.com', 'ghost.org'
    ],
    'SEO & Marketing': [
      'semrush.com', 'ahrefs.com', 'moz.com', 'mailchimp.com',
      'hubspot.com', 'hootsuite.com', 'buffer.com'
    ],
    'Entertainment': [
      'spotify.com', 'netflix.com', 'youtube.com', 'twitch.tv',
      'steam.com', 'epic.games.com', 'itch.io'
    ],
    'AI Tools': [
      'openai.com', 'anthropic.com', 'huggingface.co', 'stability.ai',
      'midjourney.com', 'replicate.com', 'runwayml.com'
    ],
  };

  private readonly keywordCategories = {
    'Development & Technical': [
      'code', 'programming', 'developer', 'api', 'github', 'deployment',
      'hosting', 'database', 'framework', 'library', 'tools', 'ide'
    ],
    'Data & Analytics': [
      'analytics', 'data', 'dashboard', 'visualization', 'metrics',
      'tracking', 'insights', 'reporting', 'statistics'
    ],
    'Business & Productivity': [
      'productivity', 'project', 'management', 'collaboration', 'workspace',
      'organization', 'planning', 'calendar', 'meeting', 'task'
    ],
    'Communication & Chat': [
      'chat', 'messaging', 'communication', 'video', 'call', 'meeting',
      'conference', 'social', 'community'
    ],
    'Creative & Media': [
      'design', 'creative', 'art', 'photo', 'image', 'video', 'graphics',
      'ui', 'ux', 'illustration', 'animation'
    ],
    'Content & Writing': [
      'writing', 'content', 'blog', 'editor', 'grammar', 'text',
      'document', 'publishing', 'cms'
    ],
    'SEO & Marketing': [
      'seo', 'marketing', 'email', 'social media', 'advertising',
      'analytics', 'campaign', 'automation', 'growth'
    ],
    'Entertainment': [
      'game', 'music', 'movie', 'entertainment', 'streaming', 'media',
      'fun', 'leisure', 'hobby'
    ],
    'AI Tools': [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt',
      'neural', 'automation', 'generate', 'predict'
    ],
  };

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private queueService: QueueService,
  ) {}

  async create(createToolDto: CreateToolDto) {
    try {
      // Check if tool already exists
      const existingTool = await this.prisma.tool.findUnique({
        where: { url: createToolDto.url },
      });

      if (existingTool) {
        throw new BadRequestException('Tool with this URL already exists');
      }

      // Validate URL
      await this.validateUrl(createToolDto.url);

      // Extract metadata if not provided
      const metadata = await this.extractMetadata(createToolDto.url);
      
      const toolData = {
        url: createToolDto.url,
        name: createToolDto.name || metadata.name || this.extractDomainName(createToolDto.url),
        description: createToolDto.description || metadata.description || '',
        category: createToolDto.category || this.categorizeUrl(createToolDto.url, metadata),
        tags: createToolDto.tags || metadata.tags || [],
        favicon: createToolDto.favicon || metadata.favicon || '',
        addedBy: createToolDto.addedBy || 'Anonymous',
      };

      const tool = await this.prisma.tool.create({
        data: toolData,
      });

      this.logger.log(`Tool created: ${tool.name} (${tool.url})`, 'ToolsService');
      return tool;
    } catch (error) {
      this.logger.error(`Failed to create tool: ${error.message}`, error, 'ToolsService');
      throw error;
    }
  }

  async findAll(query: QueryToolsDto) {
    const { search, category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [tools, total] = await Promise.all([
      this.prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tool.count({ where }),
    ]);

    return {
      tools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} not found`);
    }

    return tool;
  }

  async update(id: string, updateToolDto: UpdateToolDto) {
    const existingTool = await this.findOne(id);

    // If URL is being updated, validate it
    if (updateToolDto.url && updateToolDto.url !== existingTool.url) {
      await this.validateUrl(updateToolDto.url);
    }

    const tool = await this.prisma.tool.update({
      where: { id },
      data: updateToolDto,
    });

    this.logger.log(`Tool updated: ${tool.name}`, 'ToolsService');
    return tool;
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure tool exists

    await this.prisma.tool.delete({
      where: { id },
    });

    this.logger.log(`Tool deleted: ${id}`, 'ToolsService');
  }

  async incrementUsage(id: string) {
    try {
      const tool = await this.prisma.tool.update({
        where: { id },
        data: {
          usageCount: {
            increment: 1,
          },
        },
        select: { id: true, name: true, usageCount: true },
      });

      // Log click event asynchronously
      await this.queueService.addTask('log_click_event', { toolId: id });

      return tool;
    } catch (error) {
      this.logger.error(`Failed to increment usage for tool ${id}`, error, 'ToolsService');
      throw error;
    }
  }

  async getCategories() {
    return this.categories;
  }

  async getToolsByCategories(query: ToolsByCategoryDto) {
    const { limit = 8 } = query;

    const result: Record<string, any[]> = {};

    for (const category of this.categories) {
      const tools = await this.prisma.tool.findMany({
        where: { category },
        take: limit,
        orderBy: { usageCount: 'desc' },
      });
      result[category] = tools;
    }

    return result;
  }

  async getPopularTools(query: PopularToolsDto) {
    const { limit = 10 } = query;

    return this.prisma.tool.findMany({
      take: limit,
      orderBy: { usageCount: 'desc' },
    });
  }

  async getClickAnalytics(toolId?: string) {
    const where = toolId ? { toolId } : {};

    const [total, last24h, last7d, last30d] = await Promise.all([
      this.prisma.clickEvent.count({ where }),
      this.prisma.clickEvent.count({
        where: {
          ...where,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.clickEvent.count({
        where: {
          ...where,
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.clickEvent.count({
        where: {
          ...where,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalClicks: total,
      last24Hours: last24h,
      last7Days: last7d,
      last30Days: last30d,
    };
  }

  async cleanupOldClickEvents(query: CleanupDto) {
    const { retentionDays = 90 } = query;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.clickEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old click events older than ${retentionDays} days`, 'ToolsService');
    return { deletedCount: result.count };
  }

  private async validateUrl(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'EzyBookmark/1.0 (+https://ezybookmark.com)',
        },
      });
      
      clearTimeout(timeoutId);

      // Accept 200-299, 403, and 429 status codes
      // 403 and 429 are common for sites with anti-bot protection (like Cloudflare)
      return response.ok || response.status === 403 || response.status === 429;
    } catch (error) {
      this.logger.warn(`URL validation failed for ${url}: ${error.message}`, 'ToolsService');
      return false;
    }
  }

  private async extractMetadata(url: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EzyBookmark/1.0; +https://ezybookmark.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      
      clearTimeout(timeoutId);

      this.logger.log(`Metadata extraction for ${url}: ${response.status} ${response.statusText}`, 'ToolsService');

      if (!response.ok) {
        this.logger.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`, 'ToolsService');
        return this.getFallbackMetadata(url);
      }

      const html = await response.text();
      
      // More comprehensive title extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                         html.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      
      // More comprehensive description extraction  
      const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i) ||
                        html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      
      // More comprehensive favicon extraction
      const faviconMatch = html.match(/<link[^>]*rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i);

      const metadata = {
        name: titleMatch ? titleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        favicon: faviconMatch ? this.resolveUrl(faviconMatch[1], url) : '',
        tags: [],
      };

      this.logger.log(`Extracted metadata for ${url}: name="${metadata.name}"`, 'ToolsService');
      return metadata;
    } catch (error) {
      this.logger.error(`Failed to extract metadata from ${url}: ${error.message}`, error, 'ToolsService');
      return this.getFallbackMetadata(url);
    }
  }

  private getFallbackMetadata(url: string) {
    const domain = this.extractDomain(url);
    
    // Enhanced fallback metadata for known domains
    const knownDomains = {
      'github.com': { name: 'GitHub', description: 'Platform for software development and version control', tags: ['development', 'git', 'code'] },
      'openai.com': { name: 'OpenAI', description: 'AI research company creating safe and beneficial AI', tags: ['ai', 'gpt', 'research'] },
      'figma.com': { name: 'Figma', description: 'Collaborative design tool for teams', tags: ['design', 'ui', 'collaboration'] },
      'notion.so': { name: 'Notion', description: 'All-in-one workspace for notes, docs, and collaboration', tags: ['productivity', 'workspace', 'docs'] },
      'canva.com': { name: 'Canva', description: 'Graphic design platform for creating visual content', tags: ['design', 'graphics', 'templates'] },
      'youtube.com': { name: 'YouTube', description: 'Video sharing and streaming platform', tags: ['video', 'streaming', 'entertainment'] },
      'spotify.com': { name: 'Spotify', description: 'Music streaming service', tags: ['music', 'streaming', 'entertainment'] },
      'namecheap.com': { name: 'Namecheap', description: 'Domain registration and web hosting services', tags: ['domains', 'hosting', 'web'] },
    };

    return knownDomains[domain] || {
      name: this.extractDomainName(url),
      description: `A tool from ${domain}`,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      tags: [],
    };
  }

  private categorizeUrl(url: string, metadata: any): string {
    const domain = this.extractDomain(url);
    const text = `${metadata.name} ${metadata.description} ${url}`.toLowerCase();

    // Check domain patterns first
    for (const [category, domains] of Object.entries(this.categoryPatterns)) {
      if (domains.some(d => domain.includes(d))) {
        return category;
      }
    }

    // Check keyword patterns
    let bestMatch = { category: 'AI Tools', score: 0 };

    for (const [category, keywords] of Object.entries(this.keywordCategories)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }

    return bestMatch.category;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  private extractDomainName(url: string): string {
    const domain = this.extractDomain(url);
    const parts = domain.split('.');
    const domainName = parts.length > 1 ? parts[parts.length - 2] : domain;
    
    // Capitalize first letter for better presentation
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }
}