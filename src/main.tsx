
import { createRoot } from 'react-dom/client'
import OfflineApp from './OfflineApp.tsx'
import './index.css'

// Initialize the app regardless of whether we're in Electron or browser
createRoot(document.getElementById("root")!).render(<OfflineApp />);
