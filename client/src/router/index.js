// Composables
import { createRouter, createWebHistory } from 'vue-router'
import homeView from '../views/homeView.vue'
import recipePanel from '../views/recipePanel.vue'
import controlPanel from '../views/controlPanel.vue'

const routes = [
  {
    path: '/',
    name: 'homeView',
    component: homeView
  },
  {
    path: '/recipePanel',
    name: 'recipePanel',
    component: recipePanel
  },
  {
    path: '/controlPanel',
    name: 'controlPanel',
    component: controlPanel
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
