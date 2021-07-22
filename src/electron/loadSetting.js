import { readFileSync , writeFile } from 'fs';
import { ipcMain, dialog } from 'electron';
import defaultConfig from '@/config';

let setting = {};
// 写入set.txt文件
function writeSetFile(data) {
  if (data) {
    setting = data;
  }
  writeFile(defaultConfig.configName, JSON.stringify(setting), 'utf8', (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
}
// 默认值
function assignDefaultValue() {
  setting =  {
    language: defaultConfig.langList[0].value,
    output: process.cwd(),
    resolution: defaultConfig.resolution
  }
}
// ipc事件
function setIpc() {
  // 获取配置
  ipcMain.on('get-setting', (event) => {
    event.returnValue = setting;
  });
  // 写入配置
  ipcMain.on('write-setting', (event, args) => {
    writeSetFile(Object.assign({}, setting, args));
  });
  // 路径变更
  ipcMain.on('set-output-dir', (event, args) => {
    dialog.showOpenDialog({
      defaultPath: args.path,
      properties: ['openFile','openDirectory']
    }).then(result => {
      if (result.canceled) {
        event.returnValue = '';
      } else {
        event.returnValue = result.filePaths[0];
        writeSetFile(Object.assign({}, setting, {
          output: result.filePaths[0]
        }));
      }
    }).catch(err => {
      console.log(err);
      event.returnValue = '';
    });
    // writeSetFile(Object.assign({}, setting, args));
  });
}
// 读取set.txt文件
export function loadSetting() {
  // 尝试读取文件
  try {
    const fileContent = readFileSync(defaultConfig.configName, 'utf8');
    const trs = JSON.parse(fileContent);
    setting =  {
      language: trs.language || defaultConfig.langList[0].value,
      output: trs.output || process.cwd(),
      resolution: trs.resolution || []
    };
  } catch(err) {
    // 赋默认值
    assignDefaultValue();
    // 没有set.txt文件
    if (err.code === 'ENOENT') {
      writeSetFile();
    }
  }
  // 注册ipc事件
  setIpc();
}