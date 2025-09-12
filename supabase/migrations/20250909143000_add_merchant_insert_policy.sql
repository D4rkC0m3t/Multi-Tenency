-- Add missing INSERT policy for merchants table
-- This allows authenticated users to create new merchants

CREATE POLICY "Users can create merchants" 
ON public.merchants 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND owner_id = auth.uid()
);
