import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTools = [
  {
    name: 'ChatGPT',
    description: 'AI-powered conversational assistant for various tasks',
    url: 'https://chat.openai.com',
    category: 'AI Tools',
    tags: ['ai', 'chat', 'assistant', 'gpt'],
    favicon: 'https://chat.openai.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'GitHub',
    description: 'Platform for version control and collaborative software development',
    url: 'https://github.com',
    category: 'Development & Technical',
    tags: ['git', 'development', 'code', 'collaboration'],
    favicon: 'https://github.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Figma',
    description: 'Collaborative design tool for UI/UX design and prototyping',
    url: 'https://figma.com',
    category: 'Creative & Media',
    tags: ['design', 'ui', 'ux', 'collaboration', 'prototyping'],
    favicon: 'https://figma.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, and project management',
    url: 'https://notion.so',
    category: 'Business & Productivity',
    tags: ['productivity', 'notes', 'docs', 'workspace'],
    favicon: 'https://notion.so/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Grammarly',
    description: 'AI-powered writing assistant for grammar and style improvements',
    url: 'https://grammarly.com',
    category: 'Content & Writing',
    tags: ['writing', 'grammar', 'ai', 'editing'],
    favicon: 'https://grammarly.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Discord',
    description: 'Communication platform for communities and gaming',
    url: 'https://discord.com',
    category: 'Communication & Chat',
    tags: ['chat', 'communication', 'gaming', 'community'],
    favicon: 'https://discord.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Google Analytics',
    description: 'Web analytics service for tracking website traffic and user behavior',
    url: 'https://analytics.google.com',
    category: 'Data & Analytics',
    tags: ['analytics', 'data', 'tracking', 'insights'],
    favicon: 'https://analytics.google.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Ahrefs',
    description: 'SEO and marketing toolset for keyword research and backlink analysis',
    url: 'https://ahrefs.com',
    category: 'SEO & Marketing',
    tags: ['seo', 'marketing', 'keywords', 'backlinks'],
    favicon: 'https://ahrefs.com/favicon.ico',
    addedBy: 'System',
  },
  {
    name: 'Spotify',
    description: 'Music streaming service with millions of songs and podcasts',
    url: 'https://spotify.com',
    category: 'Entertainment',
    tags: ['music', 'streaming', 'entertainment', 'podcasts'],
    favicon: 'https://spotify.com/favicon.ico',
    addedBy: 'System',
  },
];

async function main() {
  console.log('🌱 Starting EzyBookmark database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.clickEvent.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.user.deleteMany();

  // Seed tools
  console.log('🔧 Seeding tools...');
  for (const tool of sampleTools) {
    await prisma.tool.create({
      data: tool,
    });
  }

  // Create sample user (for testing)
  console.log('👤 Creating sample user...');
  const sampleUser = await prisma.user.create({
    data: {
      clerkId: 'user_sample123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  });

  // Create sample bookmarks
  console.log('📚 Creating sample bookmarks...');
  const tools = await prisma.tool.findMany({ take: 3 });
  for (const tool of tools) {
    await prisma.bookmark.create({
      data: {
        userId: sampleUser.clerkId,
        toolId: tool.id,
        isPinned: Math.random() > 0.5,
      },
    });
  }

  // Create sample click events
  console.log('📊 Creating sample click events...');
  const allTools = await prisma.tool.findMany();
  for (const tool of allTools) {
    const clickCount = Math.floor(Math.random() * 50) + 1;
    for (let i = 0; i < clickCount; i++) {
      await prisma.clickEvent.create({
        data: {
          toolId: tool.id,
          userId: Math.random() > 0.5 ? sampleUser.clerkId : null,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
          userAgent: 'Mozilla/5.0 (Sample Browser)',
          referer: 'https://ezybookmark.com',
        },
      });
    }

    // Update usage count
    await prisma.tool.update({
      where: { id: tool.id },
      data: { usageCount: clickCount },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created ${sampleTools.length} tools, 1 user, ${tools.length} bookmarks`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });