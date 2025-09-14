import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './utils/supabaseDebug';

// Log environment variables for debugging
console.group('Environment Variables');
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '***.supabase.co' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'Not set');
console.groupEnd();

// Add debug info to window
if (import.meta.env.DEV) {
  // @ts-ignore
  window.__ENV = import.meta.env;
  console.log('Environment variables available at window.__ENV');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
);
