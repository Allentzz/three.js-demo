import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/1',
    name: 'threeTest1',
    component: () => import('../views/threeTest1.vue')
  },
  {
    path: '/2',
    name: 'threeTest2',
    component: () => import('../views/threeTest2.vue')
  },
  {
    path: '/3',
    name: 'threeTest3',
    component: () => import('../views/threeTest3.vue')
  },
  {
    path: '/4',
    name: 'threeTest4',
    component: () => import('../views/threeTest4.vue')
  },
  {
    path: '/5',
    name: 'threeTest5',
    component: () => import('../views/threeTest5.vue')
  },
  {
    path: '/6',
    name: 'threeTest6',
    component: () => import('../views/threeTest6.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router