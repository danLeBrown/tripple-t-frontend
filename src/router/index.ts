import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../stores/auth';
import Configuration from '../views/Configuration.vue';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import ThirdParties from '../views/ThirdParties.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/configuration',
      redirect: '/configuration/products',
      meta: { requiresAuth: true },
    },
    {
      path: '/configuration/:tab',
      name: 'configuration',
      component: Configuration,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/third-parties',
      redirect: '/third-parties/suppliers',
      meta: { requiresAuth: true },
    },
    {
      path: '/third-parties/:tab',
      name: 'third-parties',
      component: ThirdParties,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with the original destination as query param
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // If already logged in and trying to access login page, redirect to dashboard
    next('/');
  } else {
    next();
  }
});

export default router;
