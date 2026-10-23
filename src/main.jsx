import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
createRoot(document.getElementById('root')).render(<App />);

// Version web (GitHub Pages / iPad) : active le mode hors ligne. Ignoré dans Electron (file://) et en dev.
if (import.meta.env.PROD && location.protocol === 'https:' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
