import { createRouter, createWebHistory } from 'vue-router'

const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  console.log(token);
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
      component: () => import('../components/HomeComponent.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../pages/CalendarComponent.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import('../components/GraphComponent.vue'),
      beforeEnter: requireAuth
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/RegisterComponent.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/object',
      name: 'SpecialObject',
      component: () => import('../components/SpecialObjectComponent.vue'),
    },
    {
      path: '/event/type',
      name: 'Event Type',
      component: () => import('../components/EventTypeComponent.vue'),
    }
  ]


const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router;