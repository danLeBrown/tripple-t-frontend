import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Configuration from '../views/Configuration.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/configuration',
      redirect: '/configuration/products',
    },
    {
      path: '/configuration/:tab',
      name: 'configuration',
      component: Configuration,
      props: true,
    },
  ],
});

export default router;

