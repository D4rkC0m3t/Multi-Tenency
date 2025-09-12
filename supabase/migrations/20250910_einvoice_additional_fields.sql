-- Additional E-Invoice fields based on sample format analysis
-- This migration adds missing fields identified from the E-Invoice sample

-- Add missing fields to sales table for E-Invoice compliance
DO $$ 
BEGIN
    -- E-Way Bill details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'eway_bill_no') THEN
        ALTER TABLE sales ADD COLUMN eway_bill_no VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'eway_bill_date') THEN
        ALTER TABLE sales ADD COLUMN eway_bill_date DATE;
    END IF;
    
    -- Transport details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'vehicle_no') THEN
        ALTER TABLE sales ADD COLUMN vehicle_no VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'transport_mode') THEN
        ALTER TABLE sales ADD COLUMN transport_mode VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'despatch_through') THEN
        ALTER TABLE sales ADD COLUMN despatch_through VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'destination') THEN
        ALTER TABLE sales ADD COLUMN destination VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'supply_date_time') THEN
        ALTER TABLE sales ADD COLUMN supply_date_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Document references
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'other_references') THEN
        ALTER TABLE sales ADD COLUMN other_references TEXT;
    END IF;
    
    -- Tax breakdown fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'cgst_amount') THEN
        ALTER TABLE sales ADD COLUMN cgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'sgst_amount') THEN
        ALTER TABLE sales ADD COLUMN sgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'igst_amount') THEN
        ALTER TABLE sales ADD COLUMN igst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'cess_amount') THEN
        ALTER TABLE sales ADD COLUMN cess_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'round_off_amount') THEN
        ALTER TABLE sales ADD COLUMN round_off_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Outstanding amounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'previous_outstanding') THEN
        ALTER TABLE sales ADD COLUMN previous_outstanding DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'total_outstanding') THEN
        ALTER TABLE sales ADD COLUMN total_outstanding DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add missing fields to sale_items table
DO $$ 
BEGIN
    -- Manufacturing and expiry dates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'manufacturing_date') THEN
        ALTER TABLE sale_items ADD COLUMN manufacturing_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'expiry_date') THEN
        ALTER TABLE sale_items ADD COLUMN expiry_date DATE;
    END IF;
    
    -- Inclusive rate (rate including tax)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'inclusive_rate') THEN
        ALTER TABLE sale_items ADD COLUMN inclusive_rate DECIMAL(10,2);
    END IF;
    
    -- Tax amounts per item
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'cgst_amount') THEN
        ALTER TABLE sale_items ADD COLUMN cgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'sgst_amount') THEN
        ALTER TABLE sale_items ADD COLUMN sgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'igst_amount') THEN
        ALTER TABLE sale_items ADD COLUMN igst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'cess_amount') THEN
        ALTER TABLE sale_items ADD COLUMN cess_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Taxable amount (amount before tax)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sale_items' AND column_name = 'taxable_amount') THEN
        ALTER TABLE sale_items ADD COLUMN taxable_amount DECIMAL(10,2);
    END IF;
END $$;

-- Add missing fields to customers table for E-Invoice
DO $$ 
BEGIN
    -- Customer contact details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'state_code') THEN
        ALTER TABLE customers ADD COLUMN state_code VARCHAR(2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'pin_code') THEN
        ALTER TABLE customers ADD COLUMN pin_code VARCHAR(6);
    END IF;
    
    -- Location details for farmers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'village') THEN
        ALTER TABLE customers ADD COLUMN village VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'district') THEN
        ALTER TABLE customers ADD COLUMN district VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'state') THEN
        ALTER TABLE customers ADD COLUMN state VARCHAR(50);
    END IF;
END $$;

