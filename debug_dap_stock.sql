-- Check the current stock value for the "dap" product
-- This will help us understand why the stock constraint is failing

SELECT 
  id,
  name,
  unit,
  current_stock,
  minimum_stock,
  maximum_stock,
  status,
  created_at,
  updated_at
FROM products 
WHERE name ILIKE '%dap%' 
ORDER BY created_at DESC 
LIMIT 5;
