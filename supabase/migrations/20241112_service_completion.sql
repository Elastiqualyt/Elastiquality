ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

