import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
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
    component: () => import('../views/PredictionsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  let authStore
  try {
    authStore = useAuthStore()
  } catch {
    next()
    return
  }

  // 로그인 페이지: 이미 인증된 유저는 대시보드로
  if (to.name === 'Login') {
    if (authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 인증 필요한 페이지: 비회원이면 로그인으로
  if (to.meta.requiresAuth && !authStore.isAuthenticated && !authStore.loading) {
    next('/login')
    return
  }

  next()
})

export default router
