// scripts/fix-connection-string.ts

function urlEncodePassword(password: string): string {
    // URL encode special characters that break connection strings
    return password
      .replace(/!/g, '%21')
      .replace(/@/g, '%40')
      .replace(/#/g, '%23')
      .replace(/\$/g, '%24')
      .replace(/%/g, '%25')
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B')
      .replace(/=/g, '%3D')
      .replace(/\?/g, '%3F')
      .replace(/\//g, '%2F')
      .replace(/:/g, '%3A')
      .replace(/;/g, '%3B')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\[/g, '%5B')
      .replace(/\]/g, '%5D')
      .replace(/\{/g, '%7B')
      .replace(/\}/g, '%7D')
      .replace(/\|/g, '%7C')
      .replace(/\\/g, '%5C')
      .replace(/\^/g, '%5E')
      .replace(/`/g, '%60')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27')
      .replace(/ /g, '%20');
  }
  
  function createConnectionString(password: string): { encoded: string; pooler: string } {
    const encodedPassword = urlEncodePassword(password);
    const projectId = 'rzvzxoluspudjmssfmdc';
    
    const poolerUrl = `postgresql://postgres:${encodedPassword}@db.${projectId}.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`;
    const directUrl = `postgresql://postgres:${encodedPassword}@db.${projectId}.supabase.co:5432/postgres`;
    
    return {
      encoded: poolerUrl,
      pooler: directUrl
    };
  }
  
  function generateEnvFile(password: string): string {
    const urls = createConnectionString(password);
    
    return `# Supabase Configuration  
  NEXT_PUBLIC_SUPABASE_URL=https://rzvzxoluspudjmssfmdc.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dnp4b2x1c3B1ZGptc3NmbWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTA1NTAsImV4cCI6MjA2NDQ4NjU1MH0.qLZWvN7BxoPs4ljC7_JXERlBf8XhY42zi_AXEPS5vDQ
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dnp4b2x1c3B1ZGptc3NmbWRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODkxMDU1MCwiZXhwIjoyMDY0NDg2NTUwfQ.MH1v7ZXp5xJ4VQO3HuE2UZFM3-FHLwJmXRRhCGdRWXU
  
  # Database URLs
  DATABASE_URL_SUPABASE=${urls.encoded}
  DIRECT_URL_SUPABASE=${urls.pooler}`;
  }
  
  // Interactive script
  async function main() {
    console.log('🔧 Supabase Connection String Fixer\n');
    
    console.log('This script will help you create a properly encoded connection string.');
    console.log('Common characters that need encoding: @ # $ % & + = ? / : ; < > [ ] { } | \\ ^ ` " \' space\n');
    
    // In a real environment, you'd use readline for input
    // For now, let's show examples
    
    console.log('📋 Example passwords and their encoded versions:\n');
    
    const examples = [
      'MyPassword123',
      'Pass@word!',
      'Secret#123$',
      'P@ssw0rd!2024',
      'Complex&Password=123?'
    ];
    
    examples.forEach(password => {
      const urls = createConnectionString(password);
      console.log(`Original: "${password}"`);
      console.log(`Encoded:  "${urlEncodePassword(password)}"`);
      console.log(`DATABASE_URL_SUPABASE=${urls.encoded}\n`);
    });
    
    console.log('🎯 To fix your connection:');
    console.log('1. Copy your database password from Supabase dashboard');
    console.log('2. Use the encoding pattern above for any special characters');
    console.log('3. Update your .env.supabase file with the encoded password');
    console.log('4. Run the migration again\n');
    
    console.log('💡 Quick test:');
    console.log('If your password is "MyP@ssw0rd!", it should become "MyP%40ssw0rd%21"');
    
    // Generate a template
    console.log('\n📝 Template .env.supabase file (replace YOUR-ENCODED-PASSWORD):');
    console.log('---');
    console.log(generateEnvFile('YOUR-ENCODED-PASSWORD'));
    console.log('---');
  }
  
  // Export functions for manual use
  export { urlEncodePassword, createConnectionString, generateEnvFile };
  
  if (require.main === module) {
    main().catch(console.error);
  }
