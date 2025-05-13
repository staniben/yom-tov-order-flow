
const { spawn } = require('child_process');
const path = require('path');

// Start the Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for Vite to start
setTimeout(() => {
  // Start Electron
  const electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:5173'
    }
  });

  // Handle Electron exit
  electronProcess.on('close', (code) => {
    vite.kill();
    process.exit(code);
  });
}, 5000); // Give Vite 5 seconds to start up
