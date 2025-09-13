-- Add missing enum values for user_role type
-- This must be in a separate migration due to PostgreSQL enum transaction safety

-- Add manager role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'manager' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'manager';
        RAISE NOTICE 'Added manager role to user_role enum';
    ELSE
        RAISE NOTICE 'Manager role already exists in user_role enum';
    END IF;
END $$;

-- Add super_admin role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'super_admin';
        RAISE NOTICE 'Added super_admin role to user_role enum';
    ELSE
        RAISE NOTICE 'Super_admin role already exists in user_role enum';
    END IF;
END $$;

COMMENT ON TYPE public.user_role IS 'User roles: admin, staff, cashier, manager, super_admin';
