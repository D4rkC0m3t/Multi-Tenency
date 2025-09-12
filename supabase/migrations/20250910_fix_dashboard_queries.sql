-- Create function to get low stock count
CREATE OR REPLACE FUNCTION get_low_stock_count(merchant_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM products
    WHERE merchant_id = merchant_id_param
      AND status = 'active'
      AND current_stock <= minimum_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get expiring products count
CREATE OR REPLACE FUNCTION get_expiring_products_count(merchant_id_param UUID, days_ahead INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM products
    WHERE merchant_id = merchant_id_param
      AND status = 'active'
      AND expiry_date IS NOT NULL
      AND expiry_date <= (CURRENT_DATE + INTERVAL '1 day' * days_ahead)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
