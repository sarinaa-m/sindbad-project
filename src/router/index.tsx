// router/index.ts
import TableComponent from '../components/TableComponent.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Reports',
    component: TableComponent,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL as string), // Use HTML5 history mode
  routes,
});

export default router;
