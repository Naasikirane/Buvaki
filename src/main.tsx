import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

