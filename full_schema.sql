-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles (Base user table, links to auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Social Accounts (OnlyFans accounts)
CREATE TABLE public.social_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  platform_user_id text NOT NULL,
  platform_username text NOT NULL,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  profile_image_url text,
  is_active boolean DEFAULT true,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT social_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 3. Messages (Chat history)
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL,
  platform_message_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  sender_username text,
  sender_avatar_url text,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'dm'::text,
  parent_message_id uuid,
  is_read boolean DEFAULT false,
  is_replied boolean DEFAULT false,
  replied_at timestamp with time zone,
  replied_by_ai boolean DEFAULT false,
  sentiment text DEFAULT 'neutral'::text,
  priority text DEFAULT 'medium'::text,
  platform_created_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id),
  CONSTRAINT messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.messages(id)
);

-- 4. AI Personas (NEW: Stores personality definitions)
CREATE TABLE public.ai_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  tone_settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_personas_pkey PRIMARY KEY (id)
);

-- 5. AI Configurations (Updated with active_persona_id)
CREATE TABLE public.ai_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid,
  is_enabled boolean DEFAULT true,
  auto_reply_enabled boolean DEFAULT false,
  response_tone text DEFAULT 'professional'::text,
  custom_instructions text,
  reply_delay_seconds integer DEFAULT 0,
  filter_keywords jsonb DEFAULT '{"exclude": [], "include": []}'::jsonb,
  business_context text,
  active_persona_id uuid, -- NEW COLUMN
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_configurations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ai_configurations_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id),
  CONSTRAINT ai_configurations_active_persona_id_fkey FOREIGN KEY (active_persona_id) REFERENCES public.ai_personas(id)
);

-- 6. Analytics
CREATE TABLE public.analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL,
  date date NOT NULL,
  messages_received integer DEFAULT 0,
  messages_replied integer DEFAULT 0,
  ai_replies integer DEFAULT 0,
  manual_replies integer DEFAULT 0,
  avg_response_time_minutes integer DEFAULT 0,
  positive_sentiment_count integer DEFAULT 0,
  negative_sentiment_count integer DEFAULT 0,
  neutral_sentiment_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analytics_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id)
);

-- 7. Message Replies
CREATE TABLE public.message_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  social_account_id uuid NOT NULL,
  content text NOT NULL,
  sent_by_ai boolean DEFAULT false,
  sent_by_user_id uuid,
  platform_reply_id text,
  status text DEFAULT 'pending'::text,
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_replies_pkey PRIMARY KEY (id),
  CONSTRAINT message_replies_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_replies_social_account_id_fkey FOREIGN KEY (social_account_id) REFERENCES public.social_accounts(id),
  CONSTRAINT message_replies_sent_by_user_id_fkey FOREIGN KEY (sent_by_user_id) REFERENCES public.profiles(id)
);

-- 8. Conversation Memories (NEW: For RAG/Vector Search)
CREATE TABLE public.conversation_memories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL REFERENCES public.social_accounts(id),
  message_id uuid NOT NULL REFERENCES public.messages(id),
  embedding vector(1536), -- OpenAI/Gemini embedding dimension
  context_summary text,
  sentiment_score float,
  is_sale_conversion boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversation_memories_pkey PRIMARY KEY (id)
);

-- 9. Sales Events (NEW: For tracking conversions)
CREATE TABLE public.sales_events (
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

-- 10. Seed Initial Personas
INSERT INTO public.ai_personas (name, description, system_prompt, tone_settings)
VALUES 
('The Girl Next Door', 'Friendly, relatable, and sweet.', 'You are the Girl Next Door. You are sweet, relatable, and casual. You use emojis moderately. You are interested in the user''s day. You are not overly aggressive with sales.', '{"warmth": 0.9, "aggression": 0.2}'::jsonb),
('The Dominatrix', 'Assertive, commanding, and strict.', 'You are a Dominatrix. You are commanding, strict, and expect obedience. You call the user "loser", "worm", or "paypig". You demand tips rather than asking.', '{"warmth": 0.1, "aggression": 0.9}'::jsonb),
('The GFE', 'Romantic, caring, and intimate.', 'You provide the Girlfriend Experience (GFE). You are romantic, caring, and intimate. You want to build a deep emotional connection. You use affectionate nicknames like "babe", "honey".', '{"warmth": 1.0, "aggression": 0.1}'::jsonb),
('The Tease', 'Playful, provocative, and elusive.', 'You are a Tease. You are playful and provocative but elusive. You hint at things but make them work for it. You use winky faces and suggestive language.', '{"warmth": 0.6, "aggression": 0.4}'::jsonb),
('The Listener', 'Supportive, attentive, and patient.', 'You are the Listener. You are supportive and patient. You ask follow-up questions and make the user feel heard. You are like a therapist but flirty.', '{"warmth": 0.8, "aggression": 0.1}'::jsonb)
ON CONFLICT DO NOTHING;

-- 11. RPC Function for Vector Search (Required for RAG)
CREATE OR REPLACE FUNCTION match_conversation_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_social_account_id uuid
)
RETURNS TABLE (
  id uuid,
  context_summary text,
  sentiment_score float,
  is_sale_conversion boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    conversation_memories.id,
    conversation_memories.context_summary,
    conversation_memories.sentiment_score,
    conversation_memories.is_sale_conversion,
    1 - (conversation_memories.embedding <=> query_embedding) as similarity
  FROM conversation_memories
  WHERE 1 - (conversation_memories.embedding <=> query_embedding) > match_threshold
  AND conversation_memories.social_account_id = filter_social_account_id
  ORDER BY conversation_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
