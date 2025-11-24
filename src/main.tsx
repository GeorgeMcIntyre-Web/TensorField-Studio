import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NOTE: CSS is loaded via index.html <style> tag and Tailwind CDN to ensure compatibility with ESM environments.
// import './styles.css'; 

console.log('main.tsx: Starting application boot...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = 'FATAL: Root element with id "root" not found in DOM.';
  console.error(msg);
  document.body.innerHTML = `<div style="color:red; padding:20px;">${msg}</div>`;
  throw new Error(msg);
}

try {
  console.log('main.tsx: Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('main.tsx: Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('main.tsx: Render scheduled successfully.');
} catch (error) {
  console.error('FATAL: Failed to mount React application:', error);
  rootElement.innerHTML = `
    <div style="color: #ef4444; padding: 20px; font-family: monospace; background: #1a0606; height: 100%;">
      <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Startup Error</h1>
      <p>The application failed to initialize.</p>
      <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message + '\n' + error.stack : String(error)}</pre>
    </div>
  `;
}