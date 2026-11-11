
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing!');
}

if (!supabaseUrl.startsWith('https://') &&
    !supabaseUrl.startsWith('http://')) {
  throw new Error('Invalid Supabase URL. Check VITE_SUPABASE_URL.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseKey);
