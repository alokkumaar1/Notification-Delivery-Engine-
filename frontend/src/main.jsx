import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ✅ Register Firebase service worker for push notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ Firebase service worker registered:', registration);
    })
    .catch((error) => {
      console.error('❌ Firebase service worker registration failed:', error);
    });
}

// ✅ Render the app
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
