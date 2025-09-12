-- E-Invoice Schema for GST Compliance
-- This migration adds tables to support E-Invoice generation, IRP integration, and compliance tracking

-- E-Invoice metadata table to store IRP response data
CREATE TABLE IF NOT EXISTS einvoice_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    
    -- IRP Registration Data
    irn VARCHAR(64) UNIQUE NOT NULL, -- Invoice Reference Number from IRP
    ack_no VARCHAR(50) NOT NULL, -- Acknowledgment Number
    ack_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Acknowledgment Date
    
    -- Digital Signature Data
    signed_invoice_json JSONB NOT NULL, -- Complete signed JSON from IRP
    signed_qr_code TEXT NOT NULL, -- Base64 encoded QR code from IRP
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    cancellation_date TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- API Integration Tracking
    irp_request_payload JSONB NOT NULL, -- Original request sent to IRP
    irp_response_raw JSONB NOT NULL, -- Full IRP response for audit
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Invoice configuration for merchants
CREATE TABLE IF NOT EXISTS einvoice_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE UNIQUE,
    
    -- IRP Integration Settings
    is_enabled BOOLEAN DEFAULT false,
    irp_username VARCHAR(100),
    irp_password_encrypted TEXT, -- Encrypted password
    client_id VARCHAR(100),
    client_secret_encrypted TEXT, -- Encrypted client secret
    gstin VARCHAR(15) NOT NULL, -- Must match merchant GSTIN
    
    -- Compliance Settings
    annual_turnover DECIMAL(15,2), -- For threshold validation
    einvoice_threshold DECIMAL(10,2) DEFAULT 500.00, -- Minimum invoice amount for e-invoice
    auto_generate_einvoice BOOLEAN DEFAULT false,
    
    -- API Endpoints (can be sandbox or production)
    irp_base_url VARCHAR(255) DEFAULT 'https://api.einvoice.gov.in',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Invoice audit log for tracking all API calls
CREATE TABLE IF NOT EXISTS einvoice_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    einvoice_id UUID REFERENCES einvoice_metadata(id) ON DELETE SET NULL,
    
    -- Operation Details
    operation VARCHAR(50) NOT NULL, -- 'generate', 'cancel', 'verify'
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'pending'
    
    -- Request/Response Data
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    
    -- Timing
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_timestamp TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_einvoice_metadata_merchant_id ON einvoice_metadata(merchant_id);
CREATE INDEX IF NOT EXISTS idx_einvoice_metadata_sale_id ON einvoice_metadata(sale_id);
CREATE INDEX IF NOT EXISTS idx_einvoice_metadata_irn ON einvoice_metadata(irn);
CREATE INDEX IF NOT EXISTS idx_einvoice_metadata_status ON einvoice_metadata(status);
CREATE INDEX IF NOT EXISTS idx_einvoice_audit_merchant_id ON einvoice_audit_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_einvoice_audit_operation ON einvoice_audit_log(operation);

-- Add RLS policies
ALTER TABLE einvoice_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE einvoice_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE einvoice_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for einvoice_metadata
CREATE POLICY "Users can view their merchant's e-invoice metadata" ON einvoice_metadata
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their merchant's e-invoice metadata" ON einvoice_metadata
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their merchant's e-invoice metadata" ON einvoice_metadata
    FOR UPDATE USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policies for einvoice_config
CREATE POLICY "Users can view their merchant's e-invoice config" ON einvoice_config
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their merchant's e-invoice config" ON einvoice_config
    FOR ALL USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policies for einvoice_audit_log
CREATE POLICY "Users can view their merchant's e-invoice audit log" ON einvoice_audit_log
    FOR SELECT USING (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their merchant's e-invoice audit log" ON einvoice_audit_log
    FOR INSERT WITH CHECK (
        merchant_id IN (
            SELECT merchant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_einvoice_metadata_updated_at BEFORE UPDATE ON einvoice_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_einvoice_config_updated_at BEFORE UPDATE ON einvoice_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add e-invoice related fields to sales table if not exists
DO $$ 
BEGIN
    -- Add e-invoice status to sales table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'einvoice_status') THEN
        ALTER TABLE sales ADD COLUMN einvoice_status VARCHAR(20) DEFAULT 'not_applicable' 
        CHECK (einvoice_status IN ('not_applicable', 'pending', 'generated', 'cancelled', 'error'));
    END IF;
    
    -- Add e-invoice eligibility flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'is_einvoice_eligible') THEN
        ALTER TABLE sales ADD COLUMN is_einvoice_eligible BOOLEAN DEFAULT false;
    END IF;
    
    -- Add buyer GSTIN if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'buyer_gstin') THEN
        ALTER TABLE sales ADD COLUMN buyer_gstin VARCHAR(15);
    END IF;
END $$;

-- Create function to determine e-invoice eligibility
CREATE OR REPLACE FUNCTION check_einvoice_eligibility(sale_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sale_record RECORD;
    config_record RECORD;
BEGIN
    -- Get sale details
    SELECT s.*, c.gst_number as customer_gstin 
    INTO sale_record
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.id = sale_id;
    
    -- Get merchant e-invoice config
    SELECT * INTO config_record
    FROM einvoice_config
    WHERE merchant_id = sale_record.merchant_id;
    
    -- Check eligibility criteria
    IF config_record.is_enabled = false THEN
        RETURN false;
    END IF;
    
    -- Must be B2B (customer must have GSTIN)
    IF sale_record.customer_gstin IS NULL OR sale_record.customer_gstin = '' THEN
        RETURN false;
    END IF;
    
    -- Must meet minimum threshold
    IF sale_record.total_amount < config_record.einvoice_threshold THEN
        RETURN false;
    END IF;
    
    -- Must not be cash sale for small amounts (business rule)
    IF sale_record.payment_method = 'cash' AND sale_record.total_amount < 50000 THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE einvoice_metadata IS 'Stores E-Invoice data received from IRP including IRN, signed JSON and QR codes';
COMMENT ON TABLE einvoice_config IS 'E-Invoice configuration and IRP credentials for each merchant';
COMMENT ON TABLE einvoice_audit_log IS 'Audit trail for all E-Invoice API operations';
COMMENT ON FUNCTION check_einvoice_eligibility IS 'Determines if a sale is eligible for E-Invoice generation based on GST rules';
