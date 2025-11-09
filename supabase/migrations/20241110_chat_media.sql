CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'professional')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS display_name TEXT;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_by UUID[] DEFAULT '{}'
);

ALTER TABLE public.messages
  ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.messages
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_conversations_service_request ON public.conversations(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_media_type ON public.messages(media_type);

ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'participants can view conversations'
  ) THEN
    EXECUTE 'CREATE POLICY "participants can view conversations" ON public.conversations
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = conversations.id
          AND cp.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'service role inserts conversations'
  ) THEN
    EXECUTE 'CREATE POLICY "service role inserts conversations" ON public.conversations
      FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversation_participants' AND policyname = 'participants manage participation'
  ) THEN
    EXECUTE 'CREATE POLICY "participants manage participation" ON public.conversation_participants
      FOR SELECT USING (conversation_participants.user_id = auth.uid())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversation_participants' AND policyname = 'service role insert participants'
  ) THEN
    EXECUTE 'CREATE POLICY "service role insert participants" ON public.conversation_participants
      FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'participants read messages'
  ) THEN
    EXECUTE 'CREATE POLICY "participants read messages" ON public.messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = messages.conversation_id
          AND cp.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'participants send messages'
  ) THEN
    EXECUTE 'CREATE POLICY "participants send messages" ON public.messages
      FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = messages.conversation_id
          AND cp.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'participants update read messages'
  ) THEN
    EXECUTE 'CREATE POLICY "participants update read messages" ON public.messages
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = messages.conversation_id
          AND cp.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-uploads', 'chat-uploads', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-photos', 'service-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

