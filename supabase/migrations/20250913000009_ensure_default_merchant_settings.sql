-- Ensure all merchants have proper default settings including logo upload capability
-- This addresses missing features for newly created merchants

-- 1. Update existing merchants without proper settings structure
UPDATE public.merchants 
SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
    'features', jsonb_build_object(
        'logo_upload', true,
        'invoice_customization', true,
        'advanced_reporting', true,
        'multi_location', true,
        'api_access', true
    ),
    'preferences', jsonb_build_object(
        'dark_mode', false,
        'compact_view', false,
        'auto_backup', true,
        'email_notifications', true
    ),
    'limits', jsonb_build_object(
        'max_products', 10000,
        'max_customers', 5000,
        'max_invoices_per_month', 1000,
        'storage_mb', 1000
    )
),
updated_at = NOW()
WHERE settings IS NULL 
   OR NOT (settings ? 'features')
   OR NOT (settings->'features' ? 'logo_upload');

-- 2. Add logo_url column to merchants table if it doesn't exist
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Create function to initialize merchant with default settings
CREATE OR REPLACE FUNCTION initialize_merchant_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure new merchants get proper default settings
    IF NEW.settings IS NULL OR NOT (NEW.settings ? 'features') THEN
        NEW.settings := COALESCE(NEW.settings, '{}'::jsonb) || jsonb_build_object(
            'features', jsonb_build_object(
                'logo_upload', true,
                'invoice_customization', true,
                'advanced_reporting', true,
                'multi_location', true,
                'api_access', true
            ),
            'preferences', jsonb_build_object(
                'dark_mode', false,
                'compact_view', false,
                'auto_backup', true,
                'email_notifications', true
            ),
            'limits', jsonb_build_object(
                'max_products', 10000,
                'max_customers', 5000,
                'max_invoices_per_month', 1000,
                'storage_mb', 1000
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to ensure default settings on merchant creation
DROP TRIGGER IF EXISTS ensure_merchant_defaults ON public.merchants;
CREATE TRIGGER ensure_merchant_defaults
    BEFORE INSERT OR UPDATE ON public.merchants
    FOR EACH ROW EXECUTE FUNCTION initialize_merchant_defaults();

-- 5. Create function to check if user has all required features
CREATE OR REPLACE FUNCTION get_user_features(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    has_merchant BOOLEAN,
    merchant_id UUID,
    logo_upload_enabled BOOLEAN,
    all_features JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (m.id IS NOT NULL) as has_merchant,
        m.id as merchant_id,
        COALESCE((m.settings->'features'->>'logo_upload')::boolean, true) as logo_upload_enabled,
        COALESCE(m.settings->'features', '{}'::jsonb) as all_features
    FROM public.profiles p
    LEFT JOIN public.merchants m ON m.id = p.merchant_id
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_features(UUID) TO authenticated;

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_settings_features ON public.merchants USING GIN ((settings->'features'));

-- 8. Add comments
COMMENT ON FUNCTION initialize_merchant_defaults() IS 'Ensures all merchants get proper default settings including logo upload';
COMMENT ON FUNCTION get_user_features(UUID) IS 'Returns user feature availability including logo upload status';

-- 9. Verify all existing merchants have logo upload enabled
DO $$
DECLARE
    merchant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO merchant_count
    FROM public.merchants 
    WHERE NOT COALESCE((settings->'features'->>'logo_upload')::boolean, false);
    
    IF merchant_count > 0 THEN
        RAISE NOTICE 'Updated % merchants to enable logo upload feature', merchant_count;
    ELSE
        RAISE NOTICE 'All merchants already have logo upload enabled';
    END IF;
END $$;
