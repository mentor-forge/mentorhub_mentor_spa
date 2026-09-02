import { createRouter, createWebHistory } from 'vue-router'
import {
  hasStoredRole,
  redirectToIdpLogin,
  useAuth,
} from '@mentor-forge/mentorhub_spa_utils'
import { redirectToDiscoveryDashboard } from '@/composables/useDiscoveryRedirect'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Control domain: Resource
    {
      path: '/resources/new',
      name: 'ResourceNew',
      component: () => import('@/pages/ResourceNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/resources/:id',
      name: 'ResourceEdit',
      component: () => import('@/pages/ResourceEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Path
    {
      path: '/paths/new',
      name: 'PathNew',
      component: () => import('@/pages/PathNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/paths/:id',
      name: 'PathEdit',
      component: () => import('@/pages/PathEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Plan
    {
      path: '/plans/new',
      name: 'PlanNew',
      component: () => import('@/pages/PlanNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/plans/:id',
      name: 'PlanEdit',
      component: () => import('@/pages/PlanEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Encounter detail (created from Profile Detail)
    {
      path: '/encounters/:id',
      name: 'EncounterEdit',
      component: () => import('@/pages/EncounterEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Profile
    {
      path: '/profiles/:id',
      name: 'ProfileEdit',
      component: () => import('@/pages/ProfileEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Settings / AdminPage host (hamburger hostingConfigHref → /mentor/config)
    {
      path: '/config',
      alias: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },

    // Catch-all route forwarding to Discovery
    {
      path: '/:pathMatch(.*)*',
      name: 'DiscoveryRedirect',
      component: () => import('@/pages/DiscoveryRedirectPage.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    const returnUrl = window.location.origin + import.meta.env.BASE_URL + to.fullPath.replace(/^\//, '')
    redirectToIdpLogin(returnUrl)
    next(false)
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    redirectToDiscoveryDashboard()
    next(false)
    return
  }
  
  next()
})

router.afterEach(() => {
  document.title = 'Mentor'
})

export default router