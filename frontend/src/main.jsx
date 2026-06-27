import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { QueryProvider } from './providers/QueryProvider';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'white', color: '#1c1917', border: '1px solid #e7e5e4' },
            className: 'rounded-lg',
          }}
          richColors
        />
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);
