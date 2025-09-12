-- Add FCO and GST compliance fields to products table
-- Migration: 20250909165000_add_product_compliance_fields.sql

-- Add new columns to products table for FCO compliance
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS hsn_code TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS packing_details TEXT,
ADD COLUMN IF NOT EXISTS importing_company TEXT;

-- Add comments for documentation
COMMENT ON COLUMN products.hsn_code IS 'HSN/SAC code for GST compliance (e.g., 31051000 for fertilizers)';
COMMENT ON COLUMN products.manufacturer IS 'Manufacturing company name (mandatory for FCO compliance)';
COMMENT ON COLUMN products.packing_details IS 'Packing details (e.g., "1 bag of 50kg", "1 bottle of 1L")';
COMMENT ON COLUMN products.importing_company IS 'Importing company name if product is imported';

-- Add customer GST number field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS gst_number TEXT;

COMMENT ON COLUMN customers.gst_number IS 'Customer GST number if registered business';

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_products_hsn_code ON products(hsn_code) WHERE hsn_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_gst_number ON customers(gst_number) WHERE gst_number IS NOT NULL;

-- Update existing products with default HSN codes based on fertilizer types
UPDATE products 
SET hsn_code = CASE 
    WHEN LOWER(fertilizer_type) LIKE '%urea%' OR LOWER(name) LIKE '%urea%' THEN '31021000'
    WHEN LOWER(fertilizer_type) LIKE '%dap%' OR LOWER(name) LIKE '%dap%' THEN '31031000'
    WHEN LOWER(fertilizer_type) LIKE '%mop%' OR LOWER(name) LIKE '%mop%' THEN '31041000'
    WHEN LOWER(fertilizer_type) LIKE '%npk%' OR LOWER(name) LIKE '%npk%' THEN '31051000'
    WHEN LOWER(name) LIKE '%seed%' THEN '12019000'
    WHEN LOWER(name) LIKE '%pesticide%' OR LOWER(name) LIKE '%insecticide%' THEN '38089100'
    ELSE '31051000' -- Default fertilizer HSN
END
WHERE hsn_code IS NULL;

-- Set default packing details based on unit
UPDATE products 
SET packing_details = CASE 
    WHEN LOWER(unit) = 'kg' THEN '1 bag'
    WHEN LOWER(unit) = 'litre' OR LOWER(unit) = 'liter' THEN '1 bottle'
    WHEN LOWER(unit) = 'packet' THEN '1 packet'
    ELSE '1 unit'
END
WHERE packing_details IS NULL;
