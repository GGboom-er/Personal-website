import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import './styles/timeline.css';
import './styles/glass.css';

// BOOT PROBE
console.log('Script loaded!');
// alert('System Booting...'); // Uncomment if console is not visible

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error("CRITICAL: Could not find root element!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React Mount Initiated');
} catch (e) {
  console.error('React Mount Failed:', e);
}