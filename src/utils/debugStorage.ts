// Debug utility to check browser storage for Supabase configuration
export function debugSupabaseStorage() {
  if (typeof window === 'undefined') {
    console.log('Not running in a browser environment');
    return;
  }

  console.group('Supabase Storage Debug');
  
  // Check localStorage
  console.log('--- localStorage ---');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('supabase')) {
      console.log(`${key}:`, localStorage.getItem(key));
    }
  }

  // Check sessionStorage
  console.log('--- sessionStorage ---');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.includes('supabase')) {
      console.log(`${key}:`, sessionStorage.getItem(key));
    }
  }

  // Check cookies
  console.log('--- Cookies ---');
  document.cookie.split(';').forEach(cookie => {
    if (cookie.includes('sb-')) {
      console.log(cookie.trim());
    }
  });

  console.groupEnd();
}

// Function to clear Supabase auth data
export function clearSupabaseAuth() {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
    }
  });

  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  console.log('Supabase auth data cleared from browser storage');
}
