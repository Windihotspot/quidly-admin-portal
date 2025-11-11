import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ReportsView from '@/views/dashboard/ReportsView.vue'
import ReportsMonthly from '@/views/dashboard/ReportsMonthly.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/reports', name: 'reports', component: ReportsView, meta: { requiresAuth: true } },
    { path: '/reports-monthly', name: 'monthly-reports', component: ReportsMonthly, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
