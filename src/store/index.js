import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    language: '',
    output: '',
    resolution: [],
  },
  mutations: {
    setAppConfig(state, config) {
      state.language = config.language;
      state.output = config.output;
      state.resolution = config.resolution;
    },
    changeLanguage(state, language) {
      state.language = language;
    },
  },
  actions: {
  },
  modules: {
  },
});
