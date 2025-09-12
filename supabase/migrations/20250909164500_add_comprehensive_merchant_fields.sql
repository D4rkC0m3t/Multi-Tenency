-- Add comprehensive business information fields for fertilizer/seed merchants
-- Migration: 20250909164500_add_comprehensive_merchant_fields.sql

-- Add new columns to merchants table for comprehensive business information
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS cin_number TEXT,
ADD COLUMN IF NOT EXISTS fertilizer_license TEXT,
ADD COLUMN IF NOT EXISTS seed_license TEXT,
ADD COLUMN IF NOT EXISTS pesticide_license TEXT,
ADD COLUMN IF NOT EXISTS dealer_registration_id TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN merchants.owner_name IS 'Owner or primary contact person name';
COMMENT ON COLUMN merchants.pan_number IS 'PAN (Permanent Account Number) - linked to GST';
COMMENT ON COLUMN merchants.cin_number IS 'CIN (Corporate Identification Number) - for Pvt Ltd/LLP';
COMMENT ON COLUMN merchants.fertilizer_license IS 'Fertilizer Sale License (FCO) issued by agriculture department';
COMMENT ON COLUMN merchants.seed_license IS 'Seed License Number if selling seeds';
COMMENT ON COLUMN merchants.pesticide_license IS 'Insecticide/Pesticide License if selling pesticides';
COMMENT ON COLUMN merchants.dealer_registration_id IS 'State Agricultural Department Dealer Registration ID';
COMMENT ON COLUMN merchants.website IS 'Business website URL';
COMMENT ON COLUMN merchants.bank_name IS 'Bank name for payments';
COMMENT ON COLUMN merchants.account_number IS 'Bank account number (encrypted/masked in display)';
COMMENT ON COLUMN merchants.ifsc_code IS 'Bank IFSC code';
COMMENT ON COLUMN merchants.upi_id IS 'UPI ID for digital payments';

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_merchants_gst_number ON merchants(gst_number) WHERE gst_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_merchants_pan_number ON merchants(pan_number) WHERE pan_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_merchants_fertilizer_license ON merchants(fertilizer_license) WHERE fertilizer_license IS NOT NULL;

-- Update RLS policies to include new fields (if needed)
-- The existing policies should automatically cover the new columns
