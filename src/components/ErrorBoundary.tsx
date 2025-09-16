import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to Sentry
    Sentry.captureException(error, { extra: { errorInfo } });
    
    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 bg-red-50 text-red-800">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">
            We're sorry, but an unexpected error occurred. Our team has been notified.
          </p>
          {import.meta.env.MODE === 'development' && (
            <details className="mt-4 p-2 bg-red-100 rounded text-sm">
              <summary className="font-bold cursor-pointer">Error Details</summary>
              <pre className="mt-2 overflow-auto p-2 bg-white rounded">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ resetError }) => (
    <div className="p-4 bg-red-50 text-red-800">
      <h2 className="text-xl font-bold mb-2">An error occurred</h2>
      <p className="mb-4">
        We're sorry, but an unexpected error occurred. Our team has been notified.
      </p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={resetError}
      >
        Try again
      </button>
    </div>
  ),
});