-- Add missing fields to merchants table for E-Invoice
DO $$ 
BEGIN
    -- State code for merchant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'state_code') THEN
        ALTER TABLE merchants ADD COLUMN state_code VARCHAR(2);
    END IF;
    
    -- PIN code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'pin_code') THEN
        ALTER TABLE merchants ADD COLUMN pin_code VARCHAR(6);
    END IF;
    
    -- Business registration details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'business_name') THEN
        ALTER TABLE merchants ADD COLUMN business_name VARCHAR(200);
    END IF;
    
    -- Bank details for E-Invoice
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'bank_name') THEN
        ALTER TABLE merchants ADD COLUMN bank_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'bank_account_number') THEN
        ALTER TABLE merchants ADD COLUMN bank_account_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'bank_ifsc_code') THEN
        ALTER TABLE merchants ADD COLUMN bank_ifsc_code VARCHAR(11);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'bank_branch') THEN
        ALTER TABLE merchants ADD COLUMN bank_branch VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'upi_id') THEN
        ALTER TABLE merchants ADD COLUMN upi_id VARCHAR(50);
    END IF;
END $$;

-- Add missing fields to products table for E-Invoice
DO $$ 
BEGIN
    -- Manufacturing company details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'manufacturing_company') THEN
        ALTER TABLE products ADD COLUMN manufacturing_company VARCHAR(200);
    END IF;
    
    -- Importing company (for imported fertilizers)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'importing_company') THEN
        ALTER TABLE products ADD COLUMN importing_company VARCHAR(200);
    END IF;
    
    -- Packing details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'packing_details') THEN
        ALTER TABLE products ADD COLUMN packing_details VARCHAR(100);
    END IF;
    
    -- Product origin country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'origin_country') THEN
        ALTER TABLE products ADD COLUMN origin_country VARCHAR(50) DEFAULT 'IN';
    END IF;
    
    -- Cess rate (if applicable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cess_rate') THEN
        ALTER TABLE products ADD COLUMN cess_rate DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Create function to calculate tax amounts based on inclusive/exclusive rates
CREATE OR REPLACE FUNCTION calculate_tax_amounts(
    amount DECIMAL(10,2),
    gst_rate DECIMAL(5,2),
    cess_rate DECIMAL(5,2) DEFAULT 0,
    is_inclusive BOOLEAN DEFAULT true,
    seller_state_code VARCHAR(2) DEFAULT '37',
    buyer_state_code VARCHAR(2) DEFAULT '37'
)
RETURNS TABLE(
    taxable_amount DECIMAL(10,2),
    cgst_amount DECIMAL(10,2),
    sgst_amount DECIMAL(10,2),
    igst_amount DECIMAL(10,2),
    cess_amount DECIMAL(10,2),
    total_tax DECIMAL(10,2)
) AS $$
DECLARE
    base_amount DECIMAL(10,2);
    gst_amount DECIMAL(10,2);
    calculated_cess DECIMAL(10,2);
    is_inter_state BOOLEAN;
BEGIN
    -- Determine if it's inter-state transaction
    is_inter_state := seller_state_code != buyer_state_code;
    
    -- Calculate base taxable amount
    IF is_inclusive THEN
        base_amount := amount / (1 + (gst_rate + cess_rate) / 100);
    ELSE
        base_amount := amount;
    END IF;
    
    -- Calculate GST amount
    gst_amount := base_amount * gst_rate / 100;
    
    -- Calculate cess amount
    calculated_cess := base_amount * cess_rate / 100;
    
    -- Return values based on inter-state or intra-state
    IF is_inter_state THEN
        RETURN QUERY SELECT 
            base_amount,
            0::DECIMAL(10,2), -- CGST
            0::DECIMAL(10,2), -- SGST
            gst_amount,       -- IGST
            calculated_cess,
            gst_amount + calculated_cess;
    ELSE
        RETURN QUERY SELECT 
            base_amount,
            gst_amount / 2,   -- CGST
            gst_amount / 2,   -- SGST
            0::DECIMAL(10,2), -- IGST
            calculated_cess,
            gst_amount + calculated_cess;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate tax amounts on sale_items
CREATE OR REPLACE FUNCTION auto_calculate_sale_item_taxes()
RETURNS TRIGGER AS $$
DECLARE
    tax_calc RECORD;
    sale_record RECORD;
    customer_record RECORD;
    merchant_record RECORD;
    product_record RECORD;
BEGIN
    -- Get related records
    SELECT * INTO sale_record FROM sales WHERE id = NEW.sale_id;
    SELECT * INTO customer_record FROM customers WHERE id = sale_record.customer_id;
    SELECT * INTO merchant_record FROM merchants WHERE id = sale_record.merchant_id;
    SELECT * INTO product_record FROM products WHERE id = NEW.product_id;
    
    -- Calculate tax amounts
    SELECT * INTO tax_calc FROM calculate_tax_amounts(
        NEW.total_amount,
        COALESCE(product_record.gst_rate, 0),
        COALESCE(product_record.cess_rate, 0),
        true, -- Assuming inclusive pricing
        COALESCE(merchant_record.state_code, '37'),
        COALESCE(customer_record.state_code, '37')
    );
    
    -- Update the record with calculated values
    NEW.taxable_amount := tax_calc.taxable_amount;
    NEW.cgst_amount := tax_calc.cgst_amount;
    NEW.sgst_amount := tax_calc.sgst_amount;
    NEW.igst_amount := tax_calc.igst_amount;
    NEW.cess_amount := tax_calc.cess_amount;
    
    -- Set inclusive rate if not provided
    IF NEW.inclusive_rate IS NULL THEN
        NEW.inclusive_rate := NEW.unit_price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_calculate_sale_item_taxes ON sale_items;
CREATE TRIGGER trigger_auto_calculate_sale_item_taxes
    BEFORE INSERT OR UPDATE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_sale_item_taxes();

-- Create trigger to auto-calculate sale totals
CREATE OR REPLACE FUNCTION auto_calculate_sale_totals()
RETURNS TRIGGER AS $$
DECLARE
    sale_totals RECORD;
BEGIN
    -- Calculate totals from sale_items
    SELECT 
        COALESCE(SUM(taxable_amount), 0) as total_taxable,
        COALESCE(SUM(cgst_amount), 0) as total_cgst,
        COALESCE(SUM(sgst_amount), 0) as total_sgst,
        COALESCE(SUM(igst_amount), 0) as total_igst,
        COALESCE(SUM(cess_amount), 0) as total_cess,
        COALESCE(SUM(total_amount), 0) as total_amount
    INTO sale_totals
    FROM sale_items 
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);
    
    -- Update sales table
    UPDATE sales SET
        subtotal = sale_totals.total_taxable,
        cgst_amount = sale_totals.total_cgst,
        sgst_amount = sale_totals.total_sgst,
        igst_amount = sale_totals.total_igst,
        cess_amount = sale_totals.total_cess,
        tax_amount = sale_totals.total_cgst + sale_totals.total_sgst + sale_totals.total_igst + sale_totals.total_cess,
        total_amount = sale_totals.total_amount,
        total_outstanding = COALESCE(previous_outstanding, 0) + sale_totals.total_amount - COALESCE(paid_amount, 0)
    WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sale totals
DROP TRIGGER IF EXISTS trigger_auto_calculate_sale_totals ON sale_items;
CREATE TRIGGER trigger_auto_calculate_sale_totals
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_sale_totals();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_eway_bill ON sales(eway_bill_no) WHERE eway_bill_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_no ON sales(vehicle_no) WHERE vehicle_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_einvoice_status ON sales(einvoice_status);
CREATE INDEX IF NOT EXISTS idx_customers_gst_number ON customers(gst_number) WHERE gst_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_state_code ON customers(state_code);
CREATE INDEX IF NOT EXISTS idx_products_hsn_code ON products(hsn_code);

COMMENT ON FUNCTION calculate_tax_amounts IS 'Calculates GST and cess amounts based on inclusive/exclusive pricing and inter/intra-state rules';
COMMENT ON FUNCTION auto_calculate_sale_item_taxes IS 'Automatically calculates tax amounts for sale items based on product GST rates and state codes';
COMMENT ON FUNCTION auto_calculate_sale_totals IS 'Automatically calculates and updates sale totals when sale items are modified';
