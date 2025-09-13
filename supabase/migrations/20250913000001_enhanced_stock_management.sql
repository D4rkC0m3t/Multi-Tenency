-- Enhanced Stock Management System
-- Adds batch tracking, reserved stock, reorder points, and negative stock prevention

-- Step 1: Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS min_stock_level numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock_level numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reserved_stock numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_quantity numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_method text DEFAULT 'weighted_average' CHECK (cost_method IN ('fifo', 'lifo', 'weighted_average')),
ADD COLUMN IF NOT EXISTS average_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_batch_tracking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS shelf_life_days integer DEFAULT 365;

-- Step 2: Create batch tracking table
CREATE TABLE IF NOT EXISTS public.product_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number text NOT NULL,
    manufacturing_date date,
    expiry_date date,
    purchase_price numeric DEFAULT 0,
    current_stock numeric DEFAULT 0,
    reserved_stock numeric DEFAULT 0,
    supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
    purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(merchant_id, product_id, batch_number)
);

-- Step 3: Create stock reservations table
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.product_batches(id) ON DELETE CASCADE,
    quantity numeric NOT NULL CHECK (quantity > 0),
    reservation_type text NOT NULL CHECK (reservation_type IN ('sale', 'transfer', 'adjustment')),
    reference_id uuid, -- sale_id, transfer_id, etc.
    reserved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Step 4: Create reorder alerts table
CREATE TABLE IF NOT EXISTS public.reorder_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    current_stock numeric NOT NULL,
    reorder_point numeric NOT NULL,
    suggested_quantity numeric NOT NULL,
    alert_level text NOT NULL CHECK (alert_level IN ('low', 'critical', 'out_of_stock')),
    is_acknowledged boolean DEFAULT false,
    acknowledged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    acknowledged_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Step 5: Create stock valuation history table
CREATE TABLE IF NOT EXISTS public.stock_valuations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES public.product_batches(id) ON DELETE CASCADE,
    valuation_date date NOT NULL,
    quantity numeric NOT NULL,
    unit_cost numeric NOT NULL,
    total_value numeric NOT NULL,
    cost_method text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Step 6: Add constraints to prevent negative stock
ALTER TABLE public.products 
ADD CONSTRAINT check_positive_current_stock CHECK (current_stock >= 0),
ADD CONSTRAINT check_positive_reserved_stock CHECK (reserved_stock >= 0);

ALTER TABLE public.product_batches
ADD CONSTRAINT check_positive_batch_stock CHECK (current_stock >= 0),
ADD CONSTRAINT check_positive_batch_reserved CHECK (reserved_stock >= 0);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_batches_merchant_product ON public.product_batches(merchant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_expiry ON public.product_batches(expiry_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stock_reservations_merchant_product ON public.stock_reservations(merchant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires ON public.stock_reservations(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reorder_alerts_merchant ON public.reorder_alerts(merchant_id) WHERE is_acknowledged = false;

-- Step 8: Enable RLS on new tables
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_valuations ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
CREATE POLICY "Users can manage batches within their merchant" ON public.product_batches 
FOR ALL USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage reservations within their merchant" ON public.stock_reservations 
FOR ALL USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage alerts within their merchant" ON public.reorder_alerts 
FOR ALL USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view valuations within their merchant" ON public.stock_valuations 
FOR SELECT USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));

-- Step 10: Add updated_at triggers
CREATE TRIGGER set_product_batches_updated_at 
BEFORE UPDATE ON public.product_batches 
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_stock_reservations_updated_at 
BEFORE UPDATE ON public.stock_reservations 
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_reorder_alerts_updated_at 
BEFORE UPDATE ON public.reorder_alerts 
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
