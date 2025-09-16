import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './utils/supabaseDebug';
import './lib/sentry';

// Log environment variables for debugging
console.group('Environment Variables');
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '***.supabase.co' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'Not set');
console.groupEnd();

// Add debug info to window
if (import.meta.env.DEV) {
  // @ts-expect-error Window.__ENV is intentionally added for debugging purposes without full type support
  window.__ENV = import.meta.env;
  console.log('Environment variables available at window.__ENV');
}

// Wrap the app with ErrorBoundary in production
const Root = () => (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

// Create root and render
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<Root />);

// Log the first render
console.log('Application mounted at:', new Date().toISOString());
