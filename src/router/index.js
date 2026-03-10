import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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

export default router
