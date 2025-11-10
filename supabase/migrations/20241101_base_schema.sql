-- Elastiquality Database Schema
-- Execute este script no SQL Editor do Supabase

-- Tabela de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
  district_id UUID,
  municipality_id UUID,
  parish_id UUID,
  location_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"chat": true, "leads": true, "proposals": true}'::jsonb
);

-- Tabela de profissionais (dados adicionais)
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  credits INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  portfolio TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos de serviço
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget DECIMAL(10,2),
  photos TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads (oportunidades para profissionais)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  cost INTEGER NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads desbloqueados
CREATE TABLE IF NOT EXISTS public.unlocked_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  cost INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lead_id, professional_id)
);

-- Tabela de propostas
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  estimated_duration TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_request_id, professional_id, client_id)
);

-- Tabela de pacotes de créditos
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de créditos
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'debit', 'refund')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras de créditos
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.credit_packages(id),
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para desbloquear lead
CREATE OR REPLACE FUNCTION unlock_lead(
  lead_id UUID,
  professional_id UUID,
  cost INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Verificar créditos disponíveis
  SELECT credits INTO current_credits
  FROM public.professionals
  WHERE id = professional_id;

  IF current_credits < cost THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;

  -- Verificar se já foi desbloqueado
  IF EXISTS (
    SELECT 1 FROM public.unlocked_leads
    WHERE unlocked_leads.lead_id = unlock_lead.lead_id
    AND unlocked_leads.professional_id = unlock_lead.professional_id
  ) THEN
    RAISE EXCEPTION 'Lead já foi desbloqueado';
  END IF;

  -- Debitar créditos
  UPDATE public.professionals
  SET credits = credits - cost,
      updated_at = NOW()
  WHERE id = professional_id;

  -- Registrar desbloqueio
  INSERT INTO public.unlocked_leads (lead_id, professional_id, cost)
  VALUES (lead_id, professional_id, cost);

  -- Registrar transação
  INSERT INTO public.credit_transactions (
    professional_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  )
  VALUES (
    professional_id,
    'debit',
    -cost,
    current_credits - cost,
    'Desbloqueio de lead',
    lead_id
  );
END;
$$ LANGUAGE plpgsql;

-- Inserir pacotes de créditos padrão
INSERT INTO public.credit_packages (name, credits, price, discount) VALUES
  ('Pacote Básico', 50, 90.00, 0),
  ('Pacote Premium', 100, 80.00, 20)
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para professionals
CREATE POLICY "Anyone can view professionals" ON public.professionals
  FOR SELECT USING (true);

CREATE POLICY "Professionals can update own profile" ON public.professionals
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Professionals can insert own profile" ON public.professionals
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para service_requests
CREATE POLICY "Clients can view own requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Políticas RLS para leads
CREATE POLICY "Professionals can view leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = auth.uid()
    )
  );

CREATE POLICY "Clients can create leads for own requests" ON public.leads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.service_requests
      WHERE service_requests.id = leads.service_request_id
        AND service_requests.client_id = auth.uid()
    )
  );

-- Políticas RLS para proposals
CREATE POLICY "Professionals can view own proposals" ON public.proposals
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Clients can view proposals for their requests" ON public.proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests
      WHERE service_requests.id = proposals.service_request_id
      AND service_requests.client_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can create proposals" ON public.proposals
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- Políticas RLS para reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_proposals_service_request_id ON public.proposals(service_request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_professional_id ON public.proposals(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_professional_id ON public.credit_transactions(professional_id);

-- Conversas e Mensagens
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

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_conversations_service_request ON public.conversations(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_media_type ON public.messages(media_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-uploads', 'chat-uploads', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "service role inserts conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "participants manage participation" ON public.conversation_participants
  FOR SELECT USING (conversation_participants.user_id = auth.uid());

CREATE POLICY "service role insert participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "participants read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "participants send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "participants update read messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "notifications to owner" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service role insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "users manage device tokens" ON public.device_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users insert device tokens" ON public.device_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own device tokens" ON public.device_tokens
  FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.ensure_conversation(
  p_service_request_id UUID,
  p_client_id UUID,
  p_professional_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_conversation_id UUID;
  v_client_name TEXT;
  v_professional_name TEXT;
BEGIN
  SELECT name INTO v_client_name FROM public.users WHERE id = p_client_id;
  SELECT name INTO v_professional_name FROM public.users WHERE id = p_professional_id;

  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = p_client_id
  JOIN public.conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = p_professional_id
  WHERE c.service_request_id = p_service_request_id
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    UPDATE public.conversation_participants
    SET display_name = CASE
      WHEN role = 'client' THEN COALESCE(v_client_name, display_name)
      WHEN role = 'professional' THEN COALESCE(v_professional_name, display_name)
      ELSE display_name
    END
    WHERE conversation_id = v_conversation_id;

    RETURN v_conversation_id;
  END IF;

  INSERT INTO public.conversations (service_request_id)
  VALUES (p_service_request_id)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id, role, display_name)
  VALUES
    (v_conversation_id, p_client_id, 'client', v_client_name),
    (v_conversation_id, p_professional_id, 'professional', v_professional_name)
  ON CONFLICT DO NOTHING;

  RETURN v_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE public.messages
  SET read_by = array(SELECT DISTINCT unnest(read_by || p_user_id))
  WHERE conversation_id = p_conversation_id
    AND NOT (read_by @> ARRAY[p_user_id]);
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(
  professional_id UUID,
  credits_to_add INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE public.professionals
  SET credits = credits + credits_to_add,
      updated_at = NOW()
  WHERE id = professional_id;
END;
$$;


