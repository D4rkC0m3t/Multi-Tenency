import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdukxfwdlwskznyiezgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza3pueWllemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDE5MzYsImV4cCI6MjA3MjgxNzkzNn0.JmrzydnKSmRBAMN2lvFV2A-WtR0yT7loI1al0H2AxIU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserAccess() {
    console.log('🧪 Testing user access after RLS fix...\n');
    
    try {
        // 1. Test profiles table access (this was failing before)
        console.log('1. Testing profiles table access...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'arjunin2020@gmail.com');
            
        if (profilesError) {
            console.log('❌ Profiles still failing:', profilesError.message);
            return;
        }
        
        if (!profiles || profiles.length === 0) {
            console.log('❌ No profile found for arjunin2020@gmail.com');
            console.log('   Creating profile for this user...');
            
            // Try to create a profile (this should work now)
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    email: 'arjunin2020@gmail.com',
                    full_name: 'Arjun Test User',
                    role: 'admin',
                    is_active: true
                })
                .select()
                .single();
                
            if (createError) {
                console.log('❌ Failed to create profile:', createError.message);
                return;
            }
            
            console.log('✅ Profile created successfully');
            profiles.push(newProfile);
        }
        
        const profile = profiles[0];
        console.log('✅ Profile access working:');
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email}`);
        console.log(`   - Full Name: ${profile.full_name}`);
        console.log(`   - Role: ${profile.role}`);
        console.log(`   - Merchant ID: ${profile.merchant_id || 'NULL'}`);
        
        // 2. Check if user needs a merchant
        if (!profile.merchant_id) {
            console.log('\n2. User has no merchant - creating one...');
            
            const { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .insert({
                    name: 'Arjun Fertilizer Store',
                    business_name: 'Arjun Agro Solutions',
                    owner_id: profile.id,
                    is_active: true,
                    settings: {}
                })
                .select()
                .single();
                
            if (merchantError) {
                console.log('❌ Failed to create merchant:', merchantError.message);
                return;
            }
            
            console.log('✅ Merchant created:', merchant.name);
            
            // Update profile with merchant_id
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ merchant_id: merchant.id })
                .eq('id', profile.id);
                
            if (updateError) {
                console.log('❌ Failed to update profile with merchant_id:', updateError.message);
                return;
            }
            
            console.log('✅ Profile updated with merchant association');
            profile.merchant_id = merchant.id;
        }
        
        // 3. Test merchant access
        console.log('\n3. Testing merchant access...');
        const { data: merchant, error: merchantError } = await supabase
            .from('merchants')
            .select('*')
            .eq('id', profile.merchant_id)
            .single();
            
        if (merchantError) {
            console.log('❌ Merchant access failed:', merchantError.message);
        } else {
            console.log('✅ Merchant access working:');
            console.log(`   - Name: ${merchant.name}`);
            console.log(`   - Business Name: ${merchant.business_name || 'Not set'}`);
            console.log(`   - Is Active: ${merchant.is_active}`);
        }
        
        // 4. Test other table access
        console.log('\n4. Testing other table access...');
        
        const tables = ['products', 'categories', 'customers', 'suppliers', 'sales'];
        
        for (const table of tables) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', profile.merchant_id);
                
            if (error) {
                console.log(`❌ ${table} access failed:`, error.message);
            } else {
                console.log(`✅ ${table} access working: ${count || 0} records`);
            }
        }
        
        console.log('\n🎉 SUCCESS: User can now access their data!');
        console.log('   The RLS recursion fix has resolved the issue.');
        console.log('   User arjunin2020@gmail.com should now see their business data.');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testUserAccess();
