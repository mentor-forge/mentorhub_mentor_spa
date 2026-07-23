import { createRouter, createWebHistory } from 'vue-router'
import {
  hasStoredRole,
  redirectToIdpLogin,
  useAuth,
} from '@mentor-forge/mentorhub_spa_utils'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/profiles'
    },
    
    // Control domain: Resource
    {
      path: '/resources',
      name: 'Resources',
      component: () => import('@/pages/ResourcesListPage.vue'),
      meta: { requiresAuth: true }
    },
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
      path: '/paths',
      name: 'Paths',
      component: () => import('@/pages/PathsListPage.vue'),
      meta: { requiresAuth: true }
    },
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
      path: '/plans',
      name: 'Plans',
      component: () => import('@/pages/PlansListPage.vue'),
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
      path: '/encounters',
      redirect: '/profiles',
    },
    {
      path: '/encounters/:id',
      name: 'EncounterEdit',
      component: () => import('@/pages/EncounterEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Consume domain: Profile
    {
      path: '/profiles',
      name: 'Profiles',
      component: () => import('@/pages/ProfilesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profiles/:id',
      name: 'ProfileEdit',
      component: () => import('@/pages/ProfileEditPage.vue'),
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
    redirectToIdpLogin(window.location.origin + to.fullPath)
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Redirect to default page if user doesn't have required role
    next({ name: 'Profiles' })
    return
  }
  
  next()
})

router.afterEach(() => {
  document.title = 'Mentor'
})

export default router