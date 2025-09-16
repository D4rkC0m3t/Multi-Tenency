import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,
    release: `fertilizer-inventory@1.0.0`,
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-auth-token'];
          sensitiveHeaders.forEach(header => {
            if (event.request?.headers?.[header]) {
              event.request.headers[header] = '[REDACTED]';
            }
          });
        }
        
        // Filter sensitive URL parameters
        if (event.request.url) {
          const url = new URL(event.request.url);
          const sensitiveParams = ['token', 'password', 'secret', 'api_key'];
          
          sensitiveParams.forEach(param => {
            if (url.searchParams.has(param)) {
              url.searchParams.set(param, '[REDACTED]');
            }
          });
          
          event.request.url = url.toString();
        }
      }
      
      return event;
    },
  });
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
}

export default Sentry;
