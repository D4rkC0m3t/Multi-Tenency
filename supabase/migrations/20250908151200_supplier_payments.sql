-- Supplier payments (payables) schema

CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  method text,
  reference text,
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='supplier_payments' AND policyname='supp_pay_select_members'
  ) THEN
    CREATE POLICY supp_pay_select_members ON public.supplier_payments FOR SELECT TO authenticated USING (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='supplier_payments' AND policyname='supp_pay_ins_members'
  ) THEN
    CREATE POLICY supp_pay_ins_members ON public.supplier_payments FOR INSERT TO authenticated WITH CHECK (merchant_id = (SELECT merchant_id FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

-- Optional view: supplier_balances (sum purchases - payments). Keep simple by exposing helper aggregation.
CREATE OR REPLACE VIEW public.v_supplier_balances AS
SELECT s.id AS supplier_id,
       s.merchant_id,
       COALESCE((SELECT SUM(total_amount) FROM public.purchases p WHERE p.supplier_id = s.id), 0) AS total_purchases,
       COALESCE((SELECT SUM(amount) FROM public.supplier_payments sp WHERE sp.supplier_id = s.id), 0) AS total_paid,
       COALESCE((SELECT SUM(total_amount) FROM public.purchases p WHERE p.supplier_id = s.id), 0) -
       COALESCE((SELECT SUM(amount) FROM public.supplier_payments sp WHERE sp.supplier_id = s.id), 0) AS balance
FROM public.suppliers s;
