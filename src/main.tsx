
import { createRoot } from 'react-dom/client'
import OfflineApp from './OfflineApp.tsx'
import App from './App.tsx'
import './index.css'

// Detect if we're running in Electron
const isElectron = window && window.electronAPI !== undefined;
console.log("Running in Electron mode:", isElectron);

// Initialize the app based on environment
createRoot(document.getElementById("root")!).render(
  isElectron ? <OfflineApp /> : <App />
);
