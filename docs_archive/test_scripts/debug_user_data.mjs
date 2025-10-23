import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdukxfwdlwskznyiezgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza3pueWllemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDE5MzYsImV4cCI6MjA3MjgxNzkzNn0.JmrzydnKSmRBAMN2lvFV2A-WtR0yT7loI1al0H2AxIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserData() {
    console.log('🔍 Debugging user data for arjunin2020@gmail.com...\n');
    
    try {
        // 1. Check profiles table directly (since we can't access auth.users with anon key)
        console.log('1. Checking profiles table for user...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'arjunin2020@gmail.com');
            
        if (profilesError) {
            console.log('❌ Error fetching profiles:', profilesError.message);
            return;
        }
        
        if (!profiles || profiles.length === 0) {
            console.log('❌ No profile found for arjunin2020@gmail.com');
            console.log('   This is the root cause - user has no profile in the system');
            return;
        }
        
        const profile = profiles[0];
        console.log('✅ Profile found:');
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Merchant ID: ${profile.merchant_id || 'NULL (This is likely the problem!)'}`);
        console.log(`   - Is Active: ${profile.is_active}`);
        
        // 2. Check merchants table if merchant_id exists
        if (profile.merchant_id) {
            console.log('\n2. Checking merchants table...');
            const { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .select('*')
                .eq('id', profile.merchant_id)
                .single();
                
            if (merchantError) {
                console.log('❌ Merchant not found:', merchantError.message);
                console.log('   Profile has merchant_id but merchant does not exist!');
            } else {
                console.log('✅ Merchant found:');
                console.log(`   - ID: ${merchant.id}`);
                console.log(`   - Name: ${merchant.name}`);
                console.log(`   - Business Name: ${merchant.business_name || 'Not set'}`);
                console.log(`   - Is Active: ${merchant.is_active}`);
                console.log(`   - Owner ID: ${merchant.owner_id || 'NULL'}`);
            }
            
            // 3. Check products count for this merchant
            console.log('\n3. Checking products for this merchant...');
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', profile.merchant_id);
                
            if (productError) {
                console.log('❌ Error checking products:', productError.message);
            } else {
                console.log(`✅ Products found: ${productCount || 0}`);
            }
            
            // 4. Check sales count for this merchant
            console.log('\n4. Checking sales for this merchant...');
            const { count: salesCount, error: salesError } = await supabase
                .from('sales')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', profile.merchant_id);
                
            if (salesError) {
                console.log('❌ Error checking sales:', salesError.message);
            } else {
                console.log(`✅ Sales found: ${salesCount || 0}`);
            }
        } else {
            console.log('\n❌ CRITICAL ISSUE: Profile has no merchant_id!');
            console.log('   This explains why user sees no business data.');
        }
        
        // 5. List all merchants to see what exists
        console.log('\n5. Listing all merchants in database...');
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
        
        // 6. Check if there's a merchant owned by this user
        console.log('\n6. Checking if user owns any merchant...');
        const { data: ownedMerchants, error: ownedError } = await supabase
            .from('merchants')
            .select('*')
            .eq('owner_id', profile.id);
            
        if (ownedError) {
            console.log('❌ Error checking owned merchants:', ownedError.message);
        } else if (ownedMerchants.length === 0) {
            console.log('❌ User does not own any merchant');
            console.log('   This could be the issue - user needs to be associated with a merchant');
        } else {
            console.log(`✅ User owns ${ownedMerchants.length} merchant(s):`);
            ownedMerchants.forEach(merchant => {
                console.log(`   - ${merchant.name} (ID: ${merchant.id})`);
                if (profile.merchant_id !== merchant.id) {
                    console.log(`   ⚠️  WARNING: Profile merchant_id (${profile.merchant_id}) doesn't match owned merchant ID (${merchant.id})`);
                }
            });
        }
        
        // 7. Summary and recommendations
        console.log('\n🔍 DIAGNOSIS SUMMARY:');
        if (!profile.merchant_id) {
            console.log('❌ ROOT CAUSE: User profile has no merchant_id assigned');
            console.log('   SOLUTION: Need to create a merchant and associate user with it');
        } else {
            console.log('✅ User has merchant_id in profile');
            console.log('   Need to check if merchant exists and has proper data');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

debugUserData();
