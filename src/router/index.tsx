import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL as string), // Use HTML5 history mode
  routes,
});

export default router;
