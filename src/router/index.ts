import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ReportsView from '@/views/dashboard/ReportsView.vue'
import ReportsMonthly from '@/views/dashboard/ReportsMonthly.vue'



const router = createRouter({
  history: createWebHistory('/'),
  routes: [
   
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView
    },
    {
      path: '/reports-monthly',
      name: 'monthly-reports',
      component: ReportsMonthly
    },
   
  ]
})

export default router
