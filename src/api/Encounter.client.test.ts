import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError } from './client'
import type { EncounterInput, EncounterUpdate } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Encounter Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all encounters', async () => {
    const mockEncounters = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-encounter',
        description: 'Test description',
        status: 'active' as const,
        created: {
          from_ip: '127.0.0.1',
          by_user: 'user1',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        },
        saved: {
          from_ip: '127.0.0.1',
          by_user: 'user1',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
    ]

    const mockResponse = {
      items: mockEncounters,
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

    const result = await api.getEncounters()

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith('/api/encounter', expect.any(Object))
  })

  it('should get encounters with name query', async () => {
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

    await api.getEncounters({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/encounter?name=test',
      expect.any(Object)
    )
  })

  it('should get a single encounter', async () => {
    const mockEncounter = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-encounter',
      status: 'active' as const,
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockEncounter
    })

    const result = await api.getEncounter('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockEncounter)
  })

  it('should create a encounter', async () => {
    const input: EncounterInput = {
      name: 'new-encounter',
      description: 'New description',
      status: 'active'
    }

    const mockResponse = { _id: '507f1f77bcf86cd799439011' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    const result = await api.createEncounter(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/encounter',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input)
      })
    )
  })

  it('should update a encounter', async () => {
    const update: EncounterUpdate = { name: 'updated-name' }

    const mockEncounter = {
      _id: '507f1f77bcf86cd799439011',
      name: 'updated-name',
      status: 'active' as const,
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockEncounter
    })

    const result = await api.updateEncounter('507f1f77bcf86cd799439011', update)

    expect(result).toEqual(mockEncounter)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/encounter/507f1f77bcf86cd799439011',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(update)
      })
    )
  })

  it('should handle 404 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Resource not found' })
    })

    await expect(api.getEncounter('invalid-id')).rejects.toThrow(ApiError)
  })

  it('should handle 401 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' })
    })

    await expect(api.getEncounters()).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.getEncounters()).rejects.toThrow('Network error')
  })
})