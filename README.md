# magicbox  
vue + electron + ffmpeg 打造的素材切割工具  windows版本

## Project setup
```
npm install
```

## Modify fluent-ffmpeg
修改 .\node_modules\fluent-ffmpeg\index.js文件
将 module.exports = process.env.FLUENTFFMPEG_COV ? require('./lib-cov/fluent-ffmpeg') : require('./lib/fluent-ffmpeg');
修改为 module.exports = require('./lib/fluent-ffmpeg');
否则会报引用错误

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

##ELECTRON_MIRROR
npm config set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
系统环境变量中配置： ELECTRON_MIRROR  https://npm.taobao.org/mirrors/electron/