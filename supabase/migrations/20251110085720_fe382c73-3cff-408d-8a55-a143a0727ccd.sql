-- Update user credits default from 50 to 600
ALTER TABLE public.user_credits ALTER COLUMN credits SET DEFAULT 600;

-- Update the handle_new_user_credits function to give 600 credits
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, last_refill)
  VALUES (NEW.id, 600, now());
  RETURN NEW;
END;
$function$;

-- Create payment_requests table for PhonePe payments
CREATE TABLE public.payment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  credits_requested integer NOT NULL,
  transaction_id text,
  payment_screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own payment requests
CREATE POLICY "Users can create own payment requests"
ON public.payment_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own payment requests
CREATE POLICY "Users can view own payment requests"
ON public.payment_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all payment requests
CREATE POLICY "Admins can view all payment requests"
ON public.payment_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update payment requests
CREATE POLICY "Admins can update payment requests"
ON public.payment_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to add credits after payment approval
CREATE OR REPLACE FUNCTION public.approve_payment_and_add_credits(
  _payment_id uuid,
  _admin_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _credits_amount integer;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve payments';
  END IF;
  
  -- Get payment details and update status
  UPDATE public.payment_requests
  SET status = 'approved',
      approved_by = _admin_id,
      approved_at = now(),
      updated_at = now()
  WHERE id = _payment_id AND status = 'pending'
  RETURNING user_id, credits_requested INTO _user_id, _credits_amount;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;
  
  -- Add credits to user
  UPDATE public.user_credits
  SET credits = credits + _credits_amount,
      updated_at = now()
  WHERE user_id = _user_id;
END;
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();