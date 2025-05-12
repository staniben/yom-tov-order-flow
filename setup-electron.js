
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Electron environment...');

// Make sure electron-related dependencies are installed
console.log('Installing required dependencies...');
try {
  execSync('npm install --save-dev electron-is-dev@3.0.1 wait-on@7.0.1 concurrently@8.2.2 cross-env@7.0.3', { stdio: 'inherit' });
  console.log('Dependencies installed successfully.');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}

// Run the update scripts
console.log('Updating package.json...');
try {
  require('./electron/update-package.js');
  console.log('Package.json updated successfully.');
} catch (error) {
  console.error('Failed to update package.json:', error.message);
  process.exit(1);
}

console.log('Updating vite.config.ts...');
try {
  require('./electron/update-vite-config.js');
  console.log('Vite config updated successfully.');
} catch (error) {
  console.error('Failed to update vite.config.ts:', error.message);
  process.exit(1);
}

console.log('Electron setup complete! You can now run:');
console.log('npm run electron:dev - to start the app in development mode');
console.log('npm run electron:build - to build the app for production');
