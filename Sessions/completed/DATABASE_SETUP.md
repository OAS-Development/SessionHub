# Database Integration Setup Guide

## Overview

This document outlines the complete database integration setup for the AI Development Assistant Platform, including Clerk user management, comprehensive schema design, and production-ready database operations.

## 🗃️ Database Schema

### Core Entities

1. **Users** - Clerk-integrated user profiles with onboarding data
2. **Projects** - Development projects with AI usage tracking
3. **Sessions** - Individual coding sessions (45-60 min focused work)
4. **AITools** - Different AI tools being tested and compared
5. **AITests** - Individual test results and comparisons
6. **Prompts** - Reusable prompts for testing AI tools
7. **Learnings** - Insights and patterns discovered during development

### Key Features

- **Clerk Integration**: Seamless user management with webhook support
- **Comprehensive Tracking**: Development metrics, AI usage, and performance analytics
- **Prompt Engineering**: Template system for consistent AI testing
- **Learning Management**: Capture and organize development insights
- **Production Ready**: Proper indexes, constraints, and relationships

## 📁 File Structure

```
lib/
├── db.ts                    # Database connection and utilities
├── db/
│   ├── user.ts             # User operations with Clerk integration
│   └── [entity].ts         # Other entity operations (to be created)
├── types/
│   └── database.ts         # TypeScript type definitions
prisma/
├── schema.prisma           # Database schema definition
└── seed.ts                 # Initial data seeding script
app/
└── api/
    └── webhooks/
        └── clerk/
            └── route.ts    # Clerk webhook handlers
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_dev_assistant"

# Clerk (for webhook integration)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Seed initial data (AI tools and template prompts)
npm run db:seed

# Open Prisma Studio for data management
npm run db:studio
```

### 3. Clerk Webhook Setup

1. In your Clerk dashboard, create a webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
2. Enable these events:
   - `user.created`
   - `user.updated`  
   - `user.deleted`
3. Add the webhook secret to your environment variables

## 🏗️ Database Architecture

### User Management Flow

```
Clerk User Event → Webhook → Database Operation → User Record
```

- **user.created**: Creates new user record with Clerk ID
- **user.updated**: Updates user profile information
- **user.deleted**: Soft deletes user (sets isActive = false)

### Development Workflow

```
User → Project → Session → AITest → Learning
     ↓          ↓        ↓
   Prompts → AITools ← Performance Metrics
```

### Key Relationships

- Users have many Projects, Sessions, AITests, Learnings, Prompts
- Projects have many Sessions and Learnings
- Sessions have many AITests and Learnings
- AITests belong to AITool and optionally Prompt
- All entities cascade delete when User is deleted

## 📊 Seeded Data

### AI Tools (7 tools)

1. **Cursor AI** - AI-powered code editor
2. **GitHub Copilot** - AI pair programmer
3. **ChatGPT** - Conversational AI assistant
4. **Claude** - Anthropic's AI assistant
5. **Amazon CodeWhisperer** - AWS-integrated code generator
6. **Tabnine** - Privacy-focused code completion
7. **Codeium** - Free AI code acceleration

### Template Prompts (5 templates)

1. **Bug Fix Assistant** - Systematic debugging help
2. **Code Review Assistant** - Comprehensive code review
3. **API Documentation Generator** - Automated documentation
4. **Test Case Generator** - Complete test suite creation
5. **Code Refactoring Assistant** - Structure improvements

## 🔒 Security & Best Practices

### Database Security

- All sensitive operations use transactions
- Proper foreign key constraints with cascade rules
- Soft delete for user data (GDPR compliance)
- Indexed fields for performance
- Input validation and sanitization

### Error Handling

- Custom error types: `DatabaseError`, `ValidationError`, `NotFoundError`
- Automatic retry logic for transactions
- Comprehensive logging for debugging
- Graceful degradation for non-critical failures

### Performance Optimizations

- Strategic database indexes
- Connection pooling support
- Query optimization with Prisma
- Efficient pagination for large datasets
- Caching-friendly data structures

## 🛠️ Database Utilities

### Connection Management

```typescript
import { prisma, healthCheck, disconnect } from '@/lib/db'

// Health check
const isHealthy = await healthCheck()

// Graceful shutdown
await disconnect()
```

### Transaction Support

```typescript
import { withTransaction } from '@/lib/db'

await withTransaction(async (tx) => {
  // Multiple operations in transaction
  await tx.user.update(...)
  await tx.project.create(...)
})
```

### User Operations

```typescript
import { createUser, updateUser, getUserWithStats } from '@/lib/db/user'

// Create user from Clerk webhook
await createUser({
  clerkId: 'user_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
})

// Get user with statistics
const userWithStats = await getUserWithStats('user_123')
```

## 📈 Analytics & Metrics

### User Metrics

- Total development sessions
- Total development time (minutes)
- Total AI interactions
- Last activity tracking

### Project Metrics

- AI tool usage frequency
- Session duration averages
- Code velocity (lines added/deleted)
- Test success rates
- Tool rating averages

### Performance Tracking

- AI tool response times
- Success rates by tool and task type
- Learning verification rates
- User engagement metrics

## 🚀 Production Deployment

### Migration Strategy

```bash
# Production migration
npm run db:migrate:prod

# Health check after deployment
npm run db:generate
```

### Monitoring

- Database connection health checks
- Query performance monitoring
- Error rate tracking
- User activity analytics

### Backup Strategy

- Automated daily backups
- Point-in-time recovery
- Data retention policies
- GDPR compliance procedures

## 📋 Next Steps

1. **API Layer**: Create REST/GraphQL endpoints for frontend
2. **Real-time Features**: Add WebSocket support for live updates
3. **Analytics Dashboard**: Build comprehensive analytics views
4. **Data Export**: Implement user data export functionality
5. **Advanced Search**: Add full-text search capabilities
6. **Batch Operations**: Implement bulk data operations
7. **Audit Logging**: Add comprehensive audit trail

## 🔍 Debugging

### Common Issues

1. **Connection Issues**: Check DATABASE_URL format
2. **Migration Errors**: Ensure PostgreSQL is running
3. **Seed Failures**: Verify data integrity and constraints
4. **Webhook Issues**: Check Clerk webhook secret and endpoint

### Useful Commands

```bash
# Reset database (development only)
npm run db:reset

# View database in browser
npm run db:studio

# Check migration status
npx prisma migrate status

# Generate new migration
npx prisma migrate dev --name description
```

This database integration provides a solid foundation for the AI Development Assistant Platform with comprehensive tracking, analytics, and user management capabilities. 