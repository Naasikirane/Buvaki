import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle benign Firebase Auth popup cancellations and assertions in sandboxed iframe environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('Pending promise was never set') ||
      reasonStr.includes('INTERNAL ASSERTION FAILED') ||
      event.reason?.code === 'auth/popup-closed-by-user' ||
      event.reason?.code === 'auth/cancelled-popup-request'
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-[#0f0f0f]">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 max-w-sm mb-6">
            An unexpected error occurred while loading this view. Click below to reload.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-full bg-[#065fd4] hover:bg-[#065fd4]/90 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

