import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

describe('App Entrypoint', () => {
  let container: HTMLDivElement | null = null;
  let root: ReactDOM.Root | null = null;

  afterEach(() => {
    try {
      if (root) root.unmount();
    } catch (e) {
        // ignore
    }
    if (container) {
      container.remove();
      container = null;
    }
    root = null;
  });

  it('mounts without crashing', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    expect(() => {
        root = ReactDOM.createRoot(container!);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }).not.toThrow();
  });
});