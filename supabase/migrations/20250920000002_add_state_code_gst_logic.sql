-- Add state code mapping and GST logic for inter-state transactions
-- Migration: 20250920000002_add_state_code_gst_logic.sql

-- Add state code columns to merchants and customers tables
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS state_name TEXT;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS state_code TEXT,
ADD COLUMN IF NOT EXISTS state_name TEXT;

-- Add GST breakdown columns to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_interstate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_state_code TEXT,
ADD COLUMN IF NOT EXISTS merchant_state_code TEXT;

-- Create Indian states and their GST state codes mapping table
CREATE TABLE IF NOT EXISTS indian_states_gst_codes (
    id SERIAL PRIMARY KEY,
    state_name TEXT NOT NULL UNIQUE,
    state_code TEXT NOT NULL UNIQUE,
    gst_state_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all Indian states with their GST state codes
INSERT INTO indian_states_gst_codes (state_name, state_code, gst_state_code) VALUES
('Andhra Pradesh', 'AP', '37'),
('Arunachal Pradesh', 'AR', '12'),
('Assam', 'AS', '18'),
('Bihar', 'BR', '10'),
('Chhattisgarh', 'CG', '22'),
('Goa', 'GA', '30'),
('Gujarat', 'GJ', '24'),
('Haryana', 'HR', '06'),
('Himachal Pradesh', 'HP', '02'),
('Jharkhand', 'JH', '20'),
('Karnataka', 'KA', '29'),
('Kerala', 'KL', '32'),
('Madhya Pradesh', 'MP', '23'),
('Maharashtra', 'MH', '27'),
('Manipur', 'MN', '14'),
('Meghalaya', 'ML', '17'),
('Mizoram', 'MZ', '15'),
('Nagaland', 'NL', '13'),
('Odisha', 'OR', '21'),
('Punjab', 'PB', '03'),
('Rajasthan', 'RJ', '08'),
('Sikkim', 'SK', '11'),
('Tamil Nadu', 'TN', '33'),
('Telangana', 'TS', '36'),
('Tripura', 'TR', '16'),
('Uttar Pradesh', 'UP', '09'),
('Uttarakhand', 'UK', '05'),
('West Bengal', 'WB', '19'),
('Andaman and Nicobar Islands', 'AN', '35'),
('Chandigarh', 'CH', '04'),
('Dadra and Nagar Haveli and Daman and Diu', 'DH', '26'),
('Delhi', 'DL', '07'),
('Jammu and Kashmir', 'JK', '01'),
('Ladakh', 'LA', '38'),
('Lakshadweep', 'LD', '31'),
('Puducherry', 'PY', '34')
ON CONFLICT (state_name) DO NOTHING;

-- Function to get GST state code from state name
CREATE OR REPLACE FUNCTION get_gst_state_code(state_name_input TEXT)
RETURNS TEXT AS $$
DECLARE
    gst_code TEXT;
BEGIN
    SELECT gst_state_code INTO gst_code
    FROM indian_states_gst_codes
    WHERE LOWER(state_name) = LOWER(TRIM(state_name_input))
    LIMIT 1;
    
    RETURN COALESCE(gst_code, '27'); -- Default to Maharashtra if not found
END;
$$ LANGUAGE plpgsql;

-- Function to determine if transaction is interstate
CREATE OR REPLACE FUNCTION is_interstate_transaction(merchant_state TEXT, customer_state TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- If either state is null or empty, assume intrastate
    IF merchant_state IS NULL OR customer_state IS NULL OR 
       TRIM(merchant_state) = '' OR TRIM(customer_state) = '' THEN
        RETURN FALSE;
    END IF;
    
    -- Compare GST state codes
    RETURN get_gst_state_code(merchant_state) != get_gst_state_code(customer_state);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GST breakdown based on state codes
CREATE OR REPLACE FUNCTION calculate_gst_breakdown(
    tax_amount DECIMAL(10,2),
    merchant_state TEXT,
    customer_state TEXT
)
RETURNS TABLE (
    cgst_amount DECIMAL(10,2),
    sgst_amount DECIMAL(10,2),
    igst_amount DECIMAL(10,2),
    is_interstate BOOLEAN
) AS $$
DECLARE
    interstate_flag BOOLEAN;
BEGIN
    -- Determine if interstate
    interstate_flag := is_interstate_transaction(merchant_state, customer_state);
    
    IF interstate_flag THEN
        -- Interstate: Full tax as IGST
        RETURN QUERY SELECT 
            0.00::DECIMAL(10,2) as cgst_amount,
            0.00::DECIMAL(10,2) as sgst_amount,
            tax_amount as igst_amount,
            TRUE as is_interstate;
    ELSE
        -- Intrastate: Split equally between CGST and SGST
        RETURN QUERY SELECT 
            (tax_amount / 2)::DECIMAL(10,2) as cgst_amount,
            (tax_amount / 2)::DECIMAL(10,2) as sgst_amount,
            0.00::DECIMAL(10,2) as igst_amount,
            FALSE as is_interstate;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update merchant state code from state name
CREATE OR REPLACE FUNCTION update_merchant_state_codes()
RETURNS VOID AS $$
BEGIN
    UPDATE merchants 
    SET 
        state_code = get_gst_state_code(state),
        state_name = state
    WHERE state IS NOT NULL AND state != '';
END;
$$ LANGUAGE plpgsql;

-- Function to update customer state code from state name
CREATE OR REPLACE FUNCTION update_customer_state_codes()
RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET 
        state_code = get_gst_state_code(state),
        state_name = state
    WHERE state IS NOT NULL AND state != '';
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set state codes when merchant state is updated
CREATE OR REPLACE FUNCTION trigger_update_merchant_state_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.state IS NOT NULL AND NEW.state != '' THEN
        NEW.state_code := get_gst_state_code(NEW.state);
        NEW.state_name := NEW.state;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set state codes when customer state is updated
CREATE OR REPLACE FUNCTION trigger_update_customer_state_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.state IS NOT NULL AND NEW.state != '' THEN
        NEW.state_code := get_gst_state_code(NEW.state);
        NEW.state_name := NEW.state;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_merchant_state_code_trigger ON merchants;
CREATE TRIGGER update_merchant_state_code_trigger
    BEFORE INSERT OR UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_merchant_state_code();

DROP TRIGGER IF EXISTS update_customer_state_code_trigger ON customers;
CREATE TRIGGER update_customer_state_code_trigger
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_customer_state_code();

-- Update existing records
SELECT update_merchant_state_codes();
SELECT update_customer_state_codes();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_state_code ON merchants(state_code);
CREATE INDEX IF NOT EXISTS idx_customers_state_code ON customers(state_code);
CREATE INDEX IF NOT EXISTS idx_sales_interstate ON sales(is_interstate);
CREATE INDEX IF NOT EXISTS idx_indian_states_gst_code ON indian_states_gst_codes(gst_state_code);

-- Grant permissions
GRANT SELECT ON indian_states_gst_codes TO authenticated;
GRANT EXECUTE ON FUNCTION get_gst_state_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_interstate_transaction(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_gst_breakdown(DECIMAL(10,2), TEXT, TEXT) TO authenticated;
