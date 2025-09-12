const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdukxfwdlwskznyiezgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza3pueWllemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDE5MzYsImV4cCI6MjA3MjgxNzkzNn0.JmrzydnKSmRBAMN2lvFV2A-WtR0yT7loI1al0H2AxIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserData() {
    console.log('🔍 Debugging user data for arjunin2020@gmail.com...\n');
    
    try {
        // 1. Check if user exists in auth.users
        console.log('1. Checking auth.users table...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }
        
        const targetUser = authUsers.users.find(user => user.email === 'arjunin2020@gmail.com');
        if (!targetUser) {
            console.log('❌ User not found in auth.users table');
            return;
        }
        
        console.log('✅ User found in auth.users:');
        console.log(`   - ID: ${targetUser.id}`);
        console.log(`   - Email: ${targetUser.email}`);
        console.log(`   - Created: ${targetUser.created_at}`);
        console.log(`   - Email Confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // 2. Check profiles table
        console.log('\n2. Checking profiles table...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUser.id)
            .single();
            
        if (profileError) {
            console.log('❌ Profile not found:', profileError.message);
            console.log('   This is likely the root cause - no profile exists for this user');
        } else {
            console.log('✅ Profile found:');
            console.log(`   - ID: ${profile.id}`);
            console.log(`   - Full Name: ${profile.full_name}`);
            console.log(`   - Email: ${profile.email}`);
            console.log(`   - Role: ${profile.role}`);
            console.log(`   - Merchant ID: ${profile.merchant_id || 'NULL (This is the problem!)'}`);
            console.log(`   - Is Active: ${profile.is_active}`);
        }
        
        // 3. Check merchants table if merchant_id exists
        if (profile && profile.merchant_id) {
            console.log('\n3. Checking merchants table...');
            const { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .select('*')
                .eq('id', profile.merchant_id)
                .single();
                
            if (merchantError) {
                console.log('❌ Merchant not found:', merchantError.message);
            } else {
                console.log('✅ Merchant found:');
                console.log(`   - ID: ${merchant.id}`);
                console.log(`   - Name: ${merchant.name}`);
                console.log(`   - Business Name: ${merchant.business_name || 'Not set'}`);
                console.log(`   - Is Active: ${merchant.is_active}`);
            }
        }
        
        // 4. Check products count for this merchant
        if (profile && profile.merchant_id) {
            console.log('\n4. Checking products for this merchant...');
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', profile.merchant_id);
                
            if (productError) {
                console.log('❌ Error checking products:', productError.message);
            } else {
                console.log(`✅ Products found: ${productCount || 0}`);
            }
        }
        
        // 5. Check sales count for this merchant
        if (profile && profile.merchant_id) {
            console.log('\n5. Checking sales for this merchant...');
            const { count: salesCount, error: salesError } = await supabase
                .from('sales')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', profile.merchant_id);
                
            if (salesError) {
                console.log('❌ Error checking sales:', salesError.message);
            } else {
                console.log(`✅ Sales found: ${salesCount || 0}`);
            }
        }
        
        // 6. List all merchants to see what exists
        console.log('\n6. Listing all merchants in database...');
        const { data: allMerchants, error: allMerchantsError } = await supabase
            .from('merchants')
            .select('id, name, business_name, owner_id, is_active')
            .limit(10);
            
        if (allMerchantsError) {
            console.log('❌ Error fetching merchants:', allMerchantsError.message);
        } else {
            console.log(`✅ Total merchants found: ${allMerchants.length}`);
            allMerchants.forEach((merchant, index) => {
                console.log(`   ${index + 1}. ${merchant.name} (ID: ${merchant.id.substring(0, 8)}..., Owner: ${merchant.owner_id ? merchant.owner_id.substring(0, 8) + '...' : 'NULL'})`);
            });
        }
        
        // 7. Check if there's a merchant owned by this user
        console.log('\n7. Checking if user owns any merchant...');
        const { data: ownedMerchants, error: ownedError } = await supabase
            .from('merchants')
            .select('*')
            .eq('owner_id', targetUser.id);
            
        if (ownedError) {
            console.log('❌ Error checking owned merchants:', ownedError.message);
        } else if (ownedMerchants.length === 0) {
            console.log('❌ User does not own any merchant');
        } else {
            console.log(`✅ User owns ${ownedMerchants.length} merchant(s):`);
            ownedMerchants.forEach(merchant => {
                console.log(`   - ${merchant.name} (ID: ${merchant.id})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

debugUserData();
