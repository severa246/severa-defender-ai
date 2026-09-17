// Severa AI Security Platform - Supabase Cloud Client Helper
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rmwbfximqdtfuhzuvslf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Ts0kIOCszVEEw9YARdq2tA_wQY05miM';

let client = null;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.warn("Supabase client init suppressed:", e);
}

export const supabase = client || {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};
