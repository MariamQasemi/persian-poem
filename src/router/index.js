import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PoetDetailPage from '../views/PoetDetailPage.vue'
import PoemDetailPage from '../views/PoemDetailPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/poet/:id',
    name: 'PoetDetail',
    component: PoetDetailPage,
    props: true
  },
  {
    path: '/poem/:id',
    name: 'PoemDetail',
    component: PoemDetailPage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory('/poems'), 
  routes
})

export default router
