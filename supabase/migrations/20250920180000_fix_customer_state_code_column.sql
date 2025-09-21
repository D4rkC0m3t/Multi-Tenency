-- Fix missing columns in sales table for POS functionality
-- Migration: 20250920180000_fix_customer_state_code_column.sql

-- Ensure ALL required columns exist in sales table
DO $$ 
BEGIN
    -- Add paid_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'paid_amount') THEN
        ALTER TABLE sales ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add invoice_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'invoice_type') THEN
        ALTER TABLE sales ADD COLUMN invoice_type TEXT;
    END IF;
    
    -- Add invoice_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'invoice_title') THEN
        ALTER TABLE sales ADD COLUMN invoice_title TEXT;
    END IF;
    
    -- Add eway_bill_required column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'eway_bill_required') THEN
        ALTER TABLE sales ADD COLUMN eway_bill_required BOOLEAN DEFAULT false;
    END IF;
    
    -- Add movement_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'movement_value') THEN
        ALTER TABLE sales ADD COLUMN movement_value DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add customer_state_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'customer_state_code') THEN
        ALTER TABLE sales ADD COLUMN customer_state_code TEXT;
    END IF;
    
    -- Add merchant_state_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'merchant_state_code') THEN
        ALTER TABLE sales ADD COLUMN merchant_state_code TEXT;
    END IF;
    
    -- Add cgst_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'cgst_amount') THEN
        ALTER TABLE sales ADD COLUMN cgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add sgst_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'sgst_amount') THEN
        ALTER TABLE sales ADD COLUMN sgst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add igst_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'igst_amount') THEN
        ALTER TABLE sales ADD COLUMN igst_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add is_interstate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'is_interstate') THEN
        ALTER TABLE sales ADD COLUMN is_interstate BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_sales_customer_state_code ON sales(customer_state_code);
CREATE INDEX IF NOT EXISTS idx_sales_merchant_state_code ON sales(merchant_state_code);
CREATE INDEX IF NOT EXISTS idx_sales_is_interstate ON sales(is_interstate);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_type ON sales(invoice_type);
CREATE INDEX IF NOT EXISTS idx_sales_eway_bill_required ON sales(eway_bill_required);
CREATE INDEX IF NOT EXISTS idx_sales_paid_amount ON sales(paid_amount);

-- Ensure state code columns exist in merchants and customers tables too
DO $$ 
BEGIN
    -- Add state_code to merchants if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'merchants' AND column_name = 'state_code') THEN
        ALTER TABLE merchants ADD COLUMN state_code TEXT;
    END IF;
    
    -- Add state_code to customers if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'state_code') THEN
        ALTER TABLE customers ADD COLUMN state_code TEXT;
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON sales TO authenticated;
GRANT SELECT ON merchants TO authenticated;
GRANT SELECT ON customers TO authenticated;
