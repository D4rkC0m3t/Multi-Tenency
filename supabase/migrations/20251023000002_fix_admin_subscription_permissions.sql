-- Fix admin permissions for managing user subscriptions
-- This allows admin users to create, update, and manage subscriptions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;

-- Create comprehensive admin policies
CREATE POLICY "Admins can manage all subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (
        -- Allow service role
        auth.jwt()->>'role' = 'service_role'
        OR
        -- Allow authenticated admin users
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    )
    WITH CHECK (
        -- Allow service role
        auth.jwt()->>'role' = 'service_role'
        OR
        -- Allow authenticated admin users
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    );

-- Also update payment_submissions policies for consistency
DROP POLICY IF EXISTS "Service role can manage all payments" ON public.payment_submissions;

CREATE POLICY "Admins can manage all payments"
    ON public.payment_submissions FOR ALL
    USING (
        auth.jwt()->>'role' = 'service_role'
        OR
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    )
    WITH CHECK (
        auth.jwt()->>'role' = 'service_role'
        OR
        (
            auth.uid() IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
    );

-- Add comment for documentation
COMMENT ON POLICY "Admins can manage all subscriptions" ON public.user_subscriptions IS 
  'Allows admin users and service role to create, update, and delete subscriptions';

COMMENT ON POLICY "Admins can manage all payments" ON public.payment_submissions IS 
  'Allows admin users and service role to manage payment submissions';
