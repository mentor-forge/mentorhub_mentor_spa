import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/{{ service.data_domains.controls[0] | lower }}s'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    {% for item in service.data_domains.controls %}
    // Control domain: {{ item }}
    {
      path: '/{{ item | lower }}s',
      name: '{{ item }}s',
      component: () => import('@/pages/{{ item }}sListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/{{ item | lower }}s/new',
      name: '{{ item }}New',
      component: () => import('@/pages/{{ item }}NewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/{{ item | lower }}s/:id',
      name: '{{ item }}Edit',
      component: () => import('@/pages/{{ item }}EditPage.vue'),
      meta: { requiresAuth: true }
    },
    {% endfor %}
    {% for item in service.data_domains.creates %}
    // Create domain: {{ item }}
    {
      path: '/{{ item | lower }}s',
      name: '{{ item }}s',
      component: () => import('@/pages/{{ item }}sListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/{{ item | lower }}s/new',
      name: '{{ item }}New',
      component: () => import('@/pages/{{ item }}NewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/{{ item | lower }}s/:id',
      name: '{{ item }}View',
      component: () => import('@/pages/{{ item }}ViewPage.vue'),
      meta: { requiresAuth: true }
    },
    {% endfor %}
    {% for item in service.data_domains.consumes %}
    // Consume domain: {{ item }}
    {
      path: '/{{ item | lower }}s',
      name: '{{ item }}s',
      component: () => import('@/pages/{{ item }}sListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/{{ item | lower }}s/:id',
      name: '{{ item }}View',
      component: () => import('@/pages/{{ item }}ViewPage.vue'),
      meta: { requiresAuth: true }
    },
    {% endfor %}
    // Admin route
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Redirect to default page if user doesn't have required role
    next({ name: '{{ service.data_domains.controls[0] }}s' })
    return
  }
  
  next()
})

router.afterEach((to) => {
  document.title = to.path === '/login' ? '{{info.name}} Login' : '{{service.name | capitalize}}'
})

export default router
