// scripts/comprehensive-debug.ts
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function comprehensiveDebug() {
  console.log('🔍 Comprehensive Supabase Debug\n');
  
  try {
    // 1. Check environment file
    console.log('📁 1. Checking .env.supabase file...');
    const envPath = path.join(process.cwd(), '.env.supabase');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env.supabase file not found!');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    console.log('✅ Environment file loaded');
    
    // 2. Validate environment variables
    console.log('\n📋 2. Validating environment variables...');
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL_SUPABASE'
    ];
    
    for (const key of required) {
      if (envVars[key]) {
        if (key.includes('URL')) {
          console.log(`✅ ${key}: ${envVars[key]}`);
        } else {
          console.log(`✅ ${key}: ${envVars[key].substring(0, 30)}...`);
        }
      } else {
        console.log(`❌ ${key}: MISSING`);
      }
    }
    
    // 3. Test network connectivity
    console.log('\n🌐 3. Testing network connectivity...');
    try {
      const response = execSync('curl -s -w "%{http_code}" https://rzvzxoluspudjmssfmdc.supabase.co/rest/v1/', { 
        timeout: 10000,
        encoding: 'utf-8'
      });
      
      if (response.includes('200') || response.includes('401')) {
        console.log('✅ Supabase API is reachable');
      } else {
        console.log(`⚠️ Unexpected response: ${response}`);
      }
    } catch (error) {
      console.log(`❌ Network connectivity failed: ${error.message}`);
    }
    
    // 4. Test API authentication
    console.log('\n🔐 4. Testing API authentication...');
    try {
      const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase.from('_realtime').select('*').limit(1);
      
      if (error && error.message.includes('relation "_realtime" does not exist')) {
        console.log('✅ API authentication working (expected table error)');
      } else if (error) {
        console.log(`⚠️ API error: ${error.message}`);
      } else {
        console.log('✅ API authentication working');
      }
    } catch (error) {
      console.log(`❌ API test failed: ${error.message}`);
    }
    
    // 5. Analyze DATABASE_URL format
    console.log('\n🔍 5. Analyzing DATABASE_URL format...');
    if (envVars.DATABASE_URL_SUPABASE) {
      const dbUrl = envVars.DATABASE_URL_SUPABASE;
      console.log(`Full URL: ${dbUrl.replace(/:([^@]*)/g, ':***')}`);
      
      try {
        const url = new URL(dbUrl);
        console.log(`✅ Protocol: ${url.protocol}`);
        console.log(`✅ Username: ${url.username}`);
        console.log(`✅ Password: ${url.password ? '[PRESENT]' : '[MISSING]'}`);
        console.log(`✅ Hostname: ${url.hostname}`);
        console.log(`✅ Port: ${url.port}`);
        console.log(`✅ Database: ${url.pathname}`);
        console.log(`✅ Query params: ${url.search}`);
        
        // Check for common issues
        if (url.username !== 'postgres') {
          console.log('⚠️ Username should be "postgres"');
        }
        if (!url.password) {
          console.log('❌ Password is missing!');
        }
        if (!url.hostname.includes('supabase.co')) {
          console.log('⚠️ Hostname doesn\'t look like Supabase');
        }
        if (url.port !== '5432') {
          console.log('⚠️ Port should be 5432');
        }
        
      } catch (error) {
        console.log(`❌ Invalid URL format: ${error.message}`);
      }
    }
    
    // 6. Test database connection with different methods
    console.log('\n🗄️ 6. Testing database connections...');
    
    // Method 1: Direct psql test (if available)
    console.log('\n6a. Testing with psql (if available)...');
    try {
      const result = execSync(
        `timeout 10 psql "${envVars.DATABASE_URL_SUPABASE}" -c "SELECT version();"`,
        { stdio: 'pipe', timeout: 12000 }
      );
      console.log('✅ Direct psql connection successful');
      console.log(`Version: ${result.toString().split('\n')[2]?.trim()}`);
    } catch (error) {
      if (error.message.includes('psql: command not found')) {
        console.log('⚪ psql not available (this is OK)');
      } else if (error.message.includes('timeout')) {
        console.log('❌ Connection timeout - possible network/firewall issue');
      } else if (error.message.includes('password authentication failed')) {
        console.log('❌ Password authentication failed - check your password');
      } else if (error.message.includes('could not translate host name')) {
        console.log('❌ DNS resolution failed - check hostname');
      } else {
        console.log(`❌ psql connection failed: ${error.message}`);
      }
    }
    
    // Method 2: Test with Prisma
    console.log('\n6b. Testing with Prisma...');
    const originalEnv = process.env.DATABASE_URL;
    try {
      process.env.DATABASE_URL = envVars.DATABASE_URL_SUPABASE;
      
      const result = execSync(
        'timeout 15 npx prisma db execute --stdin <<< "SELECT 1 as test;"',
        { 
          stdio: 'pipe', 
          timeout: 20000,
          env: process.env 
        }
      );
      console.log('✅ Prisma connection successful');
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('❌ Prisma connection timeout');
      } else if (error.message.includes('password authentication failed')) {
        console.log('❌ Prisma: Password authentication failed');
      } else if (error.message.includes('could not connect to server')) {
        console.log('❌ Prisma: Could not connect to server');
      } else {
        console.log(`❌ Prisma connection failed: ${error.message}`);
      }
    } finally {
      process.env.DATABASE_URL = originalEnv;
    }
    
    // 7. Check Supabase project status
    console.log('\n🏗️ 7. Recommendations...');
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Verify your Supabase project is "Active" in the dashboard');
    console.log('2. Check if you can connect via Supabase SQL Editor');
    console.log('3. Try resetting your database password');
    console.log('4. Ensure no firewall is blocking port 5432');
    console.log('5. Try using the connection string from Supabase dashboard directly');
    
    console.log('\n🔧 Alternative approach:');
    console.log('If direct database connection fails, we can use Supabase client API instead');
    console.log('This would bypass the direct PostgreSQL connection requirement');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  comprehensiveDebug().catch(console.error);
}
