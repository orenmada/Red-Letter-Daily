import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

try {
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application failed to mount:", error);
  // Render error to screen so it's visible even if console is closed
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        font-family: sans-serif; 
        color: #8E1600; 
        background-color: #FDFBF7; 
        text-align: center;
        padding: 20px;
      ">
        <h2 style="font-size: 24px; margin-bottom: 10px;">Something went wrong</h2>
        <p style="color: #2C2C2C;">The application could not be loaded.</p>
        <pre style="
          margin-top: 20px; 
          padding: 15px; 
          background: #eee; 
          border-radius: 8px; 
          font-size: 12px; 
          color: #333; 
          max-width: 100%; 
          overflow-x: auto;
        ">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}