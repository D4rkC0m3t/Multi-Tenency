-- Direct fix for POS error: record 'new' has no field 'total_amount'
-- This script can be run directly in Supabase SQL editor

-- Step 1: Add missing fields to products table for GST calculations
-- Most fertilizers are 5% GST or exempt, cess is rarely applicable for fertilizers
ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cess_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add missing fields to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS previous_outstanding DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_outstanding DECIMAL(10,2) DEFAULT 0;

-- Step 2: Add the missing total_amount field to sale_items table if it doesn't exist
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Step 3: Update existing sale_items records to have total_amount calculated
UPDATE sale_items 
SET total_amount = (quantity * unit_price) + 
                   COALESCE(cgst_amount, 0) + 
                   COALESCE(sgst_amount, 0) + 
                   COALESCE(igst_amount, 0) + 
                   COALESCE(cess_amount, 0)
WHERE total_amount IS NULL;

-- Step 4: Fix the auto_calculate_sale_item_taxes function to properly calculate total_amount
CREATE OR REPLACE FUNCTION auto_calculate_sale_item_taxes()
RETURNS TRIGGER AS $$
DECLARE
    product_gst_rate DECIMAL(5,2) := 0;
    product_cess_rate DECIMAL(5,2) := 0;
    merchant_state VARCHAR(2);
    customer_state VARCHAR(2);
    is_inter_state BOOLEAN := false;
BEGIN
    -- Get product GST rates
    SELECT COALESCE(gst_rate, 0), COALESCE(cess_rate, 0)
    INTO product_gst_rate, product_cess_rate
    FROM products 
    WHERE id = NEW.product_id;
    
    -- Get merchant and customer state codes for inter-state check
    SELECT m.state_code INTO merchant_state
    FROM products p
    JOIN merchants m ON p.merchant_id = m.id
    WHERE p.id = NEW.product_id;
    
    SELECT c.state_code INTO customer_state
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.id = NEW.sale_id;
    
    -- Check if inter-state transaction
    is_inter_state := (merchant_state IS NOT NULL AND customer_state IS NOT NULL AND merchant_state != customer_state);
    
    -- Calculate taxable amount
    NEW.taxable_amount := NEW.quantity * NEW.unit_price;
    
    -- Calculate tax amounts
    IF is_inter_state THEN
        -- Inter-state: Only IGST
        NEW.igst_amount := NEW.taxable_amount * product_gst_rate / 100;
        NEW.cgst_amount := 0;
        NEW.sgst_amount := 0;
    ELSE
        -- Intra-state: CGST + SGST (split GST rate equally)
        NEW.cgst_amount := NEW.taxable_amount * product_gst_rate / 200;
        NEW.sgst_amount := NEW.taxable_amount * product_gst_rate / 200;
        NEW.igst_amount := 0;
    END IF;
    
    -- Calculate cess
    NEW.cess_amount := NEW.taxable_amount * product_cess_rate / 100;
    
    -- Calculate total amount (this is the key fix)
    NEW.total_amount := NEW.taxable_amount + 
                       COALESCE(NEW.cgst_amount, 0) + 
                       COALESCE(NEW.sgst_amount, 0) + 
                       COALESCE(NEW.igst_amount, 0) + 
                       COALESCE(NEW.cess_amount, 0);
    
    -- Set inclusive rate if not provided
    IF NEW.inclusive_rate IS NULL THEN
        NEW.inclusive_rate := NEW.unit_price + (NEW.total_amount - NEW.taxable_amount);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS trigger_auto_calculate_sale_item_taxes ON sale_items;
CREATE TRIGGER trigger_auto_calculate_sale_item_taxes
    BEFORE INSERT OR UPDATE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_sale_item_taxes();

-- Step 6: Add comment for documentation
COMMENT ON COLUMN sale_items.total_amount IS 'Total amount for this line item including all taxes (taxable_amount + cgst + sgst + igst + cess)';

-- Verification query to check if the fix worked
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'total_amount';
