-- Create user_credits table
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 50,
  last_refill timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
ON public.user_credits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to create initial credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, last_refill)
  VALUES (NEW.id, 50, now());
  RETURN NEW;
END;
$$;

-- Trigger to create credits when user signs up
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to refill credits (called before each operation)
CREATE OR REPLACE FUNCTION public.refill_user_credits(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
  hours_passed integer;
  credits_to_add integer;
  new_credits integer;
BEGIN
  -- Get current credits and calculate hours since last refill
  SELECT 
    credits,
    EXTRACT(EPOCH FROM (now() - last_refill)) / 3600
  INTO current_credits, hours_passed
  FROM public.user_credits
  WHERE user_id = _user_id;
  
  -- Calculate credits to add (25 per hour, max 100 cap)
  IF hours_passed >= 1 THEN
    credits_to_add := LEAST(hours_passed * 25, 100 - current_credits);
    
    IF credits_to_add > 0 THEN
      new_credits := LEAST(current_credits + credits_to_add, 100);
      
      UPDATE public.user_credits
      SET credits = new_credits,
          last_refill = now(),
          updated_at = now()
      WHERE user_id = _user_id;
      
      RETURN new_credits;
    END IF;
  END IF;
  
  RETURN current_credits;
END;
$$;