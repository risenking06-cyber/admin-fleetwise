# JFarm - Electron Desktop App

## 🚀 Building for Windows

### Development Mode
To run the app in Electron development mode:
```bash
npm run electron:dev
```
This will start both the Vite dev server and Electron in development mode with hot reload.

### Building Windows Installer
To create a Windows installer (.exe):
```bash
npm run electron:build
```

The installer will be created in the `release` folder.

### Building Without Installer (Portable)
To create a portable Windows build without installer:
```bash
npm run electron:build:dir
```

## 📦 Installation

After building, you'll find the installer in the `release` folder:
- `JFarm Setup.exe` - The installer for Windows

Double-click to install the application on your Windows PC.

## 🔧 Configuration

The Electron configuration is in:
- `electron/main.js` - Main process (window management)
- `electron/preload.js` - Preload script (security bridge)
- `electron-builder.json` - Build configuration

## 📝 Scripts Reference

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder --win",
    "electron:build:dir": "npm run build && electron-builder --win --dir"
  }
}
```

## 🎯 Features

- ✅ Desktop application for Windows
- ✅ Offline-ready after initial load
- ✅ Native window controls
- ✅ Auto-updater ready (can be configured)
- ✅ System tray support (can be added)

## 🐛 Troubleshooting

**Issue: Build fails**
- Make sure all dependencies are installed: `npm install`
- Check that you have built the web app first: `npm run build`

**Issue: App won't start**
- Check if port 8080 is available
- Make sure Firebase configuration is correct in `.env`

**Issue: White screen on startup**
- Check console logs in development mode
- Verify all routes are properly configured
