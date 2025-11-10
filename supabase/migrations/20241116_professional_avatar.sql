ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-images', 'avatar-images', true)
ON CONFLICT (id) DO NOTHING;

