ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    DEFAULT '{"chat": true, "leads": true, "proposals": true}'::jsonb;

UPDATE public.users
SET notification_preferences = COALESCE(
  notification_preferences,
  '{"chat": true, "leads": true, "proposals": true}'::jsonb
);

