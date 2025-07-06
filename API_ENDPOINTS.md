# 🔖 EzyBookmark API Documentation

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-app.railway.app/api`

## Authentication
Most endpoints are public. Protected endpoints require Clerk JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Health & Status

### GET `/health`
Basic health check
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 1234.567,
  "version": "1.0.0"
}
```

### GET `/health/detailed`
Detailed system health including database, queue, and memory status

## Tools API

### GET `/tools`
Get all tools with pagination and filtering
**Query Parameters:**
- `search` (optional): Search term
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

### POST `/tools`
Create a new tool
```json
{
  "url": "https://example.com",
  "name": "Tool Name",
  "description": "Tool description",
  "category": "AI Tools",
  "tags": ["ai", "productivity"],
  "favicon": "https://example.com/favicon.ico"
}
```

### GET `/tools/:id`
Get tool by ID

### PATCH `/tools/:id`
Update tool (partial update)

### DELETE `/tools/:id`
Delete tool

### POST `/tools/:id/visit`
Track tool visit (rate limited: 10 per minute)

### GET `/tools/categories`
Get all available categories

### GET `/tools/by-category`
Get tools grouped by category
**Query Parameters:**
- `limit` (optional): Tools per category (default: 8, max: 200)

### GET `/tools/popular`
Get popular tools by usage
**Query Parameters:**
- `limit` (optional): Number of tools (default: 10, max: 100)

### GET `/tools/analytics/clicks`
Get click analytics
**Query Parameters:**
- `toolId` (optional): Get analytics for specific tool

### POST `/tools/cleanup/click-events`
Cleanup old click events (rate limited: 1 per hour)
**Query Parameters:**
- `retentionDays` (optional): Days to retain (default: 90, max: 365)

## Bookmarks API (Protected)

### GET `/bookmarks`
Get user's bookmarks

### POST `/bookmarks`
Create bookmark
```json
{
  "toolId": "tool_id_here",
  "isPinned": false
}
```

### GET `/bookmarks/pinned`
Get user's pinned tools

### GET `/bookmarks/stats`
Get user's bookmark statistics

### GET `/bookmarks/status?toolId=tool_id`
Check bookmark status for a tool

### PATCH `/bookmarks/:toolId/pin`
Toggle pin status
```json
{
  "isPinned": true
}
```

### PATCH `/bookmarks/:toolId`
Update bookmark

### DELETE `/bookmarks/:toolId`
Remove bookmark

## Webhooks

### POST `/webhooks/clerk`
Clerk user management webhook
- Handles `user.created`, `user.updated`, `user.deleted` events
- Requires valid Clerk webhook signature

## Categories
The system supports 9 categories:
1. Development & Technical
2. Data & Analytics
3. Business & Productivity
4. Communication & Chat
5. Creative & Media
6. Content & Writing
7. SEO & Marketing
8. Entertainment
9. AI Tools

## Rate Limiting
- Global: 100 requests per minute
- Tool visits: 10 requests per minute per tool
- Cleanup operations: 1 request per hour

## Error Responses
```json
{
  "statusCode": 400,
  "timestamp": "2023-12-01T10:00:00.000Z",
  "path": "/api/endpoint",
  "method": "GET",
  "message": "Error description"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error