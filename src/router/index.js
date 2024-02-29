import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {path: '/', name: 'Home', component: HomeView},
  {path: '/import', name: 'import', component: () => import('@/views/ImportView.vue')}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active-link'
})

export default router
