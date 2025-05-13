const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Important for security
      contextIsolation: true, // Important for security
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle file read operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return { success: true, data };
    } else {
      return { success: false, error: 'ENOENT: File does not exist' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
});

// Handle file write operations
ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    
    await fs.promises.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
});

// Add a handler for folder selection dialog
ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Folder for Data Storage',
      buttonLabel: 'Select Folder'
    });
    
    if (result.canceled) {
      return { success: false, canceled: true };
    }
    
    const folderPath = result.filePaths[0];
    
    // Test if folder is writable
    try {
      const testFile = path.join(folderPath, '.test-write-permission');
      await fs.promises.writeFile(testFile, 'test');
      await fs.promises.unlink(testFile);
      return { success: true, folderPath };
    } catch (error) {
      return { 
        success: false, 
        error: 'Selected folder is not writable', 
        details: error instanceof Error ? error.message : String(error) 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to select folder', 
      details: error instanceof Error ? error.message : String(error) 
    };
  }
});
