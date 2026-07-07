import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import './index.css';
import App from './App.jsx';

// Global default so no request (login, meeting validation, ICE server
// fetch) can hang indefinitely on a stalled connection and leave the UI
// stuck on a loading state forever.
axios.defaults.timeout = 10_000;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
