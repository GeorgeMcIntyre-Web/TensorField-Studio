import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Main.tsx executing...');

try {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element not found in DOM');

  console.log('Mounting React App...');
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React App mounted successfully.');
} catch (err) {
  console.error('Failed to mount React app:', err);
  throw err; // Re-throw to trigger window.onerror in index.html
}
