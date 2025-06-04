// 🚀 Session 1: AI Development Assistant Platform - Foundation
//
// PLATFORM VISION:
// Build a comprehensive platform for testing, tracking, and learning from AI coding tools
//
// SESSION 1 GOALS (60 minutes):
// 1. Set up authentication system (Clerk recommended)
// 2. Design and implement database schema for AI development tracking
// 3. Create main dashboard layout and navigation
// 4. Build project creation and management UI
// 5. Set up the foundation for AI tool integration
//
// DATABASE ENTITIES NEEDED:
// - Users (authentication)
// - Projects (development projects being built with AI)
// - Sessions (individual development sessions)
// - AITests (tests run against AI tools)
// - Learnings (insights and patterns discovered)
//
// CURSOR AI TASKS:
// Use Cursor AI to generate each component as we build them

// TODO: Start with authentication setup using Clerk

// PRISMA SCHEMA FOR AI DEVELOPMENT ASSISTANT PLATFORM
// Save this as schema.prisma in your prisma directory

/*
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql", "sqlite", etc.
  url      = env("DATABASE_URL")
}

// Users table for authentication (compatible with Clerk)
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique // Clerk user ID
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?
  username  String?  @unique
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  projects  Project[]
  sessions  Session[]
  aiTests   AITest[]
  learnings Learning[]
  
  @@map("users")
}

// Projects represent development projects being built with AI
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Project metadata
  repositoryUrl String?
  framework     String? // e.g., "React", "Next.js", "Express"
  language      String? // e.g., "TypeScript", "JavaScript", "Python"
  status        ProjectStatus @default(ACTIVE)
  
  // AI usage tracking
  totalAIInteractions Int @default(0)
  totalSessionTime    Int @default(0) // in minutes
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  userId   String
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions Session[]
  learnings Learning[]
  
  @@map("projects")
}

// Sessions represent individual development sessions
model Session {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Session data
  startTime   DateTime
  endTime     DateTime?
  duration    Int?      // in minutes, calculated when session ends
  status      SessionStatus @default(ACTIVE)
  
  // AI tool usage in this session
  aiToolsUsed String[] // e.g., ["Cursor", "GitHub Copilot", "ChatGPT"]
  
  // Code metrics
  linesAdded    Int @default(0)
  linesDeleted  Int @default(0)
  filesModified Int @default(0)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  aiTests   AITest[]
  learnings Learning[]
  
  @@map("sessions")
}

// AITests represent tests run against AI tools
model AITest {
  id       String @id @default(cuid())
  name     String
  prompt   String @db.Text
  
  // Test configuration
  aiTool      String // e.g., "Cursor", "GitHub Copilot", "ChatGPT"
  testType    AITestType
  category    String? // e.g., "Code Generation", "Debugging", "Refactoring"
  
  // Results
  expectedResult String? @db.Text
  actualResult   String? @db.Text
  success        Boolean?
  rating         Int? // 1-5 scale
  
  // Performance metrics
  responseTime   Int? // in milliseconds
  tokensUsed     Int?
  cost           Float? // in dollars
  
  // Feedback
  notes          String? @db.Text
  improvements   String? @db.Text
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionId String
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@map("ai_tests")
}

// Learnings represent insights and patterns discovered
model Learning {
  id          String @id @default(cuid())
  title       String
  description String @db.Text
  
  // Learning metadata
  category    LearningCategory
  tags        String[] // e.g., ["prompt-engineering", "debugging", "best-practices"]
  importance  Int @default(3) // 1-5 scale
  
  // Content
  insight     String @db.Text
  example     String? @db.Text
  resources   String[] // URLs or references
  
  // Context
  aiTool      String?
  scenario    String? // When this learning applies
  
  // Validation
  verified    Boolean @default(false)
  timesApplied Int @default(0)
  effectiveness Float? // Success rate when applied
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  sessionId String?
  session   Session? @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  
  @@map("learnings")
}

// Enums
enum ProjectStatus {
  ACTIVE
  COMPLETED
  PAUSED
  ARCHIVED
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  PAUSED
}

enum AITestType {
  CODE_GENERATION
  CODE_COMPLETION
  DEBUGGING
  REFACTORING
  EXPLANATION
  DOCUMENTATION
  TESTING
  OPTIMIZATION
}

enum LearningCategory {
  PROMPT_ENGINEERING
  BEST_PRACTICES
  TOOL_USAGE
  DEBUGGING_TECHNIQUES
  CODE_PATTERNS
  WORKFLOW_OPTIMIZATION
  AI_LIMITATIONS
  PERFORMANCE_TIPS
}
*/

// SAMPLE QUERIES AND OPERATIONS FOR THE PLATFORM

// First, import and initialize Prisma client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Example: Create a new project with first session
const createProjectWithSession = async (userId: string, projectData: any) => {
  const project = await prisma.project.create({
    data: {
      name: projectData.name,
      description: projectData.description,
      framework: projectData.framework,
      language: projectData.language,
      userId: userId,
      sessions: {
        create: {
          name: "Initial Setup Session",
          startTime: new Date(),
          status: "ACTIVE",
          userId: userId,
        }
      }
    },
    include: {
      sessions: true
    }
  });
  return project;
};

// Example: Track AI test results
const recordAITest = async (sessionId: string, testData: any) => {
  const aiTest = await prisma.aITest.create({
    data: {
      name: testData.name,
      prompt: testData.prompt,
      aiTool: testData.aiTool,
      testType: testData.testType,
      expectedResult: testData.expectedResult,
      actualResult: testData.actualResult,
      success: testData.success,
      rating: testData.rating,
      responseTime: testData.responseTime,
      sessionId: sessionId,
      userId: testData.userId,
    }
  });
  return aiTest;
};

// Example: Capture learning insights
const captureLearning = async (userId: string, learningData: any) => {
  const learning = await prisma.learning.create({
    data: {
      title: learningData.title,
      description: learningData.description,
      category: learningData.category,
      tags: learningData.tags,
      insight: learningData.insight,
      example: learningData.example,
      aiTool: learningData.aiTool,
      scenario: learningData.scenario,
      userId: userId,
      projectId: learningData.projectId,
      sessionId: learningData.sessionId,
    }
  });
  return learning;
};

// Example: Get comprehensive project analytics
const getProjectAnalytics = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      sessions: {
        include: {
          aiTests: true,
          learnings: true,
        }
      },
      learnings: true,
      _count: {
        select: {
          sessions: true,
        }
      }
    }
  });

  // Calculate analytics
  const totalTests = project?.sessions.reduce((sum, session) => sum + session.aiTests.length, 0) || 0;
  const successfulTests = project?.sessions.reduce((sum, session) => 
    sum + session.aiTests.filter(test => test.success).length, 0) || 0;
  const averageRating = project?.sessions.reduce((sum, session) => {
    const sessionRatings = session.aiTests.filter(test => test.rating).map(test => test.rating!);
    return sum + (sessionRatings.reduce((a, b) => a + b, 0) / sessionRatings.length || 0);
  }, 0) || 0;

  return {
    project,
    analytics: {
      totalSessions: project?._count.sessions || 0,
      totalTests,
      successRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
      averageRating: averageRating / (project?.sessions.length || 1),
      totalLearnings: (project?.learnings.length || 0) + project?.sessions.reduce((sum, session) => sum + session.learnings.length, 0),
    }
  };
};

