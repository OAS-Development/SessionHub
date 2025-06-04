// scripts/backup-database-fixed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Safe backup function that checks which models exist
async function createBackup() {
  try {
    console.log('🔍 Creating database backup using Prisma...');
    
    // Create backups directory
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `prisma-backup-${timestamp}.json`);
    
    // Extract all data with safe checks
    console.log('📤 Extracting data from database...');
    
    const backup: any = {
      timestamp: new Date().toISOString(),
    };

    // Helper function to safely try to get data from a model
    async function safeExtract(modelName: string, prismaModel: any) {
      try {
        if (prismaModel && typeof prismaModel.findMany === 'function') {
          const data = await prismaModel.findMany();
          console.log(`✅ ${modelName}: ${data.length} records`);
          return data;
        } else {
          console.log(`⚠️ ${modelName}: Model not found, skipping`);
          return [];
        }
      } catch (error) {
        console.log(`⚠️ ${modelName}: Error extracting data (${error.message}), skipping`);
        return [];
      }
    }

    // Try different possible model names for your schema
    console.log('\n📊 Extracting data from available models:');
    
    // Users (common variations)
    backup.users = await safeExtract('users', (prisma as any).user);
    
    // Projects
    backup.projects = await safeExtract('projects', (prisma as any).project);
    
    // Sessions (might be capitalized)
    backup.sessions = await safeExtract('sessions', (prisma as any).session || (prisma as any).Session);
    
    // AI Tools (various possible names)
    backup.aiTools = await safeExtract('aiTools', 
      (prisma as any).aiTool || 
      (prisma as any).aITool || 
      (prisma as any).AITool ||
      (prisma as any).aitools
    );
    
    // AI Tests (various possible names)
    backup.aiTests = await safeExtract('aiTests', 
      (prisma as any).aiTest || 
      (prisma as any).aITest || 
      (prisma as any).AITest ||
      (prisma as any).aitests
    );
    
    // Prompts
    backup.prompts = await safeExtract('prompts', (prisma as any).prompt);
    
    // Learnings
    backup.learnings = await safeExtract('learnings', (prisma as any).learning);

    // Save backup
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
    
    // Create summary
    const recordCounts: any = {};
    let totalRecords = 0;
    
    Object.entries(backup).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        recordCounts[key] = value.length;
        totalRecords += value.length;
      }
    });
    
    const summary = {
      backupFile,
      timestamp: backup.timestamp,
      recordCounts,
      totalRecords
    };
    
    console.log('\n✅ Backup completed successfully!');
    console.log('📊 Backup Summary:');
    console.log(`📁 File: ${backupFile}`);
    console.log(`📅 Timestamp: ${summary.timestamp}`);
    console.log(`📈 Total Records: ${summary.totalRecords}`);
    console.log('\n📋 Record Counts:');
    Object.entries(summary.recordCounts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count}`);
    });
    
    // Save summary for reference
    const summaryFile = path.join(backupDir, `backup-summary-${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    
    return summary;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Test database connection first
async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Debug function to show available models
async function showAvailableModels() {
  console.log('🔍 Checking available Prisma models...');
  
  const models = [
    'user', 'users', 'User',
    'project', 'projects', 'Project', 
    'session', 'Session',
    'aiTool', 'aITool', 'AITool',
    'aiTest', 'aITest', 'AITest',
    'prompt', 'prompts', 'Prompt',
    'learning', 'learnings', 'Learning'
  ];
  
  for (const modelName of models) {
    const model = (prisma as any)[modelName];
    if (model && typeof model.findMany === 'function') {
      try {
        const count = await model.count();
        console.log(`✅ ${modelName}: ${count} records`);
      } catch (error) {
        console.log(`⚠️ ${modelName}: exists but error counting (${error.message})`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting backup process...\n');
  
  // Test connection first
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('💥 Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Show available models for debugging
  await showAvailableModels();
  
  console.log('\n');
  
  // Create backup
  const summary = await createBackup();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Verify backup file exists and has data');
  console.log('2. Keep this backup safe during migration');
  console.log('3. Use this backup for rollback if needed');
  
  return summary;
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Backup process failed:', error);
    process.exit(1);
  });
}

export { createBackup, testConnection };