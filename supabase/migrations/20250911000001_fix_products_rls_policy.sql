-- Fix RLS policy for products table to allow INSERT operations
-- This addresses the "new row violates row-level security policy" error

-- First, let's check if the get_my_merchant_id function is working correctly
-- and create a more robust version if needed

-- Drop existing policies for products table
DROP POLICY IF EXISTS "Users can access data within their own merchant" ON public.products;

-- Create separate policies for different operations to better handle INSERT
CREATE POLICY "Users can view products within their own merchant" 
ON public.products FOR SELECT 
USING (merchant_id = public.get_my_merchant_id());

CREATE POLICY "Users can insert products within their own merchant" 
ON public.products FOR INSERT 
WITH CHECK (merchant_id = public.get_my_merchant_id());

CREATE POLICY "Users can update products within their own merchant" 
ON public.products FOR UPDATE 
USING (merchant_id = public.get_my_merchant_id())
WITH CHECK (merchant_id = public.get_my_merchant_id());

CREATE POLICY "Users can delete products within their own merchant" 
ON public.products FOR DELETE 
USING (merchant_id = public.get_my_merchant_id());

-- Also create a more robust version of get_my_merchant_id function
-- that handles edge cases better
CREATE OR REPLACE FUNCTION public.get_my_merchant_id()
RETURNS UUID AS $$
DECLARE
    merchant_id UUID;
    user_id UUID;
BEGIN
    -- Get the current user ID
    user_id := auth.uid();
    
    -- Return NULL if no user is authenticated
    IF user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get merchant_id from profiles table
    SELECT p.merchant_id INTO merchant_id
    FROM public.profiles p
    WHERE p.id = user_id;
    
    -- If no profile exists, return NULL
    IF merchant_id IS NULL THEN
        RAISE NOTICE 'No merchant_id found for user %', user_id;
        RETURN NULL;
    END IF;
    
    RETURN merchant_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in get_my_merchant_id: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_my_merchant_id() TO authenticated;

-- Ensure RLS is enabled on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add helpful function to debug RLS issues
CREATE OR REPLACE FUNCTION public.debug_user_merchant_info()
RETURNS TABLE(
    current_user_id UUID,
    merchant_id UUID,
    profile_exists BOOLEAN,
    merchant_exists BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        p.merchant_id,
        (p.id IS NOT NULL) as profile_exists,
        (m.id IS NOT NULL) as merchant_exists
    FROM public.profiles p
    LEFT JOIN public.merchants m ON m.id = p.merchant_id
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.debug_user_merchant_info() TO authenticated;
