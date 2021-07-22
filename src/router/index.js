import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Cutting.vue'),
  },
  {
    path: '/cutting',
    name: 'Cutting',
    component: () => import('../views/Cutting.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
