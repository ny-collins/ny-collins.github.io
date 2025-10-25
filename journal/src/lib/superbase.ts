import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Journal = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  entry_type: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
};