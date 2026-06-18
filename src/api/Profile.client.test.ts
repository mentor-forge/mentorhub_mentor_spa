import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Profile Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get mentor dashboard profiles', async () => {
    const mockProfiles = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-mentee',
        description: 'Test description',
        progress: { library: 2, now: 1, next: 3 },
        last_encounter: {
          _id: '507f1f77bcf86cd799439012',
          date: '2024-01-15T10:00:00Z',
          tldr: 'Quick check-in',
        },
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfiles,
    })

    const result = await api.getProfiles()

    expect(result).toEqual(mockProfiles)
    expect(mockFetch).toHaveBeenCalledWith('/api/profile', expect.any(Object))
  })

  it('should get a single profile', async () => {
    const mockProfile = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-profile',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfile,
    })

    const result = await api.getProfile('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile/507f1f77bcf86cd799439011',
      expect.any(Object),
    )
  })
})
