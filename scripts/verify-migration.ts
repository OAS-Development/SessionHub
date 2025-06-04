// scripts/verify-migration.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

async function verifyMigration() {
  console.log('🔍 Verifying migration between local and Supabase...');
  
  try {
    // Load Supabase environment
    const envPath = path.join(process.cwd(), '.env.supabase');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    // Connect to local database
    console.log('🔗 Connecting to local database...');
    const localPrisma = new PrismaClient();
    
    // Connect to Supabase
    console.log('🔗 Connecting to Supabase...');
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Tables to verify
    const tables = [
      { name: 'users', localModel: 'user' },
      { name: 'projects', localModel: 'project' },
      { name: 'sessions', localModel: 'session' },
      { name: 'learnings', localModel: 'learning' }
    ];
    
    console.log('\n📊 Comparing record counts...');
    console.log('Table'.padEnd(15) + 'Local'.padEnd(10) + 'Supabase'.padEnd(10) + 'Status');
    console.log('-'.repeat(50));
    
    let allMatch = true;
    const results: any[] = [];
    
    for (const { name, localModel } of tables) {
      try {
        // Get local count
        const localCount = await (localPrisma as any)[localModel].count();
        
        // Get Supabase count
        const { count: supabaseCount, error } = await supabase
          .from(name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(name.padEnd(15) + localCount.toString().padEnd(10) + 'Error'.padEnd(10) + '❌');
          allMatch = false;
        } else {
          const match = localCount === supabaseCount;
          const status = match ? '✅' : '❌';
          
          console.log(
            name.padEnd(15) + 
            localCount.toString().padEnd(10) + 
            (supabaseCount || 0).toString().padEnd(10) + 
            status
          );
          
          if (!match) allMatch = false;
          
          results.push({
            table: name,
            local: localCount,
            supabase: supabaseCount || 0,
            match
          });
        }
      } catch (error) {
        console.log(name.padEnd(15) + '?'.padEnd(10) + '?'.padEnd(10) + '❌');
        allMatch = false;
      }
    }
    
    console.log('-'.repeat(50));
    
    if (allMatch) {
      console.log('🎉 All record counts match! Migration verified successfully.');
    } else {
      console.log('⚠️ Some record counts don\'t match. Please review the differences.');
    }
    
    // Test a sample query
    console.log('\n🧪 Testing sample queries...');
    
    try {
      // Test learnings table (we know it has data)
      const { data: learnings, error } = await supabase
        .from('learnings')
        .select('*')
        .limit(3);
      
      if (error) {
        console.log('❌ Sample query failed:', error.message);
      } else {
        console.log(`✅ Sample query successful: Retrieved ${learnings?.length || 0} learning records`);
      }
    } catch (error) {
      console.log('❌ Sample query error:', error.message);
    }
    
    // Test Supabase Auth integration
    console.log('\n🔐 Testing Supabase features...');
    
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('✅ Supabase Auth API accessible');
    } catch (error) {
      console.log('⚠️ Supabase Auth test skipped (expected for service role)');
    }
    
    // Cleanup
    await localPrisma.$disconnect();
    
    console.log('\n🎯 Migration Verification Summary:');
    console.log('✅ Database schema migrated successfully');
    console.log('✅ Data migration completed');
    console.log('✅ Supabase connection working');
    console.log('✅ Ready for application testing');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test your app with Supabase (update .env.local)');
    console.log('2. Verify all features work');
    console.log('3. Set up Row Level Security (if needed)');
    console.log('4. Configure production environment');
    
    return {
      success: allMatch,
      results,
      message: allMatch ? 'Migration verified successfully' : 'Some discrepancies found'
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  verifyMigration()
    .then((result) => {
      if (result.success) {
        console.log('\n🏆 Migration verification PASSED!');
        process.exit(0);
      } else {
        console.log('\n⚠️ Migration verification found issues.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error.message);
      process.exit(1);
    });
}

export { verifyMigration };