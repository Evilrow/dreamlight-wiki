const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
const DEFAULTS = { owned: ['base', 'rift', 'vale', 'ranch'] };

ipcMain.handle('data:load', () =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ddv.json'), 'utf-8')));
ipcMain.handle('settings:get', () => {
  try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf-8')) }; }
  catch { return DEFAULTS; }
});
ipcMain.handle('settings:set', (_e, s) => { fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 1)); return true; });

function createWindow() {
  const win = new BrowserWindow({
    width: 1320, height: 860, minWidth: 900, minHeight: 600,
    backgroundColor: '#1d1838', title: 'Dreamlight Wiki', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false },
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL); // npm run dev
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
