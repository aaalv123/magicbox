'use strict';
import runApp from './electron/app';
import execIpc from './electron/execIpc';

// 程序入口
runApp();

// 命令行ipc事件
execIpc();