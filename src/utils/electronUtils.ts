
/**
 * Checks if the app is running in an Electron environment
 */
export const isElectronEnvironment = (): boolean => {
  return window && window.electronAPI !== undefined;
};

/**
 * Safely access Electron API functions
 * @param fn The function name to call
 * @param args Arguments to pass to the function
 * @returns Promise with the result or null if not in Electron
 */
export const callElectronAPI = async <T>(
  fn: keyof Window['electronAPI'], 
  ...args: any[]
): Promise<T | null> => {
  if (isElectronEnvironment() && window.electronAPI && window.electronAPI[fn]) {
    try {
      return await (window.electronAPI[fn] as (...args: any[]) => Promise<T>)(...args);
    } catch (error) {
      console.error(`Error calling Electron API function ${String(fn)}:`, error);
      return null;
    }
  }
  console.warn(`Attempted to call Electron API function ${String(fn)} in non-Electron environment`);
  return null;
};
