
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export { supabase };

export { isSupabaseConfigured };

export const getSupabaseStatus = () => {
  if (isSupabaseConfigured()) {
    return {
      configured: true,
      mode: 'Live Supabase Connected',
      url: import.meta.env.VITE_SUPABASE_URL,
    };
  }

  return {
    configured: false,
    mode: 'Supabase Configuration Missing',
    url: null,
    instruction: 'Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
  };
};
