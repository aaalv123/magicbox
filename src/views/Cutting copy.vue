<template>
  <div class="page-cutting">
    <!-- 素材导入、输出框 -->
    <div class="path">
      <div class="position">
        <span class="name">{{$t('MESSAGE.MATERIAL_IMPORT')}}</span>
        <el-input v-model="input" readonly></el-input>
        <el-button icon="el-icon-more" @click="addMaterial"></el-button>
        <div class="file-choose">
          <input type="file" ref="fileInput" @change="fileChange" accept="video/*" />
        </div>
      </div>
      <div class="position">
        <span class="name">{{$t('MESSAGE.OUTPUT_LOCATION')}}</span>
        <el-input v-model="output" readonly></el-input>
        <el-button icon="el-icon-more" @click="chooseOutputDir"></el-button>
      </div>
    </div>
    <div class="cutting-area" ref="cuttingArea">
      <!-- 拖拽\点击添加素材 -->
      <div class="add-material" @click="addMaterial" @drop="drop_handler($event)" @dragover="dragover_handler($event)" v-if="!showCutting">
        <i class="el-icon-plus icon-plus"></i>
        <span class="text">{{$t('MESSAGE.PAGE_CUTTING.DRAG_CLICK_ADD')}}</span>
      </div>
      <!-- vue-draggable-resizable -->
      <div class="draw" v-if="showCutting">
        <div class="box" :style="{width: styleObject.width + 'px', height: styleObject.height + 'px', transform: 'scale('+ scale +') translate(-50%, -50%)'}">
          <div class="material-box">
            <!-- <img v-if="fileType === 'image'" ref="imgEle" :src="priviewUrl" @load="imageLoad"> -->
            <video
              ref="video"
              :src="priviewUrl"
              @loadedmetadata="videoLoadedMeta"
              @ended="videoEnded"
              @timeupdate="videoTimeupdate"
            ></video>
          </div>
          <div
            v-for="(item, index) in coverArea"
            :key="index"
            :style="{position: 'absolute', width: item.w + 'px', height: item.h + 'px', left: item.x + 'px', top: item.y + 'px', background: 'rgba(0,0,0,0.8)'}"
          ></div>
          <vue-draggable-resizable
            v-for="(item, index) in slices"
            :key="index"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :parent="true"
            class="cut"
            :active="item.active"
            :preventDeactivation="item.preventDeactivation"
            :scale="scale"
            :min-width="1"
            :min-height="1"
            class-name-handle="scale-handles"
            @activated="onActivated(index)"
            @dragging="onDrag"
            @resizing="onResize">
            <div slot="tl" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="tm" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="tr" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="mr" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="br" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="bm" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="bl" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
            <div slot="ml" class="scale-slot" :style="{transform: 'scale('+ 1/scale +')'}"></div>
          </vue-draggable-resizable>
        </div>
      </div>
      <!-- 视频播放控件 -->
      <div class="video-controls" v-if="showCutting">
        <el-button type="text" class="video-play-pause" @click="videoPlay">
          <span v-if="videoObj.paused" class="video-play el-icon-caret-right"></span>
          <span v-if="!videoObj.paused" class="video-pause">||</span>
        </el-button>
        <div class="video-track" ref="videoTrack">
          <div class="track-bar" @click="videoTrackClick">
            <div class="process-bar" :style="{width: videoObj.process + '%'}"></div>
          </div>
          <div class="track-thumb" :style="{left: videoObj.process + '%'}" @mousedown="videoThumbMousedown"></div>
        </div>
        <div class="video-time"><span>{{videoObj.currentTime}}</span> | {{videoObj.totalDuration}}</div>
      </div>
    </div>
    <!-- 输出列表 -->
    <div class="output-list">
      <div class="title">
        <span class="label">{{$t('MESSAGE.PAGE_CUTTING.OUTPUT_LIST')}}</span>
        <el-button class="add-area" @click="inputAddInfo" icon="el-icon-plus" :disabled="!showCutting">{{$t('MESSAGE.BUTTON_ADD')}}</el-button>
      </div>
      <div class="list-head" v-if="slices.length">
        <span class="size">{{$t('MESSAGE.PAGE_CUTTING.OUTPUT_SIZE')}}</span>
        <span class="name">{{$t('MESSAGE.PAGE_CUTTING.OUTPUT_NAME')}}</span>
        <span class="operate"></span>
      </div>
      <ul>
        <li class="list-con" :class="activeIndex === index ? 'cut-active' : ''" v-for="(item, index) in slices" :key="index" @click="onActivated(index)">
          <span class="size" :title="`${item.w}*${item.h}`">{{item.w}}*{{item.h}}</span>
          <span class="name" :title="item.fileName">{{item.fileName}}</span>
          <span class="operate">
            <el-button class="delete" icon="el-icon-delete" type="text" @click.stop="deleteSlice(index)"></el-button>
          </span>
        </li>
      </ul>
    </div>
    <div class="property">
      <!-- 编辑 -->
      <div class="edit-area">
        <div class="title">
          <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_EDIT')}}</span>
        </div>
        <ul class="adjust-params">
          <li>
            <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_POSITION')}}</span>
            <span class="input-box">
              <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_POSITION_LEFT')}}</span>
              <el-input
                class="number-input"
                :disabled="activeIndex === -1"
                v-model="property.x"
                @input.native="inputProperty($event, 'x')"
                @change="changePropertyX"
              ></el-input>
            </span>
            <span class="input-box">
              <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_POSITION_TOP')}}</span>
              <el-input
                class="number-input"
                :disabled="activeIndex === -1"
                v-model="property.y"
                @input.native="inputProperty($event, 'y')"
                @change="changePropertyY"
              ></el-input>
            </span>
          </li>
          <li>
            <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE')}}</span>
            <span class="input-box">
              <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE_WIDTH')}}</span>
              <el-input
                class="number-input"
                :disabled="activeIndex === -1"
                v-model="property.w"
                @input.native="inputProperty($event, 'w')"
                @change="changePropertyW"
              ></el-input>
            </span>
            <span class="input-box">
              <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE_HEIGHT')}}</span>
              <el-input
                class="number-input"
                :disabled="activeIndex === -1"
                v-model="property.h"
                @input.native="inputProperty($event, 'h')"
                @change="changePropertyH"
              ></el-input>
            </span>
          </li>
          <li>
            <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_FILENAME')}}</span>
            <el-input class="file-name-input" :disabled="activeIndex === -1" v-model="property.fileName" @change="changePropertyFileName"></el-input>
          </li>
        </ul>
      </div>
      <!-- 开始切割 -->
      <div class="func-button">
        <el-button class="button-cut" :disabled="showCuttingProgress" @click="saveMaterial">{{$t('MESSAGE.PAGE_CUTTING.START_CUTTONG')}}</el-button>
      </div>
    </div>
    <el-dialog
      :title="$t('MESSAGE.PAGE_CUTTING.POP_ADD_OUTPUT')"
      :visible.sync="showAddInfoPop"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="add-out-info">
      <div class="add-size">
        <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE')}}</span>
        <span class="input-box">
          <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE_WIDTH')}}</span>
          <el-input class="number-input" v-model="addAreaObj.width" @input="areaInputWidth"></el-input>
        </span>
        <span class="input-box">
          <span class="input-name">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_SIZE_HEIGHT')}}</span>
          <el-input class="number-input" v-model="addAreaObj.height" @input="areaInputHeight"></el-input>
        </span>
      </div>
      <div class="recom-size">
        <span v-for="(item, index) in resolution" :key="index" @click="fillData(item)">{{item.width}}*{{item.height}}</span>
      </div>
      <div class="add-filename">
        <span class="label">{{$t('MESSAGE.PAGE_CUTTING.PROPERTY_FILENAME')}}</span>
        <el-input class="file-name-input" v-model="addAreaObj.fileName"></el-input>
      </div>
      <div slot="footer" class="add-area-button">
        <el-button class="button-cancel" @click="showAddInfoPop = false">{{$t('MESSAGE.BUTTON_CANCEL')}}</el-button>
        <el-button class="button-sure" type="primary" @click="addArea">{{$t('MESSAGE.BUTTON_SURE')}}</el-button>
      </div>
    </el-dialog>
    <!-- 进度弹窗 -->
    <el-dialog
      :title="$t('MESSAGE.PAGE_CUTTING.ITP_PROGRESS')"
      :visible.sync="showCuttingProgress"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="500px"
      @closed="cutProgressClosed"
      top="0"
      class="cut-progress">
      <el-progress :percentage="cutPercentage" v-if="isCutting"></el-progress>
      <div class="show-cut-loading" v-else>
        <i class="el-icon-loading"></i>
        <span>{{$t('MESSAGE.PAGE_CUTTING.CUTTING_LOADING')}}</span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import VueDraggableResizable from 'vue-draggable-resizable';
