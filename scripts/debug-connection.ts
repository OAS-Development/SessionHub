// scripts/debug-connection.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function debugConnection() {
  console.log('🔍 Debugging Supabase connection...\n');
  
  try {
    // Load environment variables
    const envPath = path.join(process.cwd(), '.env.supabase');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env.supabase file not found!');
      return;
    }
    
    console.log('✅ .env.supabase file exists');
    
    // Read and parse .env.supabase
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    console.log('\n📋 Environment Variables Check:');
    
    // Check each required variable
    const checks = [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', name: 'Project URL' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', name: 'Anon Key' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', name: 'Service Role Key' },
      { key: 'DATABASE_URL_SUPABASE', name: 'Database URL' },
    ];
    
    for (const { key, name } of checks) {
      if (envVars[key]) {
        if (key.includes('URL')) {
          console.log(`✅ ${name}: ${envVars[key]}`);
        } else {
          console.log(`✅ ${name}: ${envVars[key].substring(0, 20)}...`);
        }
      } else {
        console.log(`❌ ${name}: Missing!`);
      }
    }
    
    // Test API connection
    console.log('\n🔗 Testing API Connection:');
    
    if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          envVars.NEXT_PUBLIC_SUPABASE_URL,
          envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1);
        
        if (error) {
          console.log(`❌ API Connection failed: ${error.message}`);
        } else {
          console.log('✅ API Connection successful');
        }
      } catch (error) {
        console.log(`❌ API Connection error: ${error.message}`);
      }
    }
    
    // Test database URL format
    console.log('\n🗄️ Database URL Analysis:');
    
    if (envVars.DATABASE_URL_SUPABASE) {
      const dbUrl = envVars.DATABASE_URL_SUPABASE;
      console.log(`Full URL: ${dbUrl}`);
      
      // Parse the URL
      try {
        const url = new URL(dbUrl);
        console.log(`✅ Protocol: ${url.protocol}`);
        console.log(`✅ Host: ${url.hostname}`);
        console.log(`✅ Port: ${url.port || '5432'}`);
        console.log(`✅ Database: ${url.pathname.substring(1)}`);
        console.log(`✅ Username: ${url.username}`);
        console.log(`✅ Password: ${url.password ? '[HIDDEN]' : 'MISSING!'}`);
        
        if (!url.password) {
          console.log('❌ Password is missing from DATABASE_URL_SUPABASE!');
          console.log('💡 You need to add your database password to the URL');
        }
        
      } catch (error) {
        console.log(`❌ Invalid URL format: ${error.message}`);
      }
    }
    
    // Test direct database connection
    console.log('\n🧪 Testing Direct Database Connection:');
    
    if (envVars.DATABASE_URL_SUPABASE) {
      try {
        // Test with psql if available
        console.log('Testing with psql...');
        
        const result = execSync(
          `psql "${envVars.DATABASE_URL_SUPABASE}" -c "SELECT 1 as test;"`,
          { stdio: 'pipe', timeout: 10000 }
        );
        
        console.log('✅ Direct database connection successful');
        console.log(`Result: ${result.toString().trim()}`);
        
      } catch (error) {
        console.log(`❌ Direct database connection failed`);
        console.log(`Error: ${error.message}`);
        
        if (error.message.includes('psql: command not found')) {
          console.log('💡 psql not found - this is OK, we can still use Prisma');
        } else if (error.message.includes('password authentication failed')) {
          console.log('💡 Password authentication failed - check your database password');
        } else if (error.message.includes('no such host')) {
          console.log('💡 Host not found - check your Supabase project URL');
        }
      }
    }
    
    // Test with Prisma
    console.log('\n⚡ Testing Prisma Connection:');
    
    try {
      // Temporarily set the DATABASE_URL
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = envVars.DATABASE_URL_SUPABASE;
      
      console.log('Running: npx prisma db execute --stdin <<< "SELECT 1;"');
      
      const result = execSync(
        'npx prisma db execute --stdin <<< "SELECT 1;"',
        { stdio: 'pipe', timeout: 15000, env: process.env }
      );
      
      console.log('✅ Prisma connection successful');
      
      // Restore original environment
      process.env.DATABASE_URL = originalEnv;
      
    } catch (error) {
      console.log(`❌ Prisma connection failed: ${error.message}`);
      
      // Restore original environment
      process.env.DATABASE_URL = process.env.DATABASE_URL;
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If password is missing, add it to DATABASE_URL_SUPABASE');
    console.log('2. If connection still fails, check Supabase project status');
    console.log('3. Verify project is fully provisioned (can take 2-3 minutes)');
    console.log('4. Try accessing your Supabase dashboard to confirm project is ready');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugConnection().catch(console.error);
}