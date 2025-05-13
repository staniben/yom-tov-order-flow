
const { contextBridge, ipcRenderer } = require('electron');

// Expose file system operations to the renderer process
contextBridge.exposeInMainWorld('electron', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  isElectron: () => true // Allows the renderer to detect it's running in Electron
});
