import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRoles } from './useRoles'
import { useAuth } from './useAuth'
import { useConfig } from './useConfig'

vi.mock('./useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('./useConfig', () => ({
  useConfig: vi.fn()
}))

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return roles from auth when available', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: true },
      roles: { value: ['admin', 'developer'] },
      logout: vi.fn(),
    })
    vi.mocked(useConfig).mockReturnValue({
      config: { value: null },
      isLoading: { value: false },
      error: { value: null },
      loadConfig: vi.fn(),
      getEnumeratorValues: vi.fn(),
      getDropdownItems: vi.fn(),
      findCollectionVersion: vi.fn(),
    })

    const { roles, hasRole } = useRoles()

    expect(roles.value).toEqual(['admin', 'developer'])
    expect(hasRole('admin').value).toBe(true)
    expect(hasRole('developer').value).toBe(true)
    expect(hasRole('user').value).toBe(false)
  })

  it('should use config token roles when auth roles are not available', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: true },
      roles: { value: [] },
      logout: vi.fn(),
    })
    vi.mocked(useConfig).mockReturnValue({
      config: { 
        value: {
          token: {
            roles: ['admin', 'user']
          }
        }
      },
      isLoading: { value: false },
      error: { value: null },
      loadConfig: vi.fn(),
      getEnumeratorValues: vi.fn(),
      getDropdownItems: vi.fn(),
      findCollectionVersion: vi.fn(),
    })

    const { roles, hasRole } = useRoles()

    expect(roles.value).toEqual(['admin', 'user'])
    expect(hasRole('admin').value).toBe(true)
    expect(hasRole('user').value).toBe(true)
  })

  it('should return empty array when no roles available', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: true },
      roles: { value: [] },
      logout: vi.fn(),
    })
    vi.mocked(useConfig).mockReturnValue({
      config: { value: null },
      isLoading: { value: false },
      error: { value: null },
      loadConfig: vi.fn(),
      getEnumeratorValues: vi.fn(),
      getDropdownItems: vi.fn(),
      findCollectionVersion: vi.fn(),
    })

    const { roles, hasRole } = useRoles()

    expect(roles.value).toEqual([])
    expect(hasRole('admin').value).toBe(false)
  })

  it('should check for any role with hasAnyRole', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: { value: true },
      roles: { value: ['admin'] },
      logout: vi.fn(),
    })
    vi.mocked(useConfig).mockReturnValue({
      config: { value: null },
      isLoading: { value: false },
      error: { value: null },
      loadConfig: vi.fn(),
      getEnumeratorValues: vi.fn(),
      getDropdownItems: vi.fn(),
      findCollectionVersion: vi.fn(),
    })

    const { hasAnyRole } = useRoles()

    expect(hasAnyRole(['admin', 'user']).value).toBe(true)
    expect(hasAnyRole(['developer', 'user']).value).toBe(false)
  })
})
