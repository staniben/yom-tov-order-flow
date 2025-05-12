
// This script will be run by the build process to update package.json
const fs = require('fs');
const path = require('path');

try {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = require(packageJsonPath);
  
  // Add Electron-specific scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "electron:dev": "concurrently \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:5173 && electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:start": "electron electron/main.js"
  };
  
  // Add Electron build configuration
  packageJson.build = {
    "appId": "com.lovable.offlineapp",
    "productName": "Work Orders Manager",
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "directories": {
      "buildResources": "assets",
      "output": "electron-dist"
    },
    "mac": {
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "deb"
    }
  };
  
  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Updated package.json with Electron scripts");
} catch (error) {
  console.error("Error updating package.json:", error);
  process.exit(1);
}
