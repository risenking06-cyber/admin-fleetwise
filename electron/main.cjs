const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { autoUpdater } = require("electron-updater");

let mainWindow; // ✅ Global reference

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../dist/jfarm-logo.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 🔹 Only enable autoUpdater in production
app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    autoUpdater.autoDownload = false; // ✅ manual control
    autoUpdater.checkForUpdates();    // ✅ check immediately
  }
});

// 🔹 Events from Electron Updater
autoUpdater.on('update-available', () => {
  console.log("Update available");
  mainWindow?.webContents.send('update_available');
});

autoUpdater.on('update-not-available', () => {
  console.log("No update available");
});

autoUpdater.on('error', (err) => {
  console.error("Updater Error:", err);
  mainWindow?.webContents.send('update_error', err.message || 'Unknown error');
});

autoUpdater.on('download-progress', (progressInfo) => {
  console.log(`Downloaded ${progressInfo.percent}%`);
  mainWindow?.webContents.send('download_progress', progressInfo.percent);
});

autoUpdater.on('update-downloaded', () => {
  console.log("Update downloaded");
  mainWindow?.webContents.send('update_downloaded');
});

// 🔹 Renderer Requests
ipcMain.on('download_update', () => {
  console.log("Downloading update...");
  autoUpdater.downloadUpdate(); // ✅ correct function
});

ipcMain.on('restart_app', () => {
  console.log("Restarting app to install update...");
  autoUpdater.quitAndInstall();
});

autoUpdater.on('download-progress', (progressInfo) => {
  const percent = Math.floor(progressInfo.percent);
  console.log(`Download progress: ${percent}%`);
  mainWindow?.webContents.send('download_progress', percent);
});
