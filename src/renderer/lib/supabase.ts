import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialAccount = {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string;
  profile_image_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  social_account_id: string;
  platform_message_id: string;
  sender_id: string;
  sender_name: string;
  sender_username: string | null;
  sender_avatar_url: string | null;
  content: string;
  message_type: 'dm' | 'comment' | 'mention' | 'reply';
  parent_message_id: string | null;
  is_read: boolean;
  is_replied: boolean;
  replied_at: string | null;
  replied_by_ai: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'high' | 'medium' | 'low';
  platform_created_at: string;
  created_at: string;
  updated_at: string;
};

export type MessageReply = {
  id: string;
  message_id: string;
  social_account_id: string;
  content: string;
  sent_by_ai: boolean;
  sent_by_user_id: string | null;
  platform_reply_id: string | null;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

export type AIConfiguration = {
  id: string;
  user_id: string;
  social_account_id: string | null;
  is_enabled: boolean;
  auto_reply_enabled: boolean;
  response_tone: 'professional' | 'friendly' | 'casual' | 'custom';
  custom_instructions: string | null;
  reply_delay_seconds: number;
  filter_keywords: {
    include: string[];
    exclude: string[];
  };
  business_context: string | null;
  created_at: string;
  updated_at: string;
};

export type Analytics = {
  id: string;
  social_account_id: string;
  date: string;
  messages_received: number;
  messages_replied: number;
  ai_replies: number;
  manual_replies: number;
  avg_response_time_minutes: number;
  positive_sentiment_count: number;
  negative_sentiment_count: number;
  neutral_sentiment_count: number;
  created_at: string;
};
