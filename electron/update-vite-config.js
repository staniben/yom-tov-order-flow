
// This script will be run by the build process to update vite.config.ts
const fs = require('fs');
const path = require('path');

try {
  const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
  let viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Modify the Vite config to support Electron
  if (!viteConfigContent.includes('base: process.env.ELECTRON')) {
    viteConfigContent = viteConfigContent.replace(
      'export default defineConfig({',
      `export default defineConfig({
  base: process.env.ELECTRON === 'true' ? './' : '/',`
    );
    
    fs.writeFileSync(viteConfigPath, viteConfigContent);
    console.log("Updated vite.config.ts for Electron compatibility");
  } else {
    console.log("vite.config.ts already configured for Electron");
  }
} catch (error) {
  console.error("Error updating vite.config.ts:", error);
  process.exit(1);
}
