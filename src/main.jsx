import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
createRoot(document.getElementById('root')).render(<App />);
// Cache production assets only; caching Vite's development modules is unsafe.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      const notice = document.createElement('p');
      notice.setAttribute('role', 'status');
      notice.textContent = 'Offline caching could not start. The app still works while connected.';
      document.body.append(notice);
    });
  });
}
