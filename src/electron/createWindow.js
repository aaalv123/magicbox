import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import { BrowserWindow, ipcMain, protocol } from 'electron';

let mainWindow = null; // 主窗口变量

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

function registWindowIpc() {
  // 最小化
  ipcMain.on('handleMin', () => {
    mainWindow.minimize();
  });
  // 最大化切换
  ipcMain.on('handleMaxAndRestore', (event) => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
      event.returnValue = 'restore';
    } else {
      mainWindow.maximize();
      event.returnValue = 'max';
    }
  });
  // 最小化
  ipcMain.on('handleClose', () => {
    // mainWindow.close();
    mainWindow.destroy();
  });
  // 窗口最大化or常态
  ipcMain.on('get-winStatus', (event) => {
    event.returnValue = mainWindow.isMaximized() ? 'max' : 'restore';
  });
}

// Create the browser window.
export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
  }
  // 注册窗口最小化 最大化 关闭事件
  registWindowIpc();
};