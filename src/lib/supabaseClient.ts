import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your Vercel project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fdukxfwdlwskznyiezgr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdWt4ZndkbHdza2p6bnlpZXpnciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk0NzMxOTQzLCJleHAiOjIwMTAzMDc5NDN9.0m2n0pYH3qk5Q7X9ZQ2q3QKq3QKq3QKq3QKq3QKq3QKq3QKq3QKq3Q';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
