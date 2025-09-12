/*
# [Comprehensive Schema Update and Refinement]
This migration script completely overhauls the database schema based on best practices. It introduces ENUM types for data consistency, enforces tenant isolation with cascading deletes, adds critical performance indexes, ensures invoice uniqueness, and implements automated triggers for updating timestamps and managing stock levels accurately.

## Query Description: [DANGER: This script will first DROP all existing application tables (merchants, products, sales, etc.) to recreate them with the corrected structure. All current data in these tables will be permanently deleted. This is necessary to apply fundamental changes like ENUM types and corrected foreign key constraints. It is highly recommended to back up any critical data before applying this migration.]

## Metadata:
- Schema-Category: ["Dangerous", "Structural"]
- Impact-Level: ["High"]
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Tables Dropped:** notifications, stock_movements, inventory_adjustments, sale_items, sales, purchase_items, purchases, suppliers, customers, products, categories, profiles, merchants.
- **Types Created:** product_status, user_role, payment_method, transaction_type.
- **Tables Re-created:** All dropped tables with improved constraints.
- **Indexes Added:** On merchant_id for all primary tables, product_id for stock, and user_id for notifications.
- **Constraints Added:** ON DELETE CASCADE for tenant isolation, UNIQUE constraints for invoice numbers.
- **Functions Created:** set_updated_at(), update_product_stock_from_movement().
- **Triggers Created:** To auto-update `updated_at` fields and to manage `products.current_stock` from the `stock_movements` table.

## Security Implications:
- RLS Status: RLS is enabled on tables as before.
- Policy Changes: No. Policies will need to be re-applied if they were dropped.
- Auth Requirements: Relies on `auth.users` for user profiles.

## Performance Impact:
- Indexes: Adds several new indexes on foreign keys and frequently queried columns, which will significantly improve query performance for filtering by merchant, product, and user.
- Triggers: Adds triggers for data integrity. The performance impact is minimal but ensures data is always consistent.
*/

-- Step 1: Drop existing tables in reverse order of dependency to avoid FK errors.
DROP TABLE IF EXISTS "public"."notifications";
DROP TABLE IF EXISTS "public"."stock_movements";
DROP TABLE IF EXISTS "public"."inventory_adjustments";
DROP TABLE IF EXISTS "public"."sale_items";
DROP TABLE IF EXISTS "public"."sales";
DROP TABLE IF EXISTS "public"."purchase_items";
DROP TABLE IF EXISTS "public"."purchases";
DROP TABLE IF EXISTS "public"."suppliers";
DROP TABLE IF EXISTS "public"."customers";
DROP TABLE IF EXISTS "public"."products";
DROP TABLE IF EXISTS "public"."categories";
DROP TABLE IF EXISTS "public"."profiles";
DROP TABLE IF EXISTS "public"."merchants";

-- Step 2: Drop existing ENUM types if they exist, to prevent errors on re-run.
DROP TYPE IF EXISTS "public"."product_status";
DROP TYPE IF EXISTS "public"."user_role";
DROP TYPE IF EXISTS "public"."payment_method";
DROP TYPE IF EXISTS "public"."transaction_type";

-- Step 3: Create ENUM types for consistency and validation.
CREATE TYPE "public"."product_status" AS ENUM ('active', 'inactive', 'discontinued');
CREATE TYPE "public"."user_role" AS ENUM ('admin', 'staff', 'cashier');
CREATE TYPE "public"."payment_method" AS ENUM ('cash', 'credit', 'upi', 'bank_transfer');
CREATE TYPE "public"."transaction_type" AS ENUM ('purchase', 'sale', 'adjustment');

-- Step 4: Create the `set_updated_at` function for audit triggers.
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create tables in the correct order of dependency.

-- Merchants Table
CREATE TABLE "public"."merchants" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "name" varchar NOT NULL,
    "business_type" varchar,
    "address" text,
    "phone" varchar,
    "email" varchar,
    "gst_number" varchar,
    "license_number" varchar,
    "is_active" boolean NOT NULL DEFAULT true,
    "settings" jsonb,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."merchants" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_merchants_timestamp BEFORE UPDATE ON "public"."merchants" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Profiles Table (linking to Supabase Auth)
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "merchant_id" uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
    "full_name" text,
    "phone" varchar,
    "role" user_role NOT NULL DEFAULT 'staff',
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Categories Table
CREATE TABLE "public"."categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "name" varchar NOT NULL,
    "description" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Products Table
CREATE TABLE "public"."products" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "category_id" uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    "name" varchar NOT NULL,
    "sku" varchar,
    "fertilizer_type" varchar,
    "brand" varchar,
    "unit" varchar NOT NULL,
    "cost_price" numeric(10, 2) NOT NULL DEFAULT 0,
    "sale_price" numeric(10, 2) NOT NULL DEFAULT 0,
    "current_stock" numeric(10, 2) NOT NULL DEFAULT 0,
    "minimum_stock" numeric(10, 2) NOT NULL DEFAULT 0,
    "maximum_stock" numeric(10, 2),
    "batch_number" varchar,
    "expiry_date" date,
    "manufacturing_date" date,
    "status" product_status NOT NULL DEFAULT 'active',
    "description" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Customers Table
