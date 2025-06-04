// scripts/migrate-schema.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function migrateSchema() {
  console.log('🚀 Starting schema migration to Supabase...');
  
  try {
    // Load Supabase environment variables
    const envPath = path.join(process.cwd(), '.env.supabase');
    
    if (!fs.existsSync(envPath)) {
      throw new Error('❌ .env.supabase file not found! Please create it with your Supabase credentials.');
    }
    
    console.log('📁 Loading Supabase environment variables...');
    
    // Read and parse .env.supabase
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    // Validate required variables
    const required = ['DATABASE_URL_SUPABASE', 'NEXT_PUBLIC_SUPABASE_URL'];
    for (const key of required) {
      if (!envVars[key]) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
      }
    }
    
    console.log('✅ Environment variables loaded');
    console.log(`🎯 Target: ${envVars.NEXT_PUBLIC_SUPABASE_URL}`);
    
    // Backup original environment
    const originalEnv = { ...process.env };
    
    // Set environment for migration
    process.env.DATABASE_URL = envVars.DATABASE_URL_SUPABASE;
    if (envVars.DIRECT_URL_SUPABASE) {
      process.env.DIRECT_URL = envVars.DIRECT_URL_SUPABASE;
    }
    
    console.log('🔄 Testing Supabase connection...');
    
    // Test connection first
    try {
      execSync('npx prisma db execute --stdin <<< "SELECT 1;"', { 
        stdio: 'pipe',
        env: process.env 
      });
      console.log('✅ Supabase connection successful');
    } catch (error) {
      throw new Error(`❌ Supabase connection failed. Check your DATABASE_URL_SUPABASE in .env.supabase`);
    }
    
    console.log('📊 Pushing schema to Supabase...');
    
    // Push schema to Supabase
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: process.env 
    });
    
    console.log('✅ Schema migration completed successfully!');
    
    // Restore original environment
    Object.assign(process.env, originalEnv);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Schema is now in Supabase');
    console.log('2. Ready for data migration');
    console.log('3. Run: npx tsx scripts/migrate-data.ts');
    
    return {
      success: true,
      message: 'Schema migration completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  migrateSchema()
    .then(() => {
      console.log('🎉 Schema migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    });
}

export { migrateSchema };