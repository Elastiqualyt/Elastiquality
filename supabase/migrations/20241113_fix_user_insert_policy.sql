DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own profile" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'professionals'
      AND policyname = 'Professionals can insert own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Professionals can insert own profile" ON public.professionals
      FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END $$;

GRANT INSERT ON public.users TO authenticated;
GRANT INSERT ON public.professionals TO authenticated;

