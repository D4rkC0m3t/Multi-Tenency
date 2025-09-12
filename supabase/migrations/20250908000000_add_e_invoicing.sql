/*
          # [Feature] E-Invoicing Schema
          This migration adds the necessary table and relationships to support government-compliant E-Invoicing.

          ## Query Description: 
          This script creates a new `e_invoices` table to store details for each generated e-invoice, including the Invoice Reference Number (IRN), Acknowledgement Number, and the data required to generate a QR code. It establishes a one-to-one relationship with the `sales` table. No existing data will be lost, but this is a prerequisite for the E-Invoicing feature.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by dropping the table and foreign key)
          
          ## Structure Details:
          - Adds new table: `public.e_invoices`
          - Columns: `id`, `sale_id`, `merchant_id`, `status`, `irn`, `ack_no`, `ack_dt`, `signed_qr_code`, `e_invoice_json`, `error_details`, `created_at`
          - Adds Foreign Key: `e_invoices.sale_id` references `sales.id`
          - Adds Indexes: on `sale_id` and `merchant_id` for performance.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (new policies for the `e_invoices` table)
          - Auth Requirements: Users can only access e-invoices belonging to their merchant.
          
          ## Performance Impact:
          - Indexes: Added
          - Triggers: None
          - Estimated Impact: Low. Adds a new table with efficient indexing.
          */

-- 1. Create E-Invoice Status ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'e_invoice_status') THEN
        CREATE TYPE public.e_invoice_status AS ENUM ('pending', 'generated', 'failed', 'cancelled');
    END IF;
END$$;


-- 2. Create the e_invoices table
CREATE TABLE IF NOT EXISTS public.e_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    sale_id uuid NOT NULL UNIQUE,
    merchant_id uuid NOT NULL,
    status public.e_invoice_status NOT NULL DEFAULT 'pending',
    irn text UNIQUE,
    ack_no text,
    ack_dt timestamp with time zone,
    signed_qr_code text,
    e_invoice_json jsonb,
    error_details text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT e_invoices_sale_id_fkey FOREIGN KEY (sale_id) 
    REFERENCES public.sales(id) ON DELETE CASCADE,
    
    CONSTRAINT e_invoices_merchant_id_fkey FOREIGN KEY (merchant_id) 
    REFERENCES public.merchants(id) ON DELETE CASCADE
);

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_e_invoices_sale_id ON public.e_invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_e_invoices_merchant_id ON public.e_invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_e_invoices_status ON public.e_invoices(status);
CREATE INDEX IF NOT EXISTS idx_e_invoices_irn ON public.e_invoices(irn);

-- 4. Enable Row Level Security
ALTER TABLE public.e_invoices ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
DROP POLICY IF EXISTS "Users can manage e-invoices for their own merchant" ON public.e_invoices;
CREATE POLICY "Users can manage e-invoices for their own merchant"
ON public.e_invoices
FOR ALL
USING (
  (get_my_merchant_id() = merchant_id)
);

-- 6. Add a comment on the new table
COMMENT ON TABLE public.e_invoices IS 'Stores generated e-invoice details for sales transactions.';
