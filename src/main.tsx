import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loading...');
console.log('Root element found:', !!document.getElementById("root"));

try {
  createRoot(document.getElementById("root")!).render(
    <App />
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">App failed to load: ${error.message}</div>`;
}
