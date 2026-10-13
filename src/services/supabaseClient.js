// Severa AI Security Platform - Supabase Cloud Client Helper
import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://rmwbfximqdtfuhzuvslf.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtd2JmeGltcWR0ZnVoenV2c2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTk4OTQsImV4cCI6MjEwNDYzNTg5NH0.HtBbJdPT_GQglYTg-_OhNRtcMfLqwDBUoHrGEWTZ-Pc';

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
