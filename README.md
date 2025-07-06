# 🔖 EzyBookmark API

> AI-powered bookmark management API with intelligent categorization

A production-ready NestJS API that powers the EzyBookmark application with features like AI-powered tool categorization, user authentication, click analytics, and comprehensive bookmark management.

## 🚀 Features

- **AI-Powered Categorization**: Automatic tool categorization into 9 categories
- **User Authentication**: Clerk integration with webhook support
- **Bookmark Management**: Save, pin, and organize tools
- **Click Analytics**: Real-time usage tracking with queue-based processing
- **Health Monitoring**: Comprehensive health checks and monitoring
- **Production Ready**: Logging, rate limiting, security headers, and error handling
- **PostgreSQL Database**: Robust data storage with Prisma ORM

## 🛠️ Tech Stack

- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Robust relational database
- **Winston**: Structured logging
- **Helmet**: Security headers
- **Class Validator**: Request validation

## 🏗️ Project Structure

```
src/
├── auth/                 # Clerk authentication
├── bookmarks/            # Bookmark management
├── tools/                # AI tools CRUD & analytics  
├── webhooks/             # Clerk webhooks
├── health/               # Health monitoring
├── common/               # Shared utilities
├── config/               # Configuration
└── prisma/               # Database service
```

## 🌟 Key Features

### 🤖 AI Tool Categories
- Development & Technical
- Data & Analytics  
- Business & Productivity
- Communication & Chat
- Creative & Media
- Content & Writing
- SEO & Marketing
- Entertainment
- AI Tools

### 📊 Analytics & Monitoring
- Real-time click tracking
- Usage statistics
- Health monitoring
- Performance metrics
- Queue-based processing

### 🔐 Security & Performance
- Clerk authentication
- Rate limiting
- CORS protection
- Security headers
- Input validation
- Structured logging

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp .env.example .env
   # Update with your database and Clerk credentials
   ```

3. **Database setup**:
   ```bash
   npm run db:generate
   npm run db:migrate:dev
   npm run db:seed
   ```

4. **Start development**:
   ```bash
   npm run start:dev
   ```

## 📚 API Documentation

See `API_ENDPOINTS.md` for complete API documentation.

## 🚀 Deployment

Ready for deployment on Railway with Supabase database. See `RAILWAY_DEPLOYMENT_COMPLETE.md` for detailed deployment guide.

---

**EzyBookmark API** - Making bookmark management effortless with AI