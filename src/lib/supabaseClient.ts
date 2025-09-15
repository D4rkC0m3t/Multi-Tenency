import { createClient } from '@supabase/supabase-js';

// Debug: Log environment variables for verification
console.group('Supabase Client Initialization');

// Access environment variables in a type-safe way
const viteEnv = import.meta.env;

console.log('Environment:', viteEnv.MODE);
console.log('VITE_SUPABASE_URL:', viteEnv.VITE_SUPABASE_URL ? '***.supabase.co' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', viteEnv.VITE_SUPABASE_ANON_KEY ? '***' : 'Not set');

// Always use environment variables - no fallbacks
const supabaseUrl = (viteEnv.VITE_SUPABASE_URL || '').toString().trim();
const supabaseAnonKey = (viteEnv.VITE_SUPABASE_ANON_KEY || '').toString().trim();

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase environment variables. Please check your Vercel settings.';
  console.error('Error:', errorMessage);
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'Not set');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'Not set');
  console.groupEnd();
  throw new Error(errorMessage);
}

// Validate URL format
if (supabaseUrl.includes('supabase.com/dashboard') || !supabaseUrl.endsWith('.supabase.co')) {
  const errorMessage = `Invalid Supabase URL detected (${supabaseUrl}). Use the project URL (e.g., https://[project-ref].supabase.co), not the dashboard URL.`;
  console.error('Error:', errorMessage);
  console.groupEnd();
  throw new Error(errorMessage);
}

console.log('Using Supabase URL:', supabaseUrl);
console.groupEnd();

// Create and export the Supabase client with debugging
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: true, // Enable auth debug logging
  },
  global: {
    headers: {
      'X-Client-Info': 'fertilizer-inventory/1.0',
    },
  },
};

console.log('Creating Supabase client with options:', {
  ...clientOptions,
  auth: { ...clientOptions.auth, storage: '[Redacted]' },
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Add debug method to window for easier debugging
if (typeof window !== 'undefined') {
  // @ts-expect-error Window.__debugSupabase is intentionally added for debugging purposes without full type support
  window.__debugSupabase = {
    getConfig: () => ({
      url: supabaseUrl,
      anonKey: '***' + supabaseAnonKey?.slice(-4),
      options: clientOptions,
    }),
    clearAuth: () => {
      if (typeof window === 'undefined') return;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('sb-') || key?.includes('supabase')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('Cleared Supabase auth data from localStorage');
      return keysToRemove;
    },
  };
}
