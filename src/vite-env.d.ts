
/// <reference types="vite/client" />

// Electron API types for TypeScript
interface ElectronAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  selectFolder: () => Promise<{ 
    success: boolean; 
    folderPath?: string; 
    canceled?: boolean; 
    error?: string; 
    details?: string 
  }>;
  isElectron: () => boolean;
}

// Extend the Window interface
interface Window {
  electron?: ElectronAPI;
}
