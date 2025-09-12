-- Fix POS error: record 'new' has no field 'total_amount'
-- The issue is in the auto_calculate_sale_totals() trigger function
-- It's trying to access total_amount field from sale_items table which doesn't exist

-- First, add the missing total_amount field to sale_items table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'total_amount') THEN
        ALTER TABLE sale_items ADD COLUMN total_amount DECIMAL(10,2);
    END IF;
END $$;

-- Update the auto_calculate_sale_item_taxes function to calculate total_amount
CREATE OR REPLACE FUNCTION auto_calculate_sale_item_taxes()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    merchant_state_code VARCHAR(2);
    customer_state_code VARCHAR(2);
    is_inter_state BOOLEAN;
    tax_result RECORD;
BEGIN
    -- Get product details including GST rates
    SELECT p.*, m.state_code as merchant_state
    INTO product_record
    FROM products p
    JOIN merchants m ON p.merchant_id = m.id
    WHERE p.id = NEW.product_id;
    
    -- Get customer state code
    SELECT c.state_code INTO customer_state_code
    FROM customers c
    JOIN sales s ON s.customer_id = c.id
    WHERE s.id = NEW.sale_id;
    
    -- Determine if this is inter-state transaction
    merchant_state_code := product_record.merchant_state;
    is_inter_state := (merchant_state_code != customer_state_code);
    
    -- Calculate taxable amount (quantity * unit_price)
    NEW.taxable_amount := NEW.quantity * NEW.unit_price;
    
    -- Calculate tax amounts using the calculate_tax_amounts function if it exists
    -- Otherwise, calculate manually
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_tax_amounts') THEN
        SELECT * INTO tax_result
        FROM calculate_tax_amounts(
            NEW.taxable_amount,
            COALESCE(product_record.gst_rate, 0),
            COALESCE(product_record.cess_rate, 0),
            is_inter_state,
            false -- assuming exclusive pricing for now
        );
        
        -- Set tax amounts
        NEW.cgst_amount := tax_result.cgst_amount;
        NEW.sgst_amount := tax_result.sgst_amount;
        NEW.igst_amount := tax_result.igst_amount;
        NEW.cess_amount := tax_result.cess_amount;
    ELSE
        -- Manual calculation if function doesn't exist
        DECLARE
            gst_rate DECIMAL(5,2) := COALESCE(product_record.gst_rate, 0);
            cess_rate DECIMAL(5,2) := COALESCE(product_record.cess_rate, 0);
        BEGIN
            IF is_inter_state THEN
                NEW.igst_amount := NEW.taxable_amount * gst_rate / 100;
                NEW.cgst_amount := 0;
                NEW.sgst_amount := 0;
            ELSE
                NEW.cgst_amount := NEW.taxable_amount * gst_rate / 200; -- Half of GST rate
                NEW.sgst_amount := NEW.taxable_amount * gst_rate / 200; -- Half of GST rate
                NEW.igst_amount := 0;
            END IF;
            
            NEW.cess_amount := NEW.taxable_amount * cess_rate / 100;
        END;
    END IF;
    
    -- Calculate total amount (taxable + all taxes)
    NEW.total_amount := NEW.taxable_amount + 
                       COALESCE(NEW.cgst_amount, 0) + 
                       COALESCE(NEW.sgst_amount, 0) + 
                       COALESCE(NEW.igst_amount, 0) + 
                       COALESCE(NEW.cess_amount, 0);
    
    -- Set inclusive rate if not provided
    IF NEW.inclusive_rate IS NULL THEN
        NEW.inclusive_rate := NEW.unit_price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers to ensure they use the updated functions
DROP TRIGGER IF EXISTS trigger_auto_calculate_sale_item_taxes ON sale_items;
CREATE TRIGGER trigger_auto_calculate_sale_item_taxes
    BEFORE INSERT OR UPDATE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_sale_item_taxes();

DROP TRIGGER IF EXISTS trigger_auto_calculate_sale_totals ON sale_items;
CREATE TRIGGER trigger_auto_calculate_sale_totals
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_sale_totals();

COMMENT ON COLUMN sale_items.total_amount IS 'Total amount for this line item including all taxes (taxable_amount + cgst + sgst + igst + cess)';
