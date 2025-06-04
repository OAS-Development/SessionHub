// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

interface BackupData {
  timestamp: string;
  users: any[];
  projects: any[];
  sessions: any[];
  aiTools: any[];
  aiTests: any[];
  prompts: any[];
  learnings: any[];
}

async function migrateData() {
  console.log('🚀 Starting data migration to Supabase...');
  
  try {
    // Load environment variables
    const envPath = path.join(process.cwd(), '.env.supabase');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    // Validate required variables
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('❌ Missing Supabase credentials in .env.supabase');
    }
    
    console.log('📡 Connecting to Supabase...');
    
    // Create Supabase client
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('✅ Supabase client created');
    
    // Find the latest backup file
    console.log('🔍 Finding latest backup file...');
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFiles = await fs.readdir(backupDir);
    const jsonBackups = backupFiles.filter(f => f.startsWith('prisma-backup-') && f.endsWith('.json'));
    
    if (jsonBackups.length === 0) {
      throw new Error('❌ No backup files found! Run backup script first.');
    }
    
    // Get the latest backup
    const latestBackup = jsonBackups.sort().reverse()[0];
    const backupPath = path.join(backupDir, latestBackup);
    
    console.log(`📂 Using backup: ${latestBackup}`);
    
    // Load backup data
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData: BackupData = JSON.parse(backupContent);
    
    console.log('📊 Backup loaded successfully');
    console.log(`📅 Backup timestamp: ${backupData.timestamp}`);
    
    // Import data in dependency order
    const tables = [
      { name: 'users', data: backupData.users, table: 'users' },
      { name: 'projects', data: backupData.projects, table: 'projects' },
      { name: 'sessions', data: backupData.sessions, table: 'sessions' },
      { name: 'aiTools', data: backupData.aiTools, table: 'aiTools' },
      { name: 'aiTests', data: backupData.aiTests, table: 'aiTests' },
      { name: 'prompts', data: backupData.prompts, table: 'prompts' },
      { name: 'learnings', data: backupData.learnings, table: 'learnings' }
    ];
    
    console.log('\n📥 Starting data import...');
    
    let totalImported = 0;
    
    for (const { name, data, table } of tables) {
      if (data && data.length > 0) {
        console.log(`📦 Importing ${data.length} records to ${name}...`);
        
        try {
          const { error } = await supabase
            .from(table)
            .insert(data);
          
          if (error) {
            console.error(`❌ Error importing ${name}:`, error.message);
            // Continue with other tables
          } else {
            console.log(`✅ ${name}: ${data.length} records imported`);
            totalImported += data.length;
          }
        } catch (error) {
          console.error(`❌ Exception importing ${name}:`, error.message);
          // Continue with other tables
        }
      } else {
        console.log(`⚪ ${name}: No data to import`);
      }
    }
    
    console.log(`\n🎉 Data migration completed!`);
    console.log(`📊 Total records imported: ${totalImported}`);
    
    // Verify import
    console.log('\n🔍 Verifying data import...');
    
    for (const { name, table } of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`⚠️ ${name}: Could not verify (${error.message})`);
        } else {
          console.log(`✅ ${name}: ${count} records in Supabase`);
        }
      } catch (error) {
        console.log(`⚠️ ${name}: Verification error`);
      }
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Data is now in Supabase');
    console.log('2. Run verification script');
    console.log('3. Test your application with Supabase');
    
    return {
      success: true,
      message: 'Data migration completed successfully',
      totalImported
    };
    
  } catch (error) {
    console.error('❌ Data migration failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  migrateData()
    .then((result) => {
      console.log('🎉 Data migration complete!');
      console.log(`📊 Imported ${result.totalImported} records`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    });
}

export { migrateData };