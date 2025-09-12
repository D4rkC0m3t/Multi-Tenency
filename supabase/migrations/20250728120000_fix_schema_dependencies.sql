/*
          # [Operation Name]
          Full Schema Re-creation with Dependency Fixes

          ## Query Description: [This script completely rebuilds the database schema. It first DROPS all existing tables, types, and functions to ensure a clean state, and then recreates them in the correct dependency order. This fixes the previous migration errors related to table dependencies, particularly the circular reference between `profiles` and `merchants`.

          **WARNING:** This is a destructive operation. All data currently in the tables will be permanently deleted. Please ensure you have backed up any critical data before proceeding.]
          
          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Drops all existing app tables, types, and functions.
          - Recreates ENUM types.
          - Recreates all tables in the correct order: `profiles`, `merchants`, `categories`, `products`, `customers`, `suppliers`, `purchases`, `purchase_items`, `sales`, `sale_items`, `inventory_adjustments`, `stock_movements`, `notifications`.
          - Re-establishes all foreign keys, indexes, triggers, and RLS policies.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (All policies are dropped and recreated)
          - Auth Requirements: Supabase admin privileges required to run.
          
          ## Performance Impact:
          - Indexes: All indexes are dropped and recreated.
          - Triggers: All triggers are dropped and recreated.
          - Estimated Impact: Brief downtime during migration, then improved performance and stability due to correct indexing and structure.
*/

-- Step 1: Drop all existing objects in reverse dependency order to ensure a clean slate.
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.inventory_adjustments CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.purchase_items CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.merchants CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop custom functions and types
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_stock_from_movement() CASCADE;
DROP TYPE IF EXISTS public.product_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.customer_type CASCADE;
DROP TYPE IF EXISTS public.adjustment_type CASCADE;


-- Step 2: Create custom ENUM types.
CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'cashier');
CREATE TYPE public.payment_method AS ENUM ('cash', 'credit', 'upi', 'bank_transfer');
CREATE TYPE public.transaction_type AS ENUM ('purchase', 'sale', 'adjustment');
CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'discontinued');
CREATE TYPE public.payment_status AS ENUM ('paid', 'unpaid', 'partial');
CREATE TYPE public.customer_type AS ENUM ('farmer', 'retailer', 'wholesaler', 'distributor', 'individual', 'other');
CREATE TYPE public.adjustment_type AS ENUM ('initial', 'wastage', 'return', 'physical_count', 'other');


-- Step 3: Create tables in the correct dependency order.
-- Create profiles first, but WITHOUT the merchant_id FK to break the circular dependency.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'staff',
    merchant_id UUID, -- Will be linked via ALTER TABLE later
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'User profiles, extending Supabase auth users.';

-- Create merchants table, now it can reference profiles without issue.
CREATE TABLE public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    business_type TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    gst_number TEXT,
    license_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.merchants IS 'Stores information about each tenant (merchant).';

-- Now, add the foreign key from profiles to merchants to complete the circular reference.
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_merchant_id
FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE SET NULL;

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.categories IS 'Product categories for each merchant.';

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT,
    fertilizer_type TEXT,
    brand TEXT,
    unit TEXT NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    minimum_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    maximum_stock NUMERIC(10, 2),
    batch_number TEXT,
    expiry_date DATE,
    manufacturing_date DATE,
    status product_status NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.products IS 'Inventory of all fertilizer products.';

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    customer_type customer_type NOT NULL DEFAULT 'farmer',
    phone TEXT,
    email TEXT,
    address TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    credit_limit NUMERIC(10, 2) NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.customers IS 'Customer database for each merchant.';

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gst_number TEXT,
    contact_person TEXT,
    payment_terms TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.suppliers IS 'Supplier information for each merchant.';

CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.purchases IS 'Records of stock purchases from suppliers.';

CREATE TABLE public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    batch_number TEXT,
    expiry_date DATE,
    manufacturing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.purchase_items IS 'Individual items within a purchase.';

CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    sale_date DATE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.sales IS 'Records of sales to customers.';

CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.sale_items IS 'Individual items within a sale.';

CREATE TABLE public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    adjustment_type adjustment_type NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    adjusted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    adjustment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.inventory_adjustments IS 'Manual adjustments to stock levels.';

CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    transaction_id UUID NOT NULL,
    quantity_change NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.stock_movements IS 'Source of truth for all stock changes.';

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_to TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.notifications IS 'User-specific notifications.';


-- Step 4: Create indexes for performance.
CREATE INDEX idx_profiles_merchant ON public.profiles(merchant_id);
CREATE INDEX idx_products_merchant ON public.products(merchant_id);
CREATE INDEX idx_sales_merchant ON public.sales(merchant_id);
CREATE INDEX idx_purchases_merchant ON public.purchases(merchant_id);
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_customers_merchant ON public.customers(merchant_id);
CREATE INDEX idx_suppliers_merchant ON public.suppliers(merchant_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);


-- Step 5: Add other constraints.
ALTER TABLE public.sales ADD CONSTRAINT sales_invoice_unique UNIQUE (merchant_id, invoice_number);
ALTER TABLE public.purchases ADD CONSTRAINT purchases_invoice_unique UNIQUE (merchant_id, invoice_number);
ALTER TABLE public.customers ADD CONSTRAINT chk_customer_type CHECK (customer_type IN ('farmer','retailer','wholesaler','distributor','individual','other'));


-- Step 6: Create helper functions and triggers.
CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for handle_new_user should already exist from Supabase Auth setup, but we define it here for completeness.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET current_stock = current_stock + NEW.quantity_change
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_stock_movement_insert
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE PROCEDURE public.update_stock_from_movement();

-- Function to apply the updated_at trigger to a table
CREATE OR REPLACE FUNCTION apply_updated_at_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all relevant tables
SELECT apply_updated_at_trigger('profiles');
SELECT apply_updated_at_trigger('merchants');
SELECT apply_updated_at_trigger('categories');
SELECT apply_updated_at_trigger('products');
SELECT apply_updated_at_trigger('customers');
SELECT apply_updated_at_trigger('suppliers');
SELECT apply_updated_at_trigger('purchases');
SELECT apply_updated_at_trigger('sales');


-- Step 7: Enable RLS and create policies for all tables.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's merchant_id
CREATE OR REPLACE FUNCTION get_my_merchant_id()
RETURNS UUID AS $$
DECLARE
  merchant_id_val UUID;
BEGIN
  SELECT merchant_id INTO merchant_id_val FROM public.profiles WHERE id = auth.uid();
  RETURN merchant_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for merchants
CREATE POLICY "Users can view their own merchant" ON public.merchants FOR SELECT USING (id = get_my_merchant_id());
CREATE POLICY "Merchant owners can update their merchant" ON public.merchants FOR UPDATE USING (owner_id = auth.uid());

-- Generic policies for tenant data
CREATE POLICY "Users can manage their own merchant data" ON public.categories FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.products FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.customers FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.suppliers FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.purchases FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.sales FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.inventory_adjustments FOR ALL USING (merchant_id = get_my_merchant_id());
CREATE POLICY "Users can manage their own merchant data" ON public.stock_movements FOR ALL USING (merchant_id = get_my_merchant_id());

-- Policies for junction tables (purchase_items, sale_items)
CREATE POLICY "Users can manage items in their merchant's purchases" ON public.purchase_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.purchases p
    WHERE p.id = purchase_id AND p.merchant_id = get_my_merchant_id()
  )
);
CREATE POLICY "Users can manage items in their merchant's sales" ON public.sale_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    WHERE s.id = sale_id AND s.merchant_id = get_my_merchant_id()
  )
);

-- Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());
