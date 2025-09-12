-- Purchase Orders and GRN (Goods Receipt) schema
-- Safe-guarded with IF NOT EXISTS where possible

-- purchase_order_status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_order_status') THEN
    CREATE TYPE public.purchase_order_status AS ENUM ('draft','approved','partially_received','received','closed','cancelled');
  END IF;
END $$;

-- purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  po_number text UNIQUE,
  status public.purchase_order_status NOT NULL DEFAULT 'draft',
  expected_date date,
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- purchase_order_items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  description text,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  tax_rate numeric DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- grns (Goods Receipts)
CREATE TABLE IF NOT EXISTS public.grns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  reference_number text,
  received_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- grn_items (items received against a GRN)
CREATE TABLE IF NOT EXISTS public.grn_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  grn_id uuid NOT NULL REFERENCES public.grns(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  purchase_order_item_id uuid REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  quantity_received numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS enable (assuming RLS is used project-wide)
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

-- Policies: members of a merchant can CRUD within same merchant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_orders' AND policyname='po_select_members'
  ) THEN
    CREATE POLICY po_select_members ON public.purchase_orders FOR SELECT TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_orders' AND policyname='po_ins_members'
  ) THEN
    CREATE POLICY po_ins_members ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_orders' AND policyname='po_upd_members'
  ) THEN
    CREATE POLICY po_upd_members ON public.purchase_orders FOR UPDATE TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid())) WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_orders' AND policyname='po_del_members'
  ) THEN
    CREATE POLICY po_del_members ON public.purchase_orders FOR DELETE TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_items' AND policyname='poi_select_members'
  ) THEN
    CREATE POLICY poi_select_members ON public.purchase_order_items FOR SELECT TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_items' AND policyname='poi_ins_members'
  ) THEN
    CREATE POLICY poi_ins_members ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_items' AND policyname='poi_upd_members'
  ) THEN
    CREATE POLICY poi_upd_members ON public.purchase_order_items FOR UPDATE TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid())) WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_items' AND policyname='poi_del_members'
  ) THEN
    CREATE POLICY poi_del_members ON public.purchase_order_items FOR DELETE TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grns' AND policyname='grn_select_members'
  ) THEN
    CREATE POLICY grn_select_members ON public.grns FOR SELECT TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grns' AND policyname='grn_ins_members'
  ) THEN
    CREATE POLICY grn_ins_members ON public.grns FOR INSERT TO authenticated WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grn_items' AND policyname='grni_select_members'
  ) THEN
    CREATE POLICY grni_select_members ON public.grn_items FOR SELECT TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grn_items' AND policyname='grni_ins_members'
  ) THEN
    CREATE POLICY grni_ins_members ON public.grn_items FOR INSERT TO authenticated WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

-- Trigger: when GRN items are inserted, create stock_movements (purchase) to increase stock
CREATE OR REPLACE FUNCTION public.grn_items_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_merchant uuid; v_po uuid;
BEGIN
  SELECT g.merchant_id, g.purchase_order_id INTO v_merchant, v_po FROM public.grns g WHERE g.id = NEW.grn_id;
  IF v_merchant IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change, note)
  VALUES (v_merchant, NEW.product_id, 'purchase', COALESCE(v_po, NEW.grn_id), COALESCE(NEW.quantity_received,0), 'GRN receipt');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_grn_items_ai ON public.grn_items;
CREATE TRIGGER trg_grn_items_ai
AFTER INSERT ON public.grn_items
FOR EACH ROW EXECUTE FUNCTION public.grn_items_after_insert();
