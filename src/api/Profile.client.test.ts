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

  it('should get composite profile detail', async () => {
    const mockProfileDetail = {
      profile: {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-profile',
        full_name: 'Test Profile',
        email: 'test@example.com',
        status: 'active',
      },
      mentee: {
        _id: '507f1f77bcf86cd799439013',
        profile_id: '507f1f77bcf86cd799439011',
        notes: 'Mentor notes',
        created: {
          from_ip: '127.0.0.1',
          by_user: 'marti',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'abc',
        },
        saved: {
          from_ip: '127.0.0.1',
          by_user: 'marti',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'abc',
        },
      },
      encounters: [],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfileDetail,
    })

    const result = await api.getProfile('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockProfileDetail)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile/507f1f77bcf86cd799439011',
      expect.any(Object),
    )
  })

  it('should update mentee notes', async () => {
    const updatedMentee = {
      _id: '507f1f77bcf86cd799439013',
      profile_id: '507f1f77bcf86cd799439011',
      notes: 'Updated notes',
      created: {
        from_ip: '127.0.0.1',
        by_user: 'marti',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'abc',
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'marti',
        at_time: '2024-01-02T00:00:00Z',
        correlation_id: 'def',
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => updatedMentee,
    })

    const result = await api.updateMentee('507f1f77bcf86cd799439013', { notes: 'Updated notes' })

    expect(result).toEqual(updatedMentee)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/mentee/507f1f77bcf86cd799439013',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ notes: 'Updated notes' }),
      }),
    )
  })

  it('should get profile properties', async () => {
    const mockProperties = {
      profile: {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-mentee',
        goals: ['Learn TypeScript'],
        interests: ['api'],
      },
      status_summary: {
        library_count: 2,
        now_count: 1,
        next_count: 3,
        encounters_count: 1,
        resources_engaged: 4,
      },
      sites_and_links: [
        {
          resource_id: '507f1f77bcf86cd799439020',
          name: 'Vue Guide',
          scope: 'now',
          url: 'https://example.com/vue',
        },
      ],
      mentor_history: [],
      resource_usage: [],
      celebrations: [
        {
          resource_id: '507f1f77bcf86cd799439021',
          name: 'Completed Resource',
          completed_at: '2024-01-10T10:00:00Z',
        },
      ],
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

  it('should get mentee notes by profile id', async () => {
    const mockMentee = {
      _id: '507f1f77bcf86cd799439013',
      profile_id: '507f1f77bcf86cd799439011',
      notes: 'Mentor notes',
      created: {
        from_ip: '127.0.0.1',
        by_user: 'marti',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'abc',
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'marti',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'abc',
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockMentee,
    })

    const result = await api.getMentee('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockMentee)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/mentee/507f1f77bcf86cd799439011',
      expect.any(Object),
    )
  })
})
