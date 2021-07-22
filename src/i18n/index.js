import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhElement from 'element-ui/lib/locale/lang/zh-CN';
import enElement from 'element-ui/lib/locale/lang/en';
import jaElement from 'element-ui/lib/locale/lang/ja';
import ElementLocale from 'element-ui/lib/locale';
import store from '@/store';
import zh from './lang/zh';
import en from './lang/en';
import ja from './lang/ja';

Vue.use(VueI18n);

// 国际化配置
const messages = {
  zh: { MESSAGE: zh, ...zhElement },
  en: { MESSAGE: en, ...enElement },
  ja: { MESSAGE: ja, ...jaElement },
};
// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: store.state.language, // set locale
  messages, // set locale messages
});
ElementLocale.i18n((key, value) => i18n.t(key, value));

export default i18n;
