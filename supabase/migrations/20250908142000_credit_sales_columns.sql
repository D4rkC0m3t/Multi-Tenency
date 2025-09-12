-- Add credit sales related columns if not present
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS amount_received numeric DEFAULT 0;