CREATE TABLE "public"."customers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "name" varchar NOT NULL,
    "customer_type" varchar NOT NULL,
    "phone" varchar,
    "email" varchar,
    "address" text,
    "village" varchar,
    "district" varchar,
    "state" varchar,
    "pincode" varchar,
    "credit_limit" numeric(10, 2) NOT NULL DEFAULT 0,
    "outstanding_balance" numeric(10, 2) NOT NULL DEFAULT 0,
    "is_active" boolean NOT NULL DEFAULT true,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT chk_customer_type CHECK (customer_type IN ('farmer', 'retailer', 'wholesaler', 'distributor', 'individual', 'other'))
);
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Suppliers Table
CREATE TABLE "public"."suppliers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "name" varchar NOT NULL,
    "company_name" varchar,
    "phone" varchar,
    "email" varchar,
    "address" text,
    "city" varchar,
    "state" varchar,
    "pincode" varchar,
    "gst_number" varchar,
    "contact_person" varchar,
    "payment_terms" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "notes" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_suppliers_timestamp BEFORE UPDATE ON "public"."suppliers" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purchases Table
CREATE TABLE "public"."purchases" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "supplier_id" uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
    "invoice_number" varchar NOT NULL,
    "purchase_date" date NOT NULL,
    "subtotal" numeric(10, 2) NOT NULL,
    "tax_amount" numeric(10, 2) DEFAULT 0,
    "discount_amount" numeric(10, 2) DEFAULT 0,
    "total_amount" numeric(10, 2) NOT NULL,
    "payment_method" payment_method,
    "payment_status" varchar NOT NULL DEFAULT 'pending',
    "notes" text,
    "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT purchases_invoice_unique UNIQUE (merchant_id, invoice_number)
);
ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_purchases_timestamp BEFORE UPDATE ON "public"."purchases" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Purchase Items Table
CREATE TABLE "public"."purchase_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "purchase_id" uuid NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id),
    "quantity" numeric(10, 2) NOT NULL,
    "unit_price" numeric(10, 2) NOT NULL,
    "total_price" numeric(10, 2) NOT NULL,
    "batch_number" varchar,
    "expiry_date" date,
    "manufacturing_date" date,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."purchase_items" ENABLE ROW LEVEL SECURITY;

-- Sales Table
CREATE TABLE "public"."sales" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "customer_id" uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    "invoice_number" varchar NOT NULL,
    "sale_date" date NOT NULL,
    "subtotal" numeric(10, 2) NOT NULL,
    "tax_amount" numeric(10, 2) DEFAULT 0,
    "discount_amount" numeric(10, 2) DEFAULT 0,
    "total_amount" numeric(10, 2) NOT NULL,
    "payment_method" payment_method,
    "payment_status" varchar NOT NULL DEFAULT 'pending',
    "notes" text,
    "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT sales_invoice_unique UNIQUE (merchant_id, invoice_number)
);
ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_sales_timestamp BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sale Items Table
CREATE TABLE "public"."sale_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "sale_id" uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id),
    "quantity" numeric(10, 2) NOT NULL,
    "unit_price" numeric(10, 2) NOT NULL,
    "total_price" numeric(10, 2) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."sale_items" ENABLE ROW LEVEL SECURITY;

-- Inventory Adjustments Table
CREATE TABLE "public"."inventory_adjustments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id),
    "adjustment_date" date NOT NULL,
    "quantity" numeric(10, 2) NOT NULL,
    "reason" text,
    "notes" text,
    "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."inventory_adjustments" ENABLE ROW LEVEL SECURITY;

-- Stock Movements Table (Source of Truth for Stock)
CREATE TABLE "public"."stock_movements" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id),
    "transaction_type" transaction_type NOT NULL,
    "transaction_id" uuid, -- e.g., sale_id, purchase_id, adjustment_id
    "quantity_change" numeric(10, 2) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;

-- Notifications Table
CREATE TABLE "public"."notifications" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "merchant_id" uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    "title" varchar NOT NULL,
    "message" text NOT NULL,
    "is_read" boolean NOT NULL DEFAULT false,
    "type" varchar,
    "link" varchar,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Step 6: Create function and trigger for automatic stock management.
CREATE OR REPLACE FUNCTION "public"."update_product_stock_from_movement"()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET current_stock = current_stock + NEW.quantity_change
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_movement_trigger
AFTER INSERT ON "public"."stock_movements"
FOR EACH ROW EXECUTE FUNCTION "public"."update_product_stock_from_movement"();

-- Step 7: Create indexes for performance.
CREATE INDEX idx_products_merchant ON "public"."products"(merchant_id);
CREATE INDEX idx_sales_merchant ON "public"."sales"(merchant_id);
CREATE INDEX idx_purchases_merchant ON "public"."purchases"(merchant_id);
CREATE INDEX idx_customers_merchant ON "public"."customers"(merchant_id);
CREATE INDEX idx_suppliers_merchant ON "public"."suppliers"(merchant_id);
CREATE INDEX idx_stock_movements_product ON "public"."stock_movements"(product_id);
CREATE INDEX idx_notifications_user ON "public"."notifications"(user_id);

-- Step 8: Re-grant permissions (standard for Supabase).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
