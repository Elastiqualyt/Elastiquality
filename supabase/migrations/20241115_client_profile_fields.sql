ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS district_id UUID,
  ADD COLUMN IF NOT EXISTS municipality_id UUID,
  ADD COLUMN IF NOT EXISTS parish_id UUID,
  ADD COLUMN IF NOT EXISTS location_label TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_district_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_district_id_fkey
      FOREIGN KEY (district_id)
      REFERENCES public.pt_districts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_municipality_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_municipality_id_fkey
      FOREIGN KEY (municipality_id)
      REFERENCES public.pt_municipalities(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_parish_id_fkey'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_parish_id_fkey
      FOREIGN KEY (parish_id)
      REFERENCES public.pt_parishes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

UPDATE public.users
SET first_name = COALESCE(first_name, split_part(name, ' ', 1)),
    last_name = COALESCE(
      last_name,
      NULLIF(trim(regexp_replace(name, '^[^ ]+ ?', '')), '')
    );

