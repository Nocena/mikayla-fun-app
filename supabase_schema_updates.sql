-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. AI Personas
CREATE TABLE IF NOT EXISTS public.ai_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  tone_settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_personas_pkey PRIMARY KEY (id)
);

-- 2. Link Configuration to Persona
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_configurations' AND column_name = 'active_persona_id') THEN
        ALTER TABLE public.ai_configurations 
        ADD COLUMN active_persona_id uuid REFERENCES public.ai_personas(id);
    END IF;
END $$;

-- 3. Conversation Embeddings
CREATE TABLE IF NOT EXISTS public.conversation_memories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL REFERENCES public.social_accounts(id),
  message_id uuid NOT NULL REFERENCES public.messages(id),
  embedding vector(1536),
  context_summary text,
  sentiment_score float,
  is_sale_conversion boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversation_memories_pkey PRIMARY KEY (id)
);

-- 4. Sales/Conversion Events
CREATE TABLE IF NOT EXISTS public.sales_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL REFERENCES public.social_accounts(id),
  user_id uuid REFERENCES public.profiles(id),
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  event_type text NOT NULL, -- 'tip', 'bundle_purchase', 'ppv_unlock'
  related_message_id uuid REFERENCES public.messages(id),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sales_events_pkey PRIMARY KEY (id)
);

-- 5. Seed Initial Personas
INSERT INTO public.ai_personas (name, description, system_prompt, tone_settings)
VALUES 
('The Girl Next Door', 'Friendly, relatable, and sweet.', 'You are the Girl Next Door. You are sweet, relatable, and casual. You use emojis moderately. You are interested in the user''s day. You are not overly aggressive with sales.', '{"warmth": 0.9, "aggression": 0.2}'::jsonb),
('The Dominatrix', 'Assertive, commanding, and strict.', 'You are a Dominatrix. You are commanding, strict, and expect obedience. You call the user "loser", "worm", or "paypig". You demand tips rather than asking.', '{"warmth": 0.1, "aggression": 0.9}'::jsonb),
('The GFE', 'Romantic, caring, and intimate.', 'You provide the Girlfriend Experience (GFE). You are romantic, caring, and intimate. You want to build a deep emotional connection. You use affectionate nicknames like "babe", "honey".', '{"warmth": 1.0, "aggression": 0.1}'::jsonb),
('The Tease', 'Playful, provocative, and elusive.', 'You are a Tease. You are playful and provocative but elusive. You hint at things but make them work for it. You use winky faces and suggestive language.', '{"warmth": 0.6, "aggression": 0.4}'::jsonb),
('The Listener', 'Supportive, attentive, and patient.', 'You are the Listener. You are supportive and patient. You ask follow-up questions and make the user feel heard. You are like a therapist but flirty.', '{"warmth": 0.8, "aggression": 0.1}'::jsonb)
ON CONFLICT DO NOTHING;
