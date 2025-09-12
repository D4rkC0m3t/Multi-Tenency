-- Inventory Triggers to generate stock_movements from sale_items and purchase_items
-- and to keep products.current_stock updated via existing stock_movement_trigger.
-- Safe for re-run using CREATE OR REPLACE.

-- Ensure required enum exists
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'transaction_type' AND typnamespace = 'public'::regnamespace;
  IF NOT FOUND THEN
    CREATE TYPE public.transaction_type AS ENUM ('purchase', 'sale', 'adjustment');
  END IF;
END $$;

-- Policy to allow inserting stock_movements by authenticated members of a merchant
-- so that trigger-executed inserts (under session user) pass RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stock_movements' AND policyname = 'stock_movements_insert_members'
  ) THEN
    EXECUTE $$
      CREATE POLICY stock_movements_insert_members
      ON public.stock_movements
      FOR INSERT
      TO authenticated
      WITH CHECK (
        merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid())
      )
    $$;
  END IF;
END $$;

-- Optionally allow members to read their movements
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stock_movements' AND policyname = 'stock_movements_select_members'
  ) THEN
    EXECUTE $$
      CREATE POLICY stock_movements_select_members
      ON public.stock_movements
      FOR SELECT
      TO authenticated
      USING (
        merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid())
      )
    $$;
  END IF;
END $$;

-- FUNCTIONS for sale_items
CREATE OR REPLACE FUNCTION public.sale_items_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
BEGIN
  SELECT s.merchant_id INTO v_merchant FROM public.sales s WHERE s.id = NEW.sale_id;
  IF v_merchant IS NULL THEN
    RETURN NEW; -- nothing to do
  END IF;
  INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
  VALUES (v_merchant, NEW.product_id, 'sale', NEW.sale_id, -1 * COALESCE(NEW.quantity, 0));
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.sale_items_after_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
BEGIN
  SELECT s.merchant_id INTO v_merchant FROM public.sales s WHERE s.id = OLD.sale_id;
  IF v_merchant IS NULL THEN
    RETURN OLD;
  END IF;
  -- Revert the stock decrease when a sale item is deleted
  INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
  VALUES (v_merchant, OLD.product_id, 'sale', OLD.sale_id, COALESCE(OLD.quantity, 0));
  RETURN OLD;
END
$$;

CREATE OR REPLACE FUNCTION public.sale_items_after_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
  v_delta numeric;
BEGIN
  SELECT s.merchant_id INTO v_merchant FROM public.sales s WHERE s.id = NEW.sale_id;
  IF v_merchant IS NULL THEN
    RETURN NEW;
  END IF;
  v_delta := COALESCE(NEW.quantity, 0) - COALESCE(OLD.quantity, 0);
  IF v_delta <> 0 THEN
    -- Negative delta decreases stock; positive delta increases stock back
    INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
    VALUES (v_merchant, NEW.product_id, 'sale', NEW.sale_id, -1 * v_delta);
  END IF;
  RETURN NEW;
END
$$;

-- TRIGGERS for sale_items
DROP TRIGGER IF EXISTS trg_sale_items_ai ON public.sale_items;
CREATE TRIGGER trg_sale_items_ai
AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.sale_items_after_insert();

DROP TRIGGER IF EXISTS trg_sale_items_ad ON public.sale_items;
CREATE TRIGGER trg_sale_items_ad
AFTER DELETE ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.sale_items_after_delete();

DROP TRIGGER IF EXISTS trg_sale_items_au ON public.sale_items;
CREATE TRIGGER trg_sale_items_au
AFTER UPDATE OF quantity, product_id ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION public.sale_items_after_update();

-- FUNCTIONS for purchase_items
CREATE OR REPLACE FUNCTION public.purchase_items_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
BEGIN
  SELECT p.merchant_id INTO v_merchant FROM public.purchases p WHERE p.id = NEW.purchase_id;
  IF v_merchant IS NULL THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
  VALUES (v_merchant, NEW.product_id, 'purchase', NEW.purchase_id, COALESCE(NEW.quantity, 0));
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.purchase_items_after_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
BEGIN
  SELECT p.merchant_id INTO v_merchant FROM public.purchases p WHERE p.id = OLD.purchase_id;
  IF v_merchant IS NULL THEN
    RETURN OLD;
  END IF;
  -- Revert the stock increase when a purchase item is deleted
  INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
  VALUES (v_merchant, OLD.product_id, 'purchase', OLD.purchase_id, -1 * COALESCE(OLD.quantity, 0));
  RETURN OLD;
END
$$;

CREATE OR REPLACE FUNCTION public.purchase_items_after_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_merchant uuid;
  v_delta numeric;
BEGIN
  SELECT p.merchant_id INTO v_merchant FROM public.purchases p WHERE p.id = NEW.purchase_id;
  IF v_merchant IS NULL THEN
    RETURN NEW;
  END IF;
  v_delta := COALESCE(NEW.quantity, 0) - COALESCE(OLD.quantity, 0);
  IF v_delta <> 0 THEN
    INSERT INTO public.stock_movements (merchant_id, product_id, transaction_type, transaction_id, quantity_change)
    VALUES (v_merchant, NEW.product_id, 'purchase', NEW.purchase_id, v_delta);
  END IF;
  RETURN NEW;
END
$$;

-- TRIGGERS for purchase_items
DROP TRIGGER IF EXISTS trg_purchase_items_ai ON public.purchase_items;
CREATE TRIGGER trg_purchase_items_ai
AFTER INSERT ON public.purchase_items
FOR EACH ROW EXECUTE FUNCTION public.purchase_items_after_insert();

DROP TRIGGER IF EXISTS trg_purchase_items_ad ON public.purchase_items;
CREATE TRIGGER trg_purchase_items_ad
AFTER DELETE ON public.purchase_items
FOR EACH ROW EXECUTE FUNCTION public.purchase_items_after_delete();

DROP TRIGGER IF EXISTS trg_purchase_items_au ON public.purchase_items;
CREATE TRIGGER trg_purchase_items_au
AFTER UPDATE OF quantity, product_id ON public.purchase_items
FOR EACH ROW EXECUTE FUNCTION public.purchase_items_after_update();