import { throttle } from 'lodash';
import { replaceToNumber, formatMsToHHmmss } from '@/utils';
import splitList from '@/utils/cutSplit';

export default {
  name: 'Cutting',
  components: {
    VueDraggableResizable,
  },
  data() {
    return {
      input: '',
      output: this.$store.state.output,
      showAddInfoPop: false,
      file: null,
      priviewUrl: '',
      // fileType: '',
      showCutting: false,
      slices: [],
      activeIndex: -1,
      styleObject: {
        width: 0,
        height: 0,
      },
      addAreaObj: {
        width: '',
        height: '',
        fileName: '',
      },
      areaObjIndex: 1, // 默认生成视频名+index
      property: { // 选中区域的属性
        x: '',
        y: '',
        w: '',
        h: '',
        fileName: '',
      },
      cuttingArea: {
        width: 0,
        height: 0,
      },
      scale: 1,
      videoObj: {
        paused: true,
        currentTime: '00:00:00',
        totalDuration: '00:00:00',
        process: 0,
        seeking: false,
      },
      showCuttingProgress: false,
      isCutting: false,
      cutPercentage: 0,
      coverArea: [],
    };
  },
  computed: {
    // set.txt预制分辨率
    resolution() {
      return this.$store.state.resolution;
    },
  },
  mounted() {
    this._setCuttingArea();
    window.addEventListener('resize', throttle(this._setCuttingArea, 500), false);
    // window.onresize = throttle(this._setCuttingArea, 500, {
    //   leading: false,
    // });
    // 监听切割事件
    window.ipcRenderer.receive('cutting-replay', this._cuttingReplay);
  },
  beforeDestory() {
    window.removeEventListener('resize', throttle(this._setCuttingArea, 500), false);
    // window.onresize = null;
  },
  methods: {
    // 计算切割区域大小
    _setCuttingArea() {
      const cuttingArea = this.$refs.cuttingArea;
      this.cuttingArea.width = cuttingArea.clientWidth;
      this.cuttingArea.height = cuttingArea.clientHeight - 60;
      if (this.showCutting) {
        this._calcScale();
      }
    },
    // 计算缩放比例
    _calcScale() {
      if (this.styleObject.width > this.cuttingArea.width || this.styleObject.height > this.cuttingArea.height) {
        if (this.styleObject.width - this.cuttingArea.width > this.styleObject.height - this.cuttingArea.height) {
          this.scale = this.cuttingArea.width / this.styleObject.width;
        } else {
          this.scale = this.cuttingArea.height / this.styleObject.height;
        }
      } else {
        this.scale = 1;
      }
    },
    // 添加素材按钮点击
    addMaterial() {
      this.$refs.fileInput.click();
    },
    // 添加素材文件change方法
    fileChange(ev) {
      if (ev.target.files.length === 0) {
        return;
      }
      this._analysisFile(ev.target.files[0]);
    },
    // 拖拽素材到切割区域
    dragover_handler(ev) {
      ev.preventDefault();
    },
    // 拖拽素材到切割区域放置
    drop_handler(ev) {
      ev.preventDefault();
      const files = ev.dataTransfer.files;
      if (files.length > 1) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.ONLY_DROP_ONE_FILE'), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      this._analysisFile(files[0]);
    },
    // 素材处理
    _analysisFile(file) {
      if (file.type !== 'video/mp4') {
        // this.fileType = 'video';
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.VIDEO_FORMAT_MP4'), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      this.file = file;
      // else if (this.file.type.indexOf('image') === 0) {
      //   this.fileType = 'image';
      // }

      // const fileReader = new FileReader();
      // fileReader.onload = (e) => {
      //   console.log(e.target);
      //   this.priviewUrl = e.target.result;
      //   this.showCutting = true;
      //   this.slices = [];
      // };
      // fileReader.readAsArrayBuffer(this.file);
      this.priviewUrl = URL.createObjectURL(this.file);
      this.input = this.file.name;
      this.showCutting = true;
      // 重置数据
      this.slices = [];
      this.videoObj = {
        paused: true,
        currentTime: '00:00:00',
        totalDuration: '00:00:00',
        process: 0,
        seeking: false,
      };
    },
    // 修改文件输出路径
    chooseOutputDir() {
      const output = window.ipcRenderer.sendSync('set-output-dir', {
        path: this.output,
      });
      if (output) {
        this.output = output;
      }
    },
    // 获取视频真实宽高
    videoLoadedMeta(e) {
      const { videoWidth, videoHeight, duration } = e.target;
      this.styleObject.width = videoWidth;
      this.styleObject.height = videoHeight;
      this.videoObj.totalDuration = formatMsToHHmmss(duration);
      this._calcScale();
    },
    // 视频播放与暂停
    videoPlay() {
      const video = this.$refs.video;
      if (video.paused) {
        video.play();
        this.videoObj.paused = false;
      } else {
        video.pause();
        this.videoObj.paused = true;
      }
    },
    // 视频播放结束
    videoEnded() {
      console.log('videoEnded');
      this.videoObj.paused = true;
    },
    // 视频时间更新
    videoTimeupdate(e) {
      const { currentTime, duration } = e.target;
      this.videoObj.currentTime = formatMsToHHmmss(currentTime);
      if (!this.videoObj.seeking) {
        this.videoObj.process = (currentTime / duration) * 100;
      }
    },
    // 更改进度条
    // videoChangeSeek(value) {
    //   console.log('videoChangeSeek', this.videoObj.seeking);
    //   if (!this.videoObj.seeking) {
    //     const video = this.$refs.video;
    //     this.$refs.video.currentTime = (video.duration || 0) * (value / 100);
    //     this.videoObj.seeking = false;
    //   }
    // },
    // 进度条点击
    videoTrackClick(e) {
      this._setVideoPosition(e.clientX);
    },
    // 进度拖拽
    videoThumbMousedown() {
      this.videoObj.seeking = true;
      window.addEventListener('mousemove', this._videoTrackMousemove, false);
      window.addEventListener('mouseup', this._videoTrackMouseup, false);
    },
    _videoTrackMousemove(e) {
      this.videoObj.seeking = true;
      this._setVideoPosition(e.clientX);
    },
    _videoTrackMouseup(e) {
      this.videoObj.seeking = false;
      this._setVideoPosition(e.clientX);
      window.removeEventListener('mousemove', this._videoTrackMousemove, false);
      window.removeEventListener('mouseup', this._videoTrackMouseup, false);
    },
    _setVideoPosition(position) {
      const video = this.$refs.video;
      const { width, left } = this.$refs.videoTrack.getBoundingClientRect();
      let percent = (position - left) / width;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }
      this.videoObj.process = percent * 100;
      if (!this.videoObj.seeking) {
        video.currentTime = video.duration * percent;
      }
    },
    // imageLoad() {
    //   this.styleObject.width = this.$refs.imgEle.width;
    //   this.styleObject.height = this.$refs.imgEle.height;
    // },
    // 添加切割区域按钮点击
    inputAddInfo() {
      const name = this.file.name.slice(0, this.file.name.lastIndexOf('.'));
      this.addAreaObj = {
        width: '',
        height: '',
        fileName: `${name}_${this.areaObjIndex}`,
      };
      this.showAddInfoPop = true;
    },
    // 添加切割区域弹窗-宽度输入
    areaInputWidth(value) {
      this.addAreaObj.width = replaceToNumber(value);
    },
    // 添加切割区域弹窗-高度输入
    areaInputHeight(value) {
      this.addAreaObj.height = replaceToNumber(value);
    },
    // 推荐分辨率点击
    fillData(data) {
      this.addAreaObj.width = data.width;
      this.addAreaObj.height = data.height;
    },
    /* eslint-disable no-param-reassign */
    // 重置切割区域数据
    _resetSlicesActiveAndPrevent() {
      this.slices.forEach((item) => {
        item.active = false;
        item.preventDeactivation = false;
      });
    },
    /* eslint-disable no-param-reassign */
    // 添加切割区域确定按钮
    addArea() {
      const width = Number(this.addAreaObj.width);
      const height = Number(this.addAreaObj.height);
      if (width === 0) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.WIDTH_NOT_EMPTY'), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      if (height === 0) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.HEIGHT_NOT_EMPTY'), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      if (width > this.styleObject.width) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.WIDTH_NOT_GREATER_THAN_VIDEO_WIDTH', { videoWidth: this.styleObject.width }), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      if (height > this.styleObject.height) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.HEIGHT_NOT_GREATER_THAN_VIDEO_HEIGHT', { videoHeight: this.styleObject.height }), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      // 重置slices数据
      this._resetSlicesActiveAndPrevent();
      const x = Math.floor((this.styleObject.width - width) / 2);
      const y = Math.floor((this.styleObject.height - height) / 2);
      this.slices.push({
        fileName: this.addAreaObj.fileName,
        w: width,
        h: height,
        x,
        y,
        active: true,
        preventDeactivation: true,
      });
      this.activeIndex = this.slices.length - 1;
      this.areaObjIndex += 1; // 自定义索引自增
      this.showAddInfoPop = false;
      // 重置数据
      this.addAreaObj = {
        width: '',
        height: '',
        fileName: '',
      };
      this._setProperty();
      this.coverArea = splitList({
        x: 0,
        y: 0,
        w: this.styleObject.width,
        h: this.styleObject.height,
      }, this.slices);
    },
    // 切割区域激活
    onActivated(index) {
      if (this.activeIndex !== index) {
        this._resetSlicesActiveAndPrevent();
        this.activeIndex = index;
        this.slices[index].active = true;
        this.slices[index].preventDeactivation = true;
        this._setProperty();
      }
    },
    // 删除切割区域
    deleteSlice(index) {
      this.slices.splice(index, 1);
      if (this.activeIndex === index) {
        this.activeIndex = this.slices.length ? 0 : -1;
      }
      if (this.activeIndex > index) {
        this.activeIndex -= 1;
      }
      if (this.activeIndex === -1) {
        this.property = {
          x: '',
          y: '',
          w: '',
          h: '',
          fileName: '',
        };
      } else {
        this._setProperty();
      }
    },
    // 切割区域拖动
    onDrag(x, y) {
      this.slices[this.activeIndex].x = x;
      this.slices[this.activeIndex].y = y;
      this._setProperty();
      this.coverArea = splitList({
        x: 0,
        y: 0,
        w: this.styleObject.width,
        h: this.styleObject.height,
      }, this.slices);
    },
    // 切割区域调整大小
    onResize(x, y, width, height) {
      this.slices[this.activeIndex].x = x;
      this.slices[this.activeIndex].y = y;
      this.slices[this.activeIndex].w = width;
      this.slices[this.activeIndex].h = height;
      this._setProperty();
    },
    // 当前切割区域属性
    _setProperty() {
      this.property = { ...this.slices[this.activeIndex] };
    },
    // 属性区域输入
    inputProperty(ev, key) {
      this.property[key] = replaceToNumber(ev.target.value);
    },
    // 属性区域输入确认--X
    changePropertyX(x) {
      const xValue = Number(x);
      if ((xValue + this.property.w) > this.styleObject.width) {
        this.property.x = this.styleObject.width - this.property.w;
      } else {
        this.property.x = xValue;
      }
      this.slices[this.activeIndex].x = this.property.x;
    },
    // 属性区域输入确认--Y
    changePropertyY(y) {
      const yValue = Number(y);
      if ((yValue + this.property.h) > this.styleObject.height) {
        this.property.y = this.styleObject.height - this.property.h;
      } else {
        this.property.y = yValue;
      }
      this.slices[this.activeIndex].y = this.property.y;
    },
    // 属性区域输入确认--W
    changePropertyW(w) {
      const wValue = Number(w) || 1; // 宽度最小为1
      if ((wValue + this.property.x) > this.styleObject.width) {
        this.property.w = this.styleObject.width - this.property.x;
      } else {
        this.property.w = wValue;
      }
      this.slices[this.activeIndex].w = this.property.w;
    },
    // 属性区域输入确认--H
    changePropertyH(h) {
      const hValue = Number(h) || 1; // 宽度最小为1
      if ((hValue + this.property.y) > this.styleObject.height) {
        this.property.h = this.styleObject.height - this.property.y;
      } else {
        this.property.h = hValue;
      }
      this.slices[this.activeIndex].h = this.property.h;
    },
    // 属性区域输入确认--文件名
    changePropertyFileName(name) {
      if (name.trim() === '') {
        this.property.fileName = this.slices[this.activeIndex].fileName;
      } else {
        this.property.fileName = name;
        this.slices[this.activeIndex].fileName = name;
      }
    },
    // 开始切割按钮
    saveMaterial() {
      if (this.slices.length === 0) {
        this.$MessageBox.alert(this.$t('MESSAGE.PAGE_CUTTING.NO_CUTTING_AREA'), this.$t('MESSAGE.TIPS'), {
          customClass: 'custom-message-box',
        });
        return;
      }
      window.ipcRenderer.send('cutting-infomation', {
        filePath: this.file.path,
        output: this.output,
        slices: this.slices,
      });
      this.showCuttingProgress = true;
    },
    // 切割响应方法
    _cuttingReplay(event, data) {
      // console.log(data);
      const { type, message } = data;
      if (type === 'codecData') {
        this.isCutting = true;
      }
      if (type === 'progress') {
        if (!message.percent) { // undefined null 0
          this.cutPercentage = 0;
        } else {
          this.cutPercentage = Math.round(message.percent);
        }
      }
      if (type === 'end') {
        this.showCuttingProgress = false;
        /* eslint-disable-next-line no-new */
        new Notification(this.$t('MESSAGE.PAGE_CUTTING.CUTTING_SUCCESS'), { body: this.$t('MESSAGE.PAGE_CUTTING.CUTTING_SUCCESS_MESSAGE') });
      }
      if (type === 'error') {
        /* eslint-disable-next-line no-new */
        new Notification(this.$t('MESSAGE.PAGE_CUTTING.CUTTING_FAIL'), { body: message.message });
      }
    },
    // 切割弹窗关闭 重置数据
    cutProgressClosed() {
      this.cutPercentage = 0;
      this.isCutting = false;
    },
  },
};
</script>
<style lang="less">
.page-cutting {
  padding: 0 20px;
  height: calc(100% - 60px);
  display: grid;
  grid-template-rows: 50px auto 340px;
  grid-template-columns: auto 370px;
  column-gap: 10px;
  row-gap: 10px;
  // overflow: hidden;
  .path{
    display: flex;
    padding-top: 14px;
    grid-column-start: span 2;
    .position{
      flex: 1;
      max-width: 600px;
      display: flex;
      margin-right: 60px;
      .name{
        width: 70px;
        line-height: 32px;
      }
      .el-input{
        flex: 1;
        height: 32px;
        .el-input__inner{
          background-color: #353239;
          border-radius: 4px;
          border: 0 none;
          height: 32px;
          line-height: 32px;
          color: #B7B7B9;
        }
      }
      .el-button{
        width: 32px;
        height: 32px;
        background-color: #353239;
        border-radius: 4px;
        border: 0 none;
        margin-left: 2px;
        padding: 0;
        color: #B7B7B9;
      }
      .file-choose{
        width: 0;
        height: 0;
        overflow: hidden;
        display: none;
        opacity: 0;
      }
    }
  }
  .cutting-area{
    background-color: #201F24;
    position: relative;
    // overflow: hidden;
    // height: 100%;
    grid-row-start: span 2;
    .add-material{
      position: absolute;
      left: 50%;
      top: 50%;
      box-sizing: border-box;
      width: 384px;
      height: 192px;
      transform: translate(-50%, -50%);
      background-color: #19191E;
      border: 1px dashed rgba(255,255,255,0.20);
      border-radius: 4px;
      text-align: center;
      box-sizing: border-box;
      padding-top: 55px;
      .icon-plus{
        width: 38px;
        height: 38px;
        font-size: 30px;
        background-color: #3D9FFD;
        color: #fff;
        line-height: 40px;
        display: inline-block;
        border-radius: 50%;
      }
      .text{
        display: block;
        font-size: 16px;
        color: rgba(255,255,255,0.85);
        padding-top: 20px;
      }
    }
    .draw{
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc(100% - 60px);
      .box{
        position: absolute;
        width: 100%;
        height: 100%;
        transform-origin: left top;
        left: 50%;
        top: 50%;
      }
      .material-box{
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        video{
          width: 100%;
          height: 100%;
        }
      }
      .cut{
        background-color: rgba(255,255,255,0.5);
        border: 0 dashed #000;
        position: absolute;
      }
    }
    .video-controls{
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 60px;
      box-sizing: border-box;
      padding: 5px 20px 0;
      display: flex;
      justify-content: space-between;
      border-top: 10px solid #0F1115;
      .video-play-pause{
        font-size: 35px;
        padding: 0;
        width: 40px;
        height: 40px;
        color: #fff;
        line-height: 40px;
        margin-right: 30px;
      }
      .video-play{
        margin-left: -2px;
      }
      .video-pause{
        font-size: 20px;
        letter-spacing: 4px;
        display: inline-block;
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: 34px;
        vertical-align: top;
        font-weight: bold;
      }
      .video-track{
        flex: 1;
        height: 40px;
        position: relative;
        .track-bar{
          background-color: #403D47;
          height: 4px;
          border-radius: 2px;
          margin-top: 16px;
          cursor: pointer;
        }
        .process-bar{
          position: absolute;
          left: 0;
          top: 16px;
          height: 4px;
          border-radius: 2px;
          background-color: #409EFF;
          width: 0%;
        }
        .track-thumb{
          width: 10px;
          height: 10px;
          border: 2px solid #fff;
          background-color: #409EFF;
          border-radius: 10px;
          position: absolute;
          top: 11px;
          left: 0%;
          margin-left: -5px;
          cursor: pointer;
        }
      }
      .video-time{
        width: 140px;
        font-size: 12px;
        text-align: right;
        height: 40px;
        box-sizing: border-box;
        padding-top: 10px;
        margin-left: 20px;
        span{
          color: #3D9FFD;
        }
      }
    }
  }
  .output-list{
    background-color: #201F24;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    overflow: auto;
    .title{
      background-color: #403D47;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      height: 40px;
      display: flex;
      justify-content: space-between;
      .label{
        height: 100%;
        display: inline-block;
        line-height: 40px;
        padding-left: 16px;
      }
      .add-area{
        background-color: #2D2C33;
        color: #fff;
        font-size: 14px;
        border: 0 none;
        padding: 5px 10px;
        height: 30px;
        margin: 5px 10px 0 0;
      }
    }
    .list-head, .list-con{
      height: 48px;
      line-height: 48px;
      display: flex;
      .size{
        width: 100px;
        box-sizing: border-box;
        padding-left: 10px;
      }
      .name{
        width: 230px;
        box-sizing: border-box;
        padding-left: 10px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .operate{
        flex: 1;
        text-align: center;
        .delete{
          font-size: 16px;
          color: #fff;
        }
      }
    }
    ul{
      height: calc(100% - 88px);
      overflow: auto;
    }
    .list-con{
      border-top: 1px solid #0F1115;
      cursor: pointer;
    }
    .cut-active{
      color: #3EA1FB;
    }
  }
  .property{
    background-color: #201F24;
    .edit-area{
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      .title{
        background-color: #403D47;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        height: 40px;
        line-height: 40px;
        .label{
          padding-left: 16px;
        }
      }
      .adjust-params{
        height: 240px;
        li{
          display: flex;
          padding: 15px 0 0 20px;
          .label{
            width: 70px;
            height: 30px;
            line-height: 30px;
          }
          .input-box{
            display: flex;
            &:last-child{
              margin-left: 20px;
            }
            .input-name{
              width: 20px;
              height: 30px;
              line-height: 30px;
            }
          }
          .number-input{
            width: 100px;
          }
          .file-name-input{
            width: 260px;
          }
          .el-input__inner{
            width: 100%;
            height: 30px;
            background-color: #353239;
            border: 2px solid #353239;
            text-align: center;
            color: #E7E7E7;
            &:focus{
              border-color: #0A89FF;
            }
          }
        }
      }
    }
    .func-button{
      border-top: 1px solid #0F1115;
      height: 60px;
      text-align: right;
      box-sizing: border-box;
      padding: 10px 10px 0 0;
      .button-cut{
        background-color: #3D9FFD;
        border: 0 none;
        height: 38px;
        font-size: 16px;
        color: #fff;
        width: 200px;
      }
    }
    // .operate{
    //   width: 300px;
    //   border-left: 1px solid #ccc;
    //   box-sizing: border-box;
    //   padding: 10px;
    //   h6{
    //     color: #333;
    //     font-size: 16px;
    //     padding-bottom: 10px;
    //   }
    //   .add-button, .operate-button{
    //     margin: 0 10px 10px 0;
    //   }
    // }
  }
  .add-out-info{
    .el-dialog{
      background-color: #1F1F1F;
      margin: 0 !important;
      width: 400px;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
      position: absolute;
    }
    .el-dialog__header{
      padding: 16px 20px 0;
    }
    .el-dialog__title{
      font-size: 16px;
      color: #fff;
    }
    .el-dialog__body{
      padding: 10px 0 10px 20px;
      color: #E7E7E7;
      .el-input__inner{
        width: 100%;
        height: 30px;
        background-color: #353239;
        border: 2px solid #353239;
        text-align: center;
        color: #E7E7E7;
        &:focus{
          border-color: #0A89FF;
        }
      }
    }
    .add-size{
      display: flex;
      padding-top: 10px;
      .label{
        width: 70px;
        height: 30px;
        line-height: 30px;
      }
      .input-box{
        display: flex;
        &:last-child{
          margin-left: 20px;
        }
        .input-name{
          width: 20px;
          height: 30px;
          line-height: 30px;
        }
      }
      .number-input{
        width: 115px;
      }
    }
    .recom-size{
      display: flex;
      padding: 15px 0 0 70px;
      flex-wrap: wrap;
      span{
        width: 90px;
        height: 30px;
        line-height: 30px;
        border-radius: 1px;
        background-color: #353239;
        text-align: center;
        margin: 0 10px 10px 0;
        cursor: pointer;
      }
    }
    .add-filename{
      display: flex;
      border-top: 1px solid #040404;
      padding-top: 12px;
      .label{
        width: 70px;
        height: 30px;
        line-height: 30px;
      }
      .file-name-input{
        width: 290px;
      }
    }
    .el-dialog__footer{
      padding: 10px 20px;
    }
    .add-area-button{
      .el-button{
        width: 50px;
        height: 24px;
        padding: 0;
      }
      .button-cancel{
        color: rgba(255,255,255,0.65);
        background-color: transparent;
        border-color: rgba(255,255,255,0.20);
      }
      .button-sure{
        background-color: #3D9FFD;
      }
    }
  }
  .scale-handles {
    position: absolute;
    box-sizing: border-box;
  }
  .scale-handles-tl {
    top: -8px;
    left: -8px;
    cursor: nw-resize;
  }
  .scale-handles-tm {
    top: -8px;
    left: 50%;
    margin-left: -8px;
    cursor: n-resize;
  }
  .scale-handles-tr {
    top: -8px;
    right: -8px;
    cursor: ne-resize;
  }
  .scale-handles-ml {
    top: 50%;
    margin-top: -8px;
    left: -8px;
    cursor: w-resize;
  }
  .scale-handles-mr {
    top: 50%;
    margin-top: -8px;
    right: -8px;
    cursor: e-resize;
  }
  .scale-handles-bl {
    bottom: -8px;
    left: -8px;
    cursor: sw-resize;
  }
  .scale-handles-bm {
    bottom: -8px;
    left: 50%;
    margin-left: -8px;
    cursor: s-resize;
  }
  .scale-handles-br {
    bottom: -8px;
    right: -8px;
    cursor: se-resize;
  }
  .scale-slot{
    width: 16px;
    height: 16px;
    background-color: #fff;
    border-radius: 50%;
  }
  .cut-progress{
    .el-dialog{
      background-color: #1F1F1F;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .el-dialog__title{
      color: #fff;
      font-size: 14px;
    }
    .el-dialog__body{
      padding: 10px 30px 30px;
    }
    .el-progress-bar__outer{
      background-color: #403D47;
    }
    .el-progress__text{
      color: #fff;
      font-size: 14px;
    }
    .show-cut-loading{
      text-align: center;
        color: #fff;
      .el-icon-loading{
        font-size: 30px;
        color: #3D9FFD;
      }
      span{
        display: block;
        padding-top: 10px;
      }
    }
  }
}
</style>
