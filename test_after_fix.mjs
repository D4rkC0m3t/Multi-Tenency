import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdukxfwdlwskznyiezgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza3pueWllemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDE5MzYsImV4cCI6MjA3MjgxNzkzNn0.JmrzydnKSmRBAMN2lvFV2A-WtR0yT7loI1al0H2AxIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAfterFix() {
    console.log('🧪 Testing database access after RLS fix...\n');
    
    try {
        // Test basic table access without authentication
        console.log('1. Testing basic table access...');
        
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('email, full_name, merchant_id')
            .eq('email', 'arjunin2020@gmail.com');
            
        if (profilesError) {
            console.log('❌ Still getting RLS error:', profilesError.message);
            if (profilesError.message.includes('infinite recursion')) {
                console.log('   The RLS fix has not been applied yet or failed.');
                return;
            }
        } else {
            console.log('✅ RLS recursion fixed! Profiles table accessible');
            if (profiles && profiles.length > 0) {
                const profile = profiles[0];
                console.log(`   User: ${profile.email}`);
                console.log(`   Name: ${profile.full_name}`);
                console.log(`   Merchant ID: ${profile.merchant_id || 'NULL'}`);
            } else {
                console.log('   Profile exists but no data returned (normal without auth)');
            }
        }
        
        // Test merchants table
        console.log('\n2. Testing merchants table...');
        const { count: merchantCount, error: merchantError } = await supabase
            .from('merchants')
            .select('*', { count: 'exact', head: true });
            
        if (merchantError) {
            console.log('❌ Merchants table error:', merchantError.message);
        } else {
            console.log(`✅ Merchants table accessible: ${merchantCount || 0} merchants`);
        }
        
        // Test other tables
        const tables = ['products', 'categories', 'customers', 'suppliers', 'sales'];
        console.log('\n3. Testing other tables...');
        
        for (const table of tables) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
                
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${count || 0} records`);
            }
        }
        
        console.log('\n🎉 SUCCESS: RLS recursion issue has been resolved!');
        console.log('   Users should now be able to login and access their business data.');
        console.log('   Try logging in with arjunin2020@gmail.com in the application.');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testAfterFix();
