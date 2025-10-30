import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/dashboard/DashboardView.vue'



const router = createRouter({
  history: createWebHistory('/quidly-admin-portal'),
  routes: [
   
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
   
  ]
})

export default router
