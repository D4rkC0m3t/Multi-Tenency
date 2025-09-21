import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // This ensures environment variables are loaded during build
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['@react-pdf/renderer']
    },
    
    // Ensure environment variables are properly replaced during build
    // Define global constants to replace problematic code
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Define global to avoid lottie-web eval issues
      'global': 'globalThis',
    },
    
    // Additional build optimizations
build: {
      sourcemap: true,
      minify: 'terser',
      chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            three: ['three'],
            mui: ['@mui/material', '@mui/icons-material'],
            pdf: ['@react-pdf/renderer'],
            charts: ['recharts'],
            animations: ['framer-motion', 'lottie-react'],
          },
        },
      },
    },
  };
});
