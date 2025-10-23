import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductsRLS() {
  console.log('🔍 Testing Products RLS Policy...\n');

  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ User not authenticated. Please sign in first.');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Test 2: Check user's merchant info using debug function
    const { data: debugInfo, error: debugError } = await supabase
      .rpc('debug_user_merchant_info');

    if (debugError) {
      console.log('❌ Error getting debug info:', debugError.message);
    } else {
      console.log('\n📊 User Merchant Debug Info:');
      console.log('   Current User ID:', debugInfo[0]?.current_user_id);
      console.log('   Merchant ID:', debugInfo[0]?.merchant_id);
      console.log('   Profile Exists:', debugInfo[0]?.profile_exists);
      console.log('   Merchant Exists:', debugInfo[0]?.merchant_exists);
    }

    // Test 3: Try to get merchant_id using the function
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_my_merchant_id');

    if (merchantError) {
      console.log('\n❌ Error getting merchant ID:', merchantError.message);
    } else {
      console.log('\n✅ get_my_merchant_id() returned:', merchantId);
    }

    // Test 4: Try to fetch existing products
    const { data: products, error: selectError } = await supabase
      .from('products')
      .select('id, name, merchant_id')
      .limit(5);

    if (selectError) {
      console.log('\n❌ Error fetching products:', selectError.message);
    } else {
      console.log('\n✅ Successfully fetched', products.length, 'products');
      if (products.length > 0) {
        console.log('   Sample product merchant_id:', products[0].merchant_id);
      }
    }

    // Test 5: Try to insert a test product
    const testProduct = {
      name: 'Test Product RLS',
      description: 'Testing RLS policy',
      category_id: null,
      sku: 'TEST-RLS-' + Date.now(),
      unit: 'kg',
      purchase_price: 100,
      selling_price: 120,
      current_stock: 0,
      minimum_stock: 5,
      maximum_stock: 100,
      merchant_id: merchantId // Use the merchant_id from the function
    };

    console.log('\n🧪 Testing product insertion...');
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error inserting product:', insertError.message);
      console.log('   Error details:', insertError);
    } else {
      console.log('✅ Successfully inserted test product:', insertedProduct.name);
      console.log('   Product ID:', insertedProduct.id);
      
      // Clean up - delete the test product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', insertedProduct.id);
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test product:', deleteError.message);
      } else {
        console.log('🧹 Test product cleaned up successfully');
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testProductsRLS();
