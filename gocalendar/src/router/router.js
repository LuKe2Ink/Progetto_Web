import { createRouter, createWebHistory } from 'vue-router'

const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (token != null) {
    next();
  } else {
    next('/login');
  }
};

const routes = [
    {
      path: '/',
      alias: '/home',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../pages/CalendarPage.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../pages/UserPage.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import('../pages/GraphPage.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/object',
      name: 'SpecialObject',
      component: () => import('../pages/SpecialObjectPage.vue'),
    },
    {
      path: '/event/type',
      name: 'Event Type',
      component: () => import('../pages/EventTypePage.vue'),
    }
  ]


const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router;