/**
 * Debugging utilities for Supabase client
 * 
 * Usage:
 * 1. In browser console: `window.__debugSupabase`
 * 2. Or import and use the functions directly
 */

import { supabase } from '../lib/supabase';

/**
 * Clear all Supabase-related data from browser storage
 */
export function clearSupabaseAuth() {
  if (typeof window === 'undefined') {
    console.warn('Not running in a browser environment');
    return [];
  }

  const clearedKeys: string[] = [];
  
  // Clear localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('sb-') || key?.includes('supabase')) {
      localStorage.removeItem(key);
      clearedKeys.push(`localStorage:${key}`);
    }
  }

  // Clear sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.includes('sb-') || key?.includes('supabase')) {
      sessionStorage.removeItem(key);
      clearedKeys.push(`sessionStorage:${key}`);
    }
  }

  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      clearedKeys.push(`cookie:${name}`);
    }
  });

  console.log('Cleared Supabase auth data:', clearedKeys);
  return clearedKeys;
}

/**
 * Get the current Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-4) : 'Not set',
    env: import.meta.env.MODE,
  };
}

// Add to window for easy debugging in browser console
if (typeof window !== 'undefined') {
  // @ts-expect-error Window.__debugSupabase is intentionally added for debugging purposes without full type support
  window.__debugSupabase = {
    clearAuth: clearSupabaseAuth,
    getConfig: getSupabaseConfig,
    // @ts-expect-error Window.__debugSupabase.client is intentionally exposed for debugging
    client: supabase,
  };
  
  console.log('Supabase debug tools available at window.__debugSupabase');
}
