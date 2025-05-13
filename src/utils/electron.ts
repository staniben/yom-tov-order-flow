
/**
 * Checks if the application is running in an Electron environment
 * @returns boolean indicating whether the app is running in Electron
 */
export function isElectron(): boolean {
  // Check if window.electron exists (would be exposed by our preload script)
  if (window.electron?.isElectron) {
    return true;
  }
  
  // Additional checks for Electron environment
  // Check for process
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
}

/**
 * Safely access Electron APIs with proper type checking and fallbacks
 */
export const electronAPI = {
  /**
   * Reads a file from the file system
   */
  readFile: async (filePath: string): Promise<{ success: boolean; data?: string; error?: string }> => {
    if (window.electron?.readFile) {
      return await window.electron.readFile(filePath);
    }
    return { success: false, error: 'Electron API not available' };
  },
  
  /**
   * Writes data to a file in the file system
   */
  writeFile: async (filePath: string, data: string): Promise<{ success: boolean; error?: string }> => {
    if (window.electron?.writeFile) {
      return await window.electron.writeFile(filePath, data);
    }
    return { success: false, error: 'Electron API not available' };
  },
  
  /**
   * Opens a folder selection dialog
   */
  selectFolder: async (): Promise<{ 
    success: boolean; 
    folderPath?: string; 
    canceled?: boolean; 
    error?: string; 
    details?: string 
  }> => {
    if (window.electron?.selectFolder) {
      return await window.electron.selectFolder();
    }
    return { success: false, error: 'Electron API not available' };
  }
};
