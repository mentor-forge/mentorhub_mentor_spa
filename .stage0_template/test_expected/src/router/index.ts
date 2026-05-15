import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/controls'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    
    // Control domain: Control
    {
      path: '/controls',
      name: 'Controls',
      component: () => import('@/pages/ControlsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/controls/new',
      name: 'ControlNew',
      component: () => import('@/pages/ControlNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/controls/:id',
      name: 'ControlEdit',
      component: () => import('@/pages/ControlEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Create domain: Create
    {
      path: '/creates',
      name: 'Creates',
      component: () => import('@/pages/CreatesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/creates/new',
      name: 'CreateNew',
      component: () => import('@/pages/CreateNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/creates/:id',
      name: 'CreateView',
      component: () => import('@/pages/CreateViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Consume domain: Consume
    {
      path: '/consumes',
      name: 'Consumes',
      component: () => import('@/pages/ConsumesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/consumes/:id',
      name: 'ConsumeView',
      component: () => import('@/pages/ConsumeViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
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
    next({ name: 'Controls' })
    return
  }
  
  next()
})

router.afterEach((to) => {
  document.title = to.path === '/login' ? 'Mentor Hub Login' : 'Sample'
})

export default router