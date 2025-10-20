-- Fix security issue: Restrict profiles access to own profile only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a restrictive policy: users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Keep the existing policies for insert and update (they are already secure)
-- Users can insert their own profile: already exists
-- Users can update their own profile: already exists