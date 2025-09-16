import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WixDesignSystemProvider } from '@wix/design-system';
import App from './App';
import { store } from './store/store';
import './index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WixDesignSystemProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WixDesignSystemProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);