const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true, // For security reasons
      preload: path.join(__dirname, 'preload.js') // Bridge between renderer and main process
    }
  });

  // Load the index.html from a URL in development or the local file in production
  const startUrl = isDev 
    ? 'http://localhost:5173' // Vite dev server default port
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create the browser window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// File system operations exposed to renderer process
ipcMain.handle('check-path-exists', async (event, path) => {
  try {
    await fs.promises.access(path, fs.constants.R_OK | fs.constants.W_OK);
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    // Ensure directory exists
    const directory = path.dirname(filePath);
    await fs.promises.mkdir(directory, { recursive: true });
    
    await fs.promises.writeFile(filePath, data, 'utf8');
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return { path: null };
  }
  
  return { path: result.filePaths[0] };
});
