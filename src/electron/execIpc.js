import { ipcMain } from 'electron';
// import { exec } from 'child_process';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export default function execIpc() {
  const ffmpegPath = path.join(process.cwd(), process.env.NODE_ENV === 'development' ? '/extraResources' : '/resources/extraResources','ffmpeg.exe');
  const ffprobePath = path.join(process.cwd(), process.env.NODE_ENV === 'development' ? '/extraResources' : '/resources/extraResources','ffprobe.exe');
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  // 切割信息
  ipcMain.on('cutting-infomation', (event, cutInfo) => {
    const command = ffmpeg();
    ffmpeg.ffprobe(cutInfo.filePath, (error, metaData) => {
      if (error) {
        event.reply('cutting-replay', {
          type: 'error',
          message: error,
        });
        return;
      }
      const bitRate = metaData.format.bit_rate;
      command.input(cutInfo.filePath).on('start', (commandLine) => {
        // console.log('Spawned Ffmpeg with command: ' + commandLine);
        event.reply('cutting-replay', {
          type: 'start',
          message: commandLine,
        });
      }).on('codecData', (data) => {
        // console.log('Processing: ' + progress.percent + '% done');
        event.reply('cutting-replay', {
          type: 'codecData',
          message: data,
        });
      }).on('progress', (progress) => {
        // console.log('Processing: ' + progress.percent + '% done');
        event.reply('cutting-replay', {
          type: 'progress',
          message: progress,
        });
      }).on('error', (err) => {
        // console.log('An error occurred: ' + err.message);
        event.reply('cutting-replay', {
          type: 'error',
          message: err,
        });
      }).on('end', () => {
        // console.log('Processing finished !');
        event.reply('cutting-replay', {
          type: 'end',
          message: '',
        });
      });
      cutInfo.slices.forEach(ele => {
        command.output(path.join(cutInfo.output, ele.fileName + '.mp4')).outputOptions([
          `-vf crop=${ele.w}:${ele.h}:${ele.x}:${ele.y}`,
          '-threads 5',
          '-preset ultrafast',
          '-strict -2'
        ]).videoCodec('libx264');
        if (bitRate) {
          command.videoBitrate(bitRate/1000);
        }
      });
      command.run();
    });
  });
}