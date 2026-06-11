import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'
import { api } from './client'

vi.mock('@mentor-forge/mentorhub_spa_utils', () => ({
  redirectToIdpLogin: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.mocked(redirectToIdpLogin).mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Config', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'test-token')
    })

    it('should fetch config successfully', async () => {
      const mockConfig = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: { claims: {} }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) => name === 'content-length' ? '100' : null
        },
        json: async () => mockConfig
      })

      const result = await api.getConfig()

      expect(result).toEqual(mockConfig)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/config',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('401 Unauthorized Handling', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'invalid-token')
      localStorage.setItem('token_expires_at', '2026-12-31T23:59:59Z')
    })

    it('should clear tokens and redirect on 401 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' })
      })

      try {
        await api.getConfig()
      } catch {
        // Error is expected to be thrown
      }

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('token_expires_at')).toBeNull()
      expect(redirectToIdpLogin).toHaveBeenCalledOnce()
    })
  })
})
