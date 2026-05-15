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

  it('should get all profiles', async () => {
    const mockProfiles = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-profile',
        description: 'Test description',
        status: 'active'
      }
    ]

    const mockResponse = {
      items: mockProfiles,
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    const result = await api.getProfiles()

    expect(result).toEqual(mockResponse)
  })

  it('should get profiles with name query', async () => {
    const mockResponse = {
      items: [],
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    await api.getProfiles({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile?name=test',
      expect.any(Object)
    )
  })

  it('should get a single profile', async () => {
    const mockProfile = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-profile'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfile
    })

    const result = await api.getProfile('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockProfile)
  })
})