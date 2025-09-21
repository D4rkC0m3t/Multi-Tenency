-- Add dynamic invoice title logic based on GST rules
-- Migration: 20250920000003_add_dynamic_invoice_titles.sql

-- Add merchant GST registration type fields
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS gst_registration_type TEXT CHECK (gst_registration_type IN ('regular', 'composition', 'exempt', 'unregistered')) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS composition_dealer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exempt_supplies BOOLEAN DEFAULT false;

-- Add invoice type and E-way bill fields to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS invoice_type TEXT CHECK (invoice_type IN ('tax_invoice', 'bill_of_supply', 'eway_bill')) DEFAULT 'tax_invoice',
ADD COLUMN IF NOT EXISTS invoice_title TEXT,
ADD COLUMN IF NOT EXISTS eway_bill_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS eway_bill_number TEXT,
ADD COLUMN IF NOT EXISTS movement_value DECIMAL(10,2);

-- Create function to determine invoice type based on GST rules
CREATE OR REPLACE FUNCTION determine_invoice_type(
    merchant_gst_type TEXT,
    is_composition BOOLEAN,
    is_exempt BOOLEAN,
    total_amount DECIMAL(10,2),
    merchant_gstin TEXT,
    customer_gstin TEXT
)
RETURNS TABLE (
    invoice_type TEXT,
    invoice_title TEXT,
    eway_required BOOLEAN
) AS $$
DECLARE
    has_merchant_gstin BOOLEAN;
    has_customer_gstin BOOLEAN;
    is_interstate BOOLEAN;
BEGIN
    -- Check if GST numbers exist and are valid
    has_merchant_gstin := merchant_gstin IS NOT NULL AND LENGTH(TRIM(merchant_gstin)) = 15;
    has_customer_gstin := customer_gstin IS NOT NULL AND LENGTH(TRIM(customer_gstin)) = 15;
    
    -- Determine if interstate (simplified - you can enhance this with state code logic)
    is_interstate := has_merchant_gstin AND has_customer_gstin AND 
                    SUBSTRING(merchant_gstin, 1, 2) != SUBSTRING(customer_gstin, 1, 2);
    
    -- Apply GST rules for invoice type
    IF is_composition OR is_exempt OR merchant_gst_type = 'composition' OR merchant_gst_type = 'exempt' THEN
        -- Composition dealer or exempt supplies = Bill of Supply
        RETURN QUERY SELECT 
            'bill_of_supply'::TEXT as invoice_type,
            'BILL OF SUPPLY'::TEXT as invoice_title,
            (total_amount > 50000)::BOOLEAN as eway_required;
    
    ELSIF merchant_gst_type = 'unregistered' OR NOT has_merchant_gstin THEN
        -- Unregistered dealer = Bill of Supply
        RETURN QUERY SELECT 
            'bill_of_supply'::TEXT as invoice_type,
            'BILL OF SUPPLY'::TEXT as invoice_title,
            false::BOOLEAN as eway_required;
    
    ELSE
        -- Regular GST dealer = Tax Invoice
        IF total_amount > 50000 AND (is_interstate OR total_amount > 100000) THEN
            -- E-way bill required for interstate > 50k or intrastate > 1 lakh
            RETURN QUERY SELECT 
                'eway_bill'::TEXT as invoice_type,
                'TAX INVOICE (E-WAY BILL REQUIRED)'::TEXT as invoice_title,
                true::BOOLEAN as eway_required;
        ELSE
            -- Regular tax invoice
            RETURN QUERY SELECT 
                'tax_invoice'::TEXT as invoice_type,
                'TAX INVOICE'::TEXT as invoice_title,
                false::BOOLEAN as eway_required;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically set invoice type
CREATE OR REPLACE FUNCTION set_invoice_type_trigger()
RETURNS TRIGGER AS $$
DECLARE
    merchant_record RECORD;
    customer_record RECORD;
    invoice_info RECORD;
