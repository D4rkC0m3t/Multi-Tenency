import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_DSN = process.env.VITE_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [new BrowserTracing()],
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,
    release: `fertilizer-inventory@${process.env.npm_package_version}`,
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-auth-token'];
          sensitiveHeaders.forEach(header => {
            if (event.request?.headers[header]) {
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
