import { app, BrowserWindow, globalShortcut } from 'electron';
import { loadSetting } from './loadSetting';
import { createWindow } from './createWindow';

export default function runApp() {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  // app事件监听
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0){
      createWindow();
    }
  });

  app.on('ready', async () => {
    // 读取配置文件
    loadSetting();
    // 创建窗口
    createWindow();
  });

  app.whenReady().then(() => {
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+R', () => {
      console.log('CommandOrControl+R is pressed');
    });
  });
  
  app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll()
  });

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          app.quit()
        }
      })
    } else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  };
} 