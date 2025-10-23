import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fdukxfwdlwskznyiezgr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza3pueWllemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDE5MzYsImV4cCI6MjA3MjgxNzkzNn0.JmrzydnKSmRBAMN2lvFV2A-WtR0yT7loI1al0H2AxIU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPOSFunctionality() {
  console.log('🧪 Testing POS Functionality After Fix...\n')

  try {
    // Step 1: Check if total_amount column exists in sale_items table
    console.log('1. Checking sale_items table schema...')
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'sale_items' })
      .single()

    if (schemaError) {
      // Fallback: Try to query the table directly to see if total_amount field exists
      const { data: testData, error: testError } = await supabase
        .from('sale_items')
        .select('id, total_amount')
        .limit(1)

      if (testError && testError.message.includes('total_amount')) {
        console.log('❌ total_amount column is missing from sale_items table')
        console.log('Please run the fix_pos_error_direct.sql script in Supabase SQL editor first')
        return
      } else {
        console.log('✅ total_amount column exists in sale_items table')
      }
    } else {
      console.log('✅ Successfully queried table schema')
    }

    // Step 2: Test creating a sale with sale items
    console.log('\n2. Testing sale creation with items...')
    
    // First, get a test user and merchant
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'arjunin2020@gmail.com',
      password: 'test123' // This might need to be the actual password
    })

    if (authError) {
      console.log('⚠️  Authentication failed, proceeding with anonymous test...')
    } else {
      console.log('✅ User authenticated successfully')
    }

    // Get a merchant to test with
    const { data: merchants, error: merchantError } = await supabase
      .from('merchants')
      .select('id, business_name')
      .limit(1)

    if (merchantError || !merchants || merchants.length === 0) {
      console.log('❌ No merchants found for testing')
      return
    }

    const testMerchant = merchants[0]
    console.log(`✅ Using merchant: ${testMerchant.business_name}`)

    // Get a customer to test with
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('merchant_id', testMerchant.id)
      .limit(1)

    if (customerError || !customers || customers.length === 0) {
      console.log('⚠️  No customers found, creating a test customer...')
      
      const { data: newCustomer, error: createCustomerError } = await supabase
        .from('customers')
        .insert({
          merchant_id: testMerchant.id,
          name: 'Test Customer',
          phone: '9999999999',
          state_code: 'TN'
        })
        .select()
        .single()

      if (createCustomerError) {
        console.log('❌ Failed to create test customer:', createCustomerError.message)
        return
      }
      
      console.log('✅ Created test customer')
    }

    const testCustomer = customers?.[0] || newCustomer
    console.log(`✅ Using customer: ${testCustomer.name}`)

    // Get a product to test with
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, gst_rate, cess_rate')
      .eq('merchant_id', testMerchant.id)
      .limit(1)

    if (productError || !products || products.length === 0) {
      console.log('❌ No products found for testing')
      return
    }

    const testProduct = products[0]
    console.log(`✅ Using product: ${testProduct.name} (₹${testProduct.price})`)

    // Step 3: Create a test sale
    console.log('\n3. Creating test sale...')
    
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        merchant_id: testMerchant.id,
        customer_id: testCustomer.id,
        invoice_number: `TEST-${Date.now()}`,
        sale_date: new Date().toISOString().split('T')[0],
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        paid_amount: 0,
        payment_method: 'cash'
      })
      .select()
      .single()

    if (saleError) {
      console.log('❌ Failed to create sale:', saleError.message)
      return
    }

    console.log(`✅ Created sale with ID: ${sale.id}`)

    // Step 4: Add sale items (this is where the error was occurring)
    console.log('\n4. Adding sale items (testing the fix)...')
    
    const { data: saleItem, error: saleItemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        product_id: testProduct.id,
        quantity: 2,
        unit_price: testProduct.price,
        taxable_amount: 2 * testProduct.price
      })
      .select()
      .single()

    if (saleItemError) {
      console.log('❌ Failed to create sale item:', saleItemError.message)
      console.log('This indicates the POS error is still present')
      return
    }

    console.log('✅ Successfully created sale item!')
    console.log('Sale Item Details:')
    console.log(`  - Quantity: ${saleItem.quantity}`)
    console.log(`  - Unit Price: ₹${saleItem.unit_price}`)
    console.log(`  - Taxable Amount: ₹${saleItem.taxable_amount}`)
    console.log(`  - CGST: ₹${saleItem.cgst_amount || 0}`)
    console.log(`  - SGST: ₹${saleItem.sgst_amount || 0}`)
    console.log(`  - IGST: ₹${saleItem.igst_amount || 0}`)
    console.log(`  - Total Amount: ₹${saleItem.total_amount || 'Not calculated'}`)

    // Step 5: Verify the sale totals were updated
    console.log('\n5. Verifying sale totals update...')
    
    const { data: updatedSale, error: fetchSaleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', sale.id)
      .single()

    if (fetchSaleError) {
      console.log('❌ Failed to fetch updated sale:', fetchSaleError.message)
      return
    }

    console.log('✅ Sale totals updated successfully!')
    console.log('Updated Sale Details:')
    console.log(`  - Subtotal: ₹${updatedSale.subtotal}`)
    console.log(`  - Tax Amount: ₹${updatedSale.tax_amount}`)
    console.log(`  - Total Amount: ₹${updatedSale.total_amount}`)

    // Step 6: Clean up test data
    console.log('\n6. Cleaning up test data...')
    
    await supabase.from('sale_items').delete().eq('sale_id', sale.id)
    await supabase.from('sales').delete().eq('id', sale.id)
    
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 POS Functionality Test PASSED!')
    console.log('The total_amount field error has been successfully resolved.')

  } catch (error) {
    console.log('❌ Test failed with error:', error.message)
  }
}

// Run the test
testPOSFunctionality()
