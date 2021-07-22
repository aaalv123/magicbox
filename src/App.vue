<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/cutting">素材切割</router-link>
      <router-link to="/about">About</router-link>
    </div> -->
    <header id="header">
      <div class="drag"></div>
      <div class="title">{{$t('MESSAGE.APP_TITLE')}}</div>
      <div class="operation">
        <el-dropdown class="drop-down" @command="changeLanguage">
          <span class="el-dropdown-link">{{langName}}<i class="el-icon-caret-bottom"></i></span>
          <el-dropdown-menu slot="dropdown" class="language-drop-down-menu">
            <el-dropdown-item v-for="item in langList" :key="item.value" :command="item.value">{{item.name}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span class="normal-button el-icon-minus" @click="handleMin"></span>
        <span :class="['normal-button', {'win-restore': winStatus === 'restore'}, {'win-max': winStatus === 'max'}]" @click="handleMaxAndRestore"></span>
        <span class="normal-button el-icon-close" @click="handleClose"></span>
      </div>
    </header>
    <router-view/>
  </div>
</template>
<script>
import lang from './config';

export default {
  name: 'App',
  data() {
    return {
      langList: lang.langList,
      winStatus: '', // restore 还原 max 最大化
    };
  },
  computed: {
    langName() {
      const curlang = this.$store.state.language;
      let findLang = this.langList.find((item) => item.value === curlang);
      if (!findLang) {
        findLang = this.langList[0];
      }
      this.changeLanguage(findLang.value);
      return findLang.name;
    },
  },
  created() {
    // 获取set.txt配置内容
    this.$store.commit('setAppConfig', window.ipcRenderer.sendSync('get-setting'));
    // 获取窗口状态  最大化or窗口
    this.winStatus = window.ipcRenderer.sendSync('get-winStatus');
  },
  methods: {
    handleMin() {
      window.ipcRenderer.send('handleMin');
    },
    handleMaxAndRestore() {
      this.winStatus = window.ipcRenderer.sendSync('handleMaxAndRestore');
    },
    handleClose() {
      window.ipcRenderer.send('handleClose');
    },
    changeLanguage(language) {
      this.$store.commit('changeLanguage', language);
      this.$i18n.locale = language;
      window.ipcRenderer.send('write-setting', {
        language,
      });
    },
  },
};
</script>
<style lang="less">
#app {
  font-family: '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}
#header{
  width: 100%;
  position: relative;
  height: 38px;
  background-image: linear-gradient(180deg, #36353E 0%, #2B282F 100%);
  z-index: 9999;
  .drag{
    -webkit-app-region: drag;
    height: 100%;
  }
  .title{
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    -webkit-app-region: no-drag;
    padding-left: 25px;
    line-height: 38px;
  }
  .operation{
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    padding: 6px 10px 0 0;
    .drop-down{
      height: 24px;
      background: #4A4652;
      border-radius: 4px;
      padding: 0 6px;
      vertical-align: top;
      line-height: 24px;
      .el-dropdown-link{
        display: inline-block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        color: #fff;
        text-align: center;
        .el-icon-caret-bottom{
          color: #B7B7B9;
          vertical-align: middle;
          margin-left: 2px;
        }
      }
    }
    .normal-button{
      display: inline-block;
      width: 20px;
      height: 24px;
      vertical-align: top;
      margin-left: 12px;
      font-size: 16px;
      box-sizing: border-box;
      padding-top: 4px;
    }
    .win-restore{
      background: url(./assets/images/win-restore.png) no-repeat center 7px;
      background-size: 13px 10px;
    }
    .win-max{
      background: url(./assets/images/win-max.png) no-repeat center 6px;
      background-size: 14px 13px;
    }
    // span{
    //   font-size: 20px;
    //   margin: 10px 8px 0;
    //   vertical-align: middle;
    // }
    // .el-icon-full-screen{
    //   font-size: 16px;
    // }
  }
}
.language-drop-down-menu{
  background-color: #514E58;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  border: 0 none;
  .el-dropdown-menu__item{
    color: #fff;
    &:hover{
      background-color: #3D9FFD;
      color: #fff;
    }
  }
  .popper__arrow{
    display: none;
  }
}
// #nav {
//   padding: 10px 0;
// }
// #nav a {
//   display: inline-block;
//   line-height: 1;
//   white-space: nowrap;
//   cursor: pointer;
//   background: #fff;
//   border: 1px solid #dcdfe6;
//   color: #606266;
//   -webkit-appearance: none;
//   text-align: center;
//   box-sizing: border-box;
//   outline: none;
//   margin: 0;
//   transition: .1s;
//   font-weight: 500;
//   padding: 12px 20px;
//   font-size: 14px;
//   border-radius: 4px;
//   margin: 0 10px;
// }
// #nav a.router-link-exact-active {
//   color: #fff;
//   background-color: #409eff;
//   border-color: #409eff;
// }
</style>
