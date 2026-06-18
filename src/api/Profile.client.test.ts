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

  it('should get a single profile detail', async () => {
    const mockDetail = {
      profile: {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-profile',
      },
      mentee: {
        _id: '507f1f77bcf86cd7994390bb',
        profile_id: '507f1f77bcf86cd799439011',
        notes: 'mentor notes',
      },
      encounters: [],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockDetail,
    })

    const result = await api.getProfile('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockDetail)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile/507f1f77bcf86cd799439011',
      expect.any(Object),
    )
  })

  it('should get profile properties', async () => {
    const mockProperties = {
      profile: { _id: '507f1f77bcf86cd799439011', name: 'test-profile' },
      status_summary: {
        library_count: 1,
        now_count: 0,
        next_count: 0,
        encounters_count: 0,
        resources_engaged: 1,
      },
      sites_and_links: [],
      mentor_history: [],
      journey: null,
      path: null,
      resource_usage: [],
      celebrations: [],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProperties,
    })

    const result = await api.getProfileProperties('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockProperties)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile/507f1f77bcf86cd799439011/properties',
      expect.any(Object),
    )
  })
})
