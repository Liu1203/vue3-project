import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',          // 根路径重定向到首页
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/article/ArchiveView.vue'),
  },
  {
    path: '/thoughts',
    name: 'thoughts',
    component: () => import('@/views/article/ThoughtsView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about/AboutView.vue'),
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('@/views/article/ArticleView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from) => {
  if (to.path === '/login') {
    const token = localStorage.getItem('token')
    if (token) {
      return '/home'
    }
  }
})

export default router