BEGIN
    -- Get merchant information
    SELECT 
        gst_registration_type,
        composition_dealer,
        exempt_supplies,
        gst_number as merchant_gstin
    INTO merchant_record
    FROM merchants 
    WHERE id = NEW.merchant_id;
    
    -- Get customer GSTIN if customer exists
    SELECT gstin as customer_gstin
    INTO customer_record
    FROM customers 
    WHERE id = NEW.customer_id;
    
    -- Determine invoice type
    SELECT * INTO invoice_info
    FROM determine_invoice_type(
        merchant_record.gst_registration_type,
        merchant_record.composition_dealer,
        merchant_record.exempt_supplies,
        NEW.total_amount,
        merchant_record.merchant_gstin,
        customer_record.customer_gstin
    );
    
    -- Set the fields
    NEW.invoice_type := invoice_info.invoice_type;
    NEW.invoice_title := invoice_info.invoice_title;
    NEW.eway_bill_required := invoice_info.eway_required;
    NEW.movement_value := NEW.total_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set invoice type on sales insert/update
DROP TRIGGER IF EXISTS set_invoice_type_on_sales ON sales;
CREATE TRIGGER set_invoice_type_on_sales
    BEFORE INSERT OR UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_type_trigger();

-- Create function to get invoice title for display
CREATE OR REPLACE FUNCTION get_invoice_title(sale_id UUID)
RETURNS TEXT AS $$
DECLARE
    title TEXT;
BEGIN
    SELECT invoice_title INTO title
    FROM sales
    WHERE id = sale_id;
    
    RETURN COALESCE(title, 'INVOICE');
END;
$$ LANGUAGE plpgsql;

-- Create function to check if E-way bill is required
CREATE OR REPLACE FUNCTION is_eway_bill_required(sale_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    required BOOLEAN;
BEGIN
    SELECT eway_bill_required INTO required
    FROM sales
    WHERE id = sale_id;
    
    RETURN COALESCE(required, false);
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_invoice_type ON sales(invoice_type);
CREATE INDEX IF NOT EXISTS idx_sales_eway_required ON sales(eway_bill_required) WHERE eway_bill_required = true;
CREATE INDEX IF NOT EXISTS idx_merchants_gst_type ON merchants(gst_registration_type);

-- Update existing sales records to have proper invoice types
UPDATE sales 
SET 
    invoice_type = 'tax_invoice',
    invoice_title = 'TAX INVOICE',
    eway_bill_required = (total_amount > 50000),
    movement_value = total_amount
WHERE invoice_type IS NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION determine_invoice_type(TEXT, BOOLEAN, BOOLEAN, DECIMAL(10,2), TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_title(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_eway_bill_required(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN sales.invoice_type IS 'Type of invoice based on GST rules: tax_invoice, bill_of_supply, eway_bill';
COMMENT ON COLUMN sales.invoice_title IS 'Dynamic title for invoice display based on GST compliance';
COMMENT ON COLUMN sales.eway_bill_required IS 'Whether E-way bill is required for this transaction';
COMMENT ON COLUMN merchants.gst_registration_type IS 'GST registration type: regular, composition, exempt, unregistered';
COMMENT ON COLUMN merchants.composition_dealer IS 'Whether merchant is registered under composition scheme';
COMMENT ON COLUMN merchants.exempt_supplies IS 'Whether merchant deals in exempt supplies';

-- Create view for invoice summary with titles
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
    s.id,
    s.invoice_number,
    s.invoice_title,
    s.invoice_type,
    s.total_amount,
    s.eway_bill_required,
    s.eway_bill_number,
    s.is_interstate,
    m.name as merchant_name,
    m.gst_registration_type,
    c.name as customer_name,
    c.gstin as customer_gstin,
    s.created_at
FROM sales s
LEFT JOIN merchants m ON s.merchant_id = m.id
LEFT JOIN customers c ON s.customer_id = c.id;

-- Grant access to the view
GRANT SELECT ON invoice_summary TO authenticated;
