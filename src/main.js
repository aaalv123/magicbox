import Vue from 'vue';
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Button,
  MessageBox,
  Input,
  Icon,
  Dialog,
  Progress,
  Notification,
} from 'element-ui';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
// 引入公共样式
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import './assets/style/public.css';

Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Button);
Vue.use(Input);
Vue.use(Icon);
Vue.use(Dialog);
Vue.use(Progress);
Vue.prototype.$MessageBox = MessageBox;
Vue.prototype.$notify = Notification;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
