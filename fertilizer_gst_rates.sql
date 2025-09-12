-- GST Rate Table for Common Fertilizer Products in India
-- Based on GST Council notifications for fertilizer industry

-- Update existing products with correct GST rates based on fertilizer type
UPDATE products 
SET gst_rate = CASE 
    -- EXEMPT (0% GST) - Essential fertilizers under Schedule I
    WHEN LOWER(name) LIKE '%urea%' OR LOWER(fertilizer_type) LIKE '%urea%' THEN 0.00
    WHEN LOWER(name) LIKE '%dap%' OR LOWER(fertilizer_type) LIKE '%dap%' OR LOWER(name) LIKE '%diammonium phosphate%' THEN 0.00
    WHEN LOWER(name) LIKE '%mop%' OR LOWER(fertilizer_type) LIKE '%mop%' OR LOWER(name) LIKE '%muriate of potash%' THEN 0.00
    WHEN LOWER(name) LIKE '%ssp%' OR LOWER(name) LIKE '%single super phosphate%' THEN 0.00
    WHEN LOWER(name) LIKE '%tsp%' OR LOWER(name) LIKE '%triple super phosphate%' THEN 0.00
    WHEN LOWER(name) LIKE '%ammonium sulphate%' OR LOWER(name) LIKE '%ammonium sulfate%' THEN 0.00
    WHEN LOWER(name) LIKE '%calcium ammonium nitrate%' OR LOWER(name) LIKE '%can%' THEN 0.00
    WHEN LOWER(name) LIKE '%npk%' AND (LOWER(name) LIKE '%10:26:26%' OR LOWER(name) LIKE '%12:32:16%' OR LOWER(name) LIKE '%20:20:0%') THEN 0.00
    
    -- 5% GST - Other fertilizers and micronutrients
    WHEN LOWER(fertilizer_type) LIKE '%micronutrient%' OR LOWER(name) LIKE '%micronutrient%' THEN 5.00
    WHEN LOWER(name) LIKE '%zinc%' OR LOWER(name) LIKE '%boron%' OR LOWER(name) LIKE '%iron%' THEN 5.00
    WHEN LOWER(fertilizer_type) LIKE '%water soluble%' OR LOWER(name) LIKE '%water soluble%' THEN 5.00
    WHEN LOWER(fertilizer_type) LIKE '%liquid%' OR LOWER(name) LIKE '%liquid fertilizer%' THEN 5.00
    WHEN LOWER(fertilizer_type) LIKE '%specialty%' OR LOWER(name) LIKE '%specialty%' THEN 5.00
    
    -- 12% GST - Organic fertilizers and bio-fertilizers
    WHEN LOWER(fertilizer_type) LIKE '%organic%' OR LOWER(name) LIKE '%organic%' THEN 12.00
    WHEN LOWER(fertilizer_type) LIKE '%biofertilizer%' OR LOWER(name) LIKE '%biofertilizer%' THEN 12.00
    WHEN LOWER(name) LIKE '%compost%' OR LOWER(name) LIKE '%vermicompost%' THEN 12.00
    WHEN LOWER(name) LIKE '%neem cake%' OR LOWER(name) LIKE '%bone meal%' THEN 12.00
    
    -- 18% GST - Pesticides, herbicides, fungicides
    WHEN LOWER(fertilizer_type) LIKE '%pesticide%' OR LOWER(name) LIKE '%pesticide%' THEN 18.00
    WHEN LOWER(fertilizer_type) LIKE '%herbicide%' OR LOWER(name) LIKE '%herbicide%' THEN 18.00
    WHEN LOWER(fertilizer_type) LIKE '%fungicide%' OR LOWER(name) LIKE '%fungicide%' THEN 18.00
    WHEN LOWER(fertilizer_type) LIKE '%insecticide%' OR LOWER(name) LIKE '%insecticide%' THEN 18.00
    
    -- Default 5% for other fertilizers
    ELSE 5.00
END,
-- Cess rate remains 0 for all fertilizer products (no compensation cess applicable)
cess_rate = 0.00
WHERE gst_rate IS NULL OR gst_rate = 18.00; -- Update products that don't have GST rate set or have incorrect 18% rate

