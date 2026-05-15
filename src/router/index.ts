import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/resources'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false }
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
    
    // Control domain: Encounter
    {
      path: '/encounters',
      name: 'Encounters',
      component: () => import('@/pages/EncountersListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/encounters/new',
      name: 'EncounterNew',
      component: () => import('@/pages/EncounterNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/encounters/:id',
      name: 'EncounterEdit',
      component: () => import('@/pages/EncounterEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    
    // Create domain: Event
    {
      path: '/events',
      name: 'Events',
      component: () => import('@/pages/EventsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/new',
      name: 'EventNew',
      component: () => import('@/pages/EventNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id',
      name: 'EventView',
      component: () => import('@/pages/EventViewPage.vue'),
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
      name: 'ProfileView',
      component: () => import('@/pages/ProfileViewPage.vue'),
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
    next({ name: 'Resources' })
    return
  }
  
  next()
})

router.afterEach((to) => {
  document.title = to.path === '/login' ? 'Mentor Hub Login' : 'Mentor'
})

export default router