import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/stock/:symbol',
    name: 'StockDetail',
    component: () => import('../views/StockDetailView.vue')
  },
  {
    path: '/predictions',
    name: 'Predictions',
    component: () => import('../views/PredictionsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    if (authStore.isAuthenticated && to.name === 'Login') {
      next('/')
    } else {
      next()
    }
  } else if (!authStore.isAuthenticated && !authStore.loading) {
    next('/login')
  } else {
    next()
  }
})

export default router