-- Add comments for documentation
COMMENT ON COLUMN products.gst_rate IS 'GST rate in percentage - 0% for exempt fertilizers (urea, DAP, MOP), 5% for most fertilizers, 12% for organic, 18% for pesticides';
COMMENT ON COLUMN products.cess_rate IS 'Compensation cess rate - always 0% for fertilizer products (cess not applicable)';

-- Create a reference table for GST rates (optional - for documentation)
CREATE TABLE IF NOT EXISTS fertilizer_gst_reference (
    id SERIAL PRIMARY KEY,
    product_category TEXT NOT NULL,
    product_examples TEXT NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL,
    cess_rate DECIMAL(5,2) DEFAULT 0.00,
    hsn_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert reference data
INSERT INTO fertilizer_gst_reference (product_category, product_examples, gst_rate, cess_rate, hsn_code, notes) VALUES
('Essential Fertilizers (Exempt)', 'Urea, DAP, MOP, SSP, TSP, Ammonium Sulphate, CAN', 0.00, 0.00, '31021000, 31031000, 31041000', 'Exempt under GST Schedule I'),
('Micronutrient Fertilizers', 'Zinc Sulphate, Boron, Iron Chelate, Multi-micronutrient', 5.00, 0.00, '31051000', 'Essential for crop nutrition'),
('Water Soluble Fertilizers', 'NPK Water Soluble, Potassium Nitrate', 5.00, 0.00, '31051000', 'High efficiency fertilizers'),
('Liquid Fertilizers', 'Liquid NPK, Liquid Micronutrients', 5.00, 0.00, '31051000', 'Easy application fertilizers'),
('Specialty Fertilizers', 'Slow Release, Controlled Release, Coated Fertilizers', 5.00, 0.00, '31051000', 'Advanced fertilizer technology'),
('Organic Fertilizers', 'Compost, Vermicompost, Neem Cake, Bone Meal', 12.00, 0.00, '31010000', 'Organic farming inputs'),
('Bio-fertilizers', 'Rhizobium, Azotobacter, PSB, Mycorrhiza', 12.00, 0.00, '31010000', 'Biological fertilizers'),
('Pesticides', 'Insecticides, Fungicides, Herbicides', 18.00, 0.00, '38089100', 'Plant protection chemicals'),
('Seeds', 'Hybrid Seeds, OP Seeds, Treated Seeds', 5.00, 0.00, '12019000', 'Planting material'),
('Growth Regulators', 'PGR, Hormones, Cytokinin', 18.00, 0.00, '38089900', 'Plant growth substances')
ON CONFLICT DO NOTHING;

-- Update HSN codes based on product type (if not already set)
UPDATE products 
SET hsn_code = CASE 
    WHEN LOWER(name) LIKE '%urea%' THEN '31021000'
    WHEN LOWER(name) LIKE '%dap%' OR LOWER(name) LIKE '%diammonium phosphate%' THEN '31031000'
    WHEN LOWER(name) LIKE '%mop%' OR LOWER(name) LIKE '%muriate of potash%' THEN '31041000'
    WHEN LOWER(name) LIKE '%ssp%' OR LOWER(name) LIKE '%single super phosphate%' THEN '31031000'
    WHEN LOWER(name) LIKE '%tsp%' OR LOWER(name) LIKE '%triple super phosphate%' THEN '31031000'
    WHEN LOWER(fertilizer_type) LIKE '%organic%' OR LOWER(name) LIKE '%organic%' THEN '31010000'
    WHEN LOWER(fertilizer_type) LIKE '%pesticide%' OR LOWER(name) LIKE '%pesticide%' THEN '38089100'
    WHEN LOWER(fertilizer_type) LIKE '%herbicide%' OR LOWER(name) LIKE '%herbicide%' THEN '38089100'
    WHEN LOWER(fertilizer_type) LIKE '%fungicide%' OR LOWER(name) LIKE '%fungicide%' THEN '38089100'
    WHEN LOWER(fertilizer_type) LIKE '%insecticide%' OR LOWER(name) LIKE '%insecticide%' THEN '38089100'
    WHEN LOWER(name) LIKE '%seed%' THEN '12019000'
    ELSE '31051000' -- Default fertilizer HSN
END
WHERE hsn_code IS NULL OR hsn_code = '';

-- Verification query to check updated GST rates
-- SELECT fertilizer_type, name, gst_rate, cess_rate, hsn_code FROM products ORDER BY gst_rate, fertilizer_type;
