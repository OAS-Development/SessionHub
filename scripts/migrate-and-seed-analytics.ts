// scripts/migrate-and-seed-analytics.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAnalyticsData() {
  console.log('🌱 Seeding analytics data...');

  // Create sample productivity metrics for the last 30 days
  const productivityData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    productivityData.push({
      date,
      sessionsCompleted: Math.floor(Math.random() * 8) + 1, // 1-8 sessions per day
      linesOfCode: Math.floor(Math.random() * 2000) + 500, // 500-2500 lines
      tasksCompleted: Math.floor(Math.random() * 15) + 5, // 5-20 tasks
      projectsActive: Math.floor(Math.random() * 3) + 1, // 1-3 active projects
      averageSessionTime: Math.floor(Math.random() * 30) + 45, // 45-75 minutes
      successRate: Math.floor(Math.random() * 20) + 80, // 80-100% success rate
    });
  }

  await prisma.productivityMetrics.createMany({
    data: productivityData,
    skipDuplicates: true,
  });

  // Create AI tool metrics
  const aiTools = ['claude-code', 'github-copilot', 'chatgpt', 'claude-ai'];
  const taskTypes = ['component_creation', 'api_development', 'debugging', 'testing', 'documentation'];
  
  const aiToolData = [];
  for (const tool of aiTools) {
    for (const taskType of taskTypes) {
      for (let i = 6; i >= 0; i--) { // Last 7 days
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        aiToolData.push({
          toolName: tool,
          taskType,
          successRate: Math.floor(Math.random() * 30) + 70, // 70-100%
          avgTime: Math.floor(Math.random() * 10000) + 5000, // 5-15 seconds
          totalUses: Math.floor(Math.random() * 20) + 5, // 5-25 uses
          errors: Math.floor(Math.random() * 3), // 0-2 errors
          date,
        });
      }
    }
  }

  await prisma.aIToolMetrics.createMany({
    data: aiToolData,
    skipDuplicates: true,
  });

  // Create sample learning insights
  const learningInsights = [
    {
      insight: "Using TypeScript interfaces early saves debugging time later",
      category: "pattern",
      tags: ["typescript", "planning", "debugging"],
      usefulness: 9
    },
    {
      insight: "Claude Code works better with specific, detailed prompts",
      category: "discovery",
      tags: ["ai-tools", "prompting", "claude-code"],
      usefulness: 8
    },
    {
      insight: "Breaking large features into smaller tasks improves success rate",
      category: "improvement",
      tags: ["project-management", "task-planning"],
      usefulness: 9
    },
    {
      insight: "Always test API endpoints immediately after creation",
      category: "success",
      tags: ["api-development", "testing", "debugging"],
      usefulness: 7
    },
    {
      insight: "Generating component tests alongside components catches issues early",
      category: "pattern",
      tags: ["testing", "components", "quality"],
      usefulness: 8
    }
  ];

  await prisma.learning.createMany({
    data: learningInsights,
  });

  console.log('✅ Analytics data seeded successfully!');
}

async function createSampleUserData(userId: string) {
  console.log('👤 Creating sample user data...');

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: "Task Management App",
      description: "A productivity app for managing development tasks",
      type: "single-app",
      status: "active",
      userId,
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: "E-commerce Platform",
      description: "Multi-service e-commerce platform",
      type: "platform",
      status: "completed",
      userId,
    }
  });

  // Create sample sessions
  const sessions = [];
  for (let i = 0; i < 15; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
    
    const duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
    const completedAt = new Date(startDate.getTime() + duration * 60000);
    
    sessions.push({
      sessionNumber: i + 1,
      title: `Session ${i + 1}: Feature Development`,
      description: `Implementing feature ${i + 1}`,
      status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
      startedAt: startDate,
      completedAt,
      duration,
      linesAdded: Math.floor(Math.random() * 500) + 100,
      linesModified: Math.floor(Math.random() * 200),
      linesDeleted: Math.floor(Math.random() * 50),
      filesCreated: Math.floor(Math.random() * 5) + 1,
      filesModified: Math.floor(Math.random() * 10) + 2,
      testsAdded: Math.floor(Math.random() * 10),
      userId,
      projectId: Math.random() > 0.5 ? project1.id : project2.id,
    });
  }

  await prisma.session.createMany({
    data: sessions,
  });

  // Create sample activities
  const activityTypes = [
    'session_started',
    'session_completed', 
    'task_completed',
    'project_created',
    'code_generated',
    'test_passed',
    'deployment_successful'
  ];

  const activities = [];
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 168)); // Last week
    
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    activities.push({
      type,
      description: `${type.replace('_', ' ')} - automated activity`,
      timestamp,
      userId,
      projectId: Math.random() > 0.5 ? project1.id : project2.id,
    });
  }

  await prisma.activity.createMany({
    data: activities,
  });

  console.log('✅ Sample user data created!');
}

async function main() {
  try {
    console.log('🚀 Starting database migration and seeding...');
    
    // First, seed the global analytics data
    await seedAnalyticsData();
    
    // Note: In a real app, you'd get the actual user ID from your auth system
    // For testing, you can create a sample user or use an existing one
    console.log('📝 To create sample user data, run:');
    console.log('npm run seed-user -- --userId=your-actual-user-id');
    
    console.log('🎉 Migration and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration/seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running with user ID argument
if (process.argv.includes('--create-sample-user')) {
  const userIdIndex = process.argv.findIndex(arg => arg.startsWith('--userId='));
  if (userIdIndex > -1) {
    const userId = process.argv[userIdIndex].split('=')[1];
    main().then(() => createSampleUserData(userId));
  } else {
    console.error('❌ Please provide --userId=your-user-id when using --create-sample-user');
    process.exit(1);
  }
} else {
  main();
}

// Export for use in other scripts
export { seedAnalyticsData, createSampleUserData };