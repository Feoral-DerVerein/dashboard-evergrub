-- Create table for storing pickup schedules
CREATE TABLE public.pickup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  enabled BOOLEAN NOT NULL DEFAULT false,
  collections INTEGER NOT NULL DEFAULT 1,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- Create table for special date overrides
CREATE TABLE public.pickup_special_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  collections INTEGER NOT NULL DEFAULT 1,
  start_time TIME,
  end_time TIME,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.pickup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_special_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for pickup_schedules
CREATE POLICY "Users can view their own pickup schedules" 
ON public.pickup_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pickup schedules" 
ON public.pickup_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pickup schedules" 
ON public.pickup_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pickup schedules" 
ON public.pickup_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for pickup_special_dates
CREATE POLICY "Users can view their own special dates" 
ON public.pickup_special_dates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own special dates" 
ON public.pickup_special_dates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own special dates" 
ON public.pickup_special_dates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own special dates" 
ON public.pickup_special_dates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_pickup_schedules_updated_at
BEFORE UPDATE ON public.pickup_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get pickup times for a specific date
CREATE OR REPLACE FUNCTION public.get_pickup_availability(p_user_id UUID, p_date DATE)
RETURNS TABLE(
  is_available BOOLEAN,
  collections INTEGER,
  start_time TIME,
  end_time TIME,
  is_special_date BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_special_date RECORD;
  v_regular_schedule RECORD;
BEGIN
  -- Get day of week (0 = Sunday, 1 = Monday, etc.)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Check for special date override first
  SELECT * INTO v_special_date
  FROM pickup_special_dates
  WHERE user_id = p_user_id AND date = p_date;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_special_date.enabled,
      v_special_date.collections,
      v_special_date.start_time,
      v_special_date.end_time,
      true;
    RETURN;
  END IF;
  
  -- Check regular schedule
  SELECT * INTO v_regular_schedule
  FROM pickup_schedules
  WHERE user_id = p_user_id AND day_of_week = v_day_of_week;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_regular_schedule.enabled,
      v_regular_schedule.collections,
      v_regular_schedule.start_time,
      v_regular_schedule.end_time,
      false;
  ELSE
    RETURN QUERY SELECT 
      false,
      0,
      NULL::TIME,
      NULL::TIME,
      false;
  END IF;
END;
$$;