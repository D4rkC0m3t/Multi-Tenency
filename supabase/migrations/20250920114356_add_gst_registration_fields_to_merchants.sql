-- Add GST registration type fields to merchants table
-- These fields are required for dynamic invoice titles and GST compliance

-- Add GST registration type fields to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS gst_registration_type TEXT CHECK (gst_registration_type IN ('regular', 'composition', 'exempt', 'unregistered')) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS composition_dealer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exempt_supplies BOOLEAN DEFAULT false;

-- Add license fields for fertilizer business compliance
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS fertilizer_license TEXT,
ADD COLUMN IF NOT EXISTS seed_license TEXT,
ADD COLUMN IF NOT EXISTS pesticide_license TEXT,
ADD COLUMN IF NOT EXISTS dealer_registration_id TEXT;

-- Add state and GST state code columns for GST calculations
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS state_code TEXT;

-- Add state and GST state code columns to customers table as well
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS village TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT;

-- Add comment for documentation
COMMENT ON COLUMN merchants.gst_registration_type IS 'GST registration type: regular, composition, exempt, or unregistered';
COMMENT ON COLUMN merchants.composition_dealer IS 'Whether the merchant is registered under composition scheme';
COMMENT ON COLUMN merchants.exempt_supplies IS 'Whether the merchant deals in exempt supplies';
COMMENT ON COLUMN merchants.fertilizer_license IS 'Fertilizer sale license number';
COMMENT ON COLUMN merchants.seed_license IS 'Seed license number';
COMMENT ON COLUMN merchants.pesticide_license IS 'Pesticide license number';
COMMENT ON COLUMN merchants.dealer_registration_id IS 'Dealer registration ID';
