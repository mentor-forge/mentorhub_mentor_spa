import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const isAuthenticated = ref(true)
const hasStoredRole = vi.fn()
const redirectToIdpLogin = vi.fn()
const redirectToDiscoveryDashboard = vi.fn()

vi.mock('@mentor-forge/mentorhub_spa_utils', () => ({
  hasStoredRole: (...args: unknown[]) => hasStoredRole(...args),
  redirectToIdpLogin: (...args: unknown[]) => redirectToIdpLogin(...args),
  useAuth: () => ({ isAuthenticated }),
}))

vi.mock('@/composables/useDiscoveryRedirect', () => ({
  redirectToDiscoveryDashboard: (...args: unknown[]) =>
    redirectToDiscoveryDashboard(...args),
}))

vi.mock('@/pages/AdminPage.vue', () => ({
  default: { name: 'AdminPageHost', template: '<div />' },
}))

vi.mock('@/pages/DiscoveryRedirectPage.vue', () => ({
  default: { name: 'DiscoveryRedirectPage', template: '<div />' },
}))

import router from './index'

describe('router /config role gate', () => {
  beforeEach(async () => {
    isAuthenticated.value = true
    hasStoredRole.mockReset()
    redirectToIdpLogin.mockReset()
    redirectToDiscoveryDashboard.mockReset()
    await router.replace('/')
  })

  it('resolves /config to the admin-gated AdminPage host, not the Discovery catch-all', () => {
    const resolved = router.resolve('/config')
    expect(resolved.name).toBe('Admin')
    expect(resolved.meta.requiresAuth).toBe(true)
    expect(resolved.meta.requiresRole).toBe('admin')
    expect(resolved.matched.some((record) => record.name === 'DiscoveryRedirect')).toBe(
      false,
    )
  })

  it('keeps /admin as an alias of /config', () => {
    const resolved = router.resolve('/admin')
    expect(resolved.name).toBe('Admin')
    expect(resolved.meta.requiresRole).toBe('admin')
  })

  it('lets an admin stay on /config', async () => {
    hasStoredRole.mockReturnValue(true)
    await router.push('/config')
    expect(router.currentRoute.value.path).toBe('/config')
    expect(redirectToDiscoveryDashboard).not.toHaveBeenCalled()
    expect(redirectToIdpLogin).not.toHaveBeenCalled()
  })

  it('sends an authenticated non-admin away from /config via Discovery fallback', async () => {
    hasStoredRole.mockReturnValue(false)
    await router.push('/config')
    expect(redirectToDiscoveryDashboard).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.path).not.toBe('/config')
  })
})
