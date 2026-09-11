import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError } from './client'
import type { EncounterInput, EncounterUpdate, ScheduleEncounterInput } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Encounter Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get a single encounter', async () => {
    const mockEncounter = {
      _id: '507f1f77bcf86cd799439011',
      mentor_id: '507f1f77bcf86cd799439012',
      mentee_id: '507f1f77bcf86cd799439013',
      plan_id: '507f1f77bcf86cd799439014',
      status: 'active' as const,
      agenda: [{ step: 'Review homework', checked: false }],
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123',
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123',
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockEncounter,
    })

    const result = await api.getEncounter('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockEncounter)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter/507f1f77bcf86cd799439011',
      expect.any(Object),
    )
  })

  it('should create a encounter', async () => {
    const input: EncounterInput = {
      mentor_id: '507f1f77bcf86cd799439012',
      mentee_id: '507f1f77bcf86cd799439013',
      plan_id: '507f1f77bcf86cd799439014',
      status: 'active',
    }

    const mockResponse = { _id: '507f1f77bcf86cd799439011' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse,
    })

    const result = await api.createEncounter(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })

  it('should update a encounter', async () => {
    const update: EncounterUpdate = { tldr: 'Updated summary' }

    const mockEncounter = {
      _id: '507f1f77bcf86cd799439011',
      tldr: 'Updated summary',
      status: 'active' as const,
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123',
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123',
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockEncounter,
    })

    const result = await api.updateEncounter('507f1f77bcf86cd799439011', update)

    expect(result).toEqual(mockEncounter)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter/507f1f77bcf86cd799439011',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(update),
      }),
    )
  })

  it('should handle 404 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Resource not found' }),
    })

    await expect(api.getEncounter('invalid-id')).rejects.toThrow(ApiError)
  })

  it('should handle 401 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' }),
    })

    await expect(api.getEncounter('507f1f77bcf86cd799439011')).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.getEncounter('507f1f77bcf86cd799439011')).rejects.toThrow('Network error')
  })

  it('should schedule encounters', async () => {
    const input: ScheduleEncounterInput = {
      mentor_id: '507f1f77bcf86cd799439012',
      mentee_id: '507f1f77bcf86cd799439013',
      plan_id: '507f1f77bcf86cd799439014',
      start_date: '2024-02-01',
      day_of_week: 1,
      time_of_day: '14:00',
      recurrence_days: 7,
      count: 4,
    }

    const mockScheduled = [
      {
        _id: '507f1f77bcf86cd799439011',
        mentor_id: '507f1f77bcf86cd799439012',
        mentee_id: '507f1f77bcf86cd799439013',
        plan_id: '507f1f77bcf86cd799439014',
        status: 'scheduled' as const,
        appointment: { from: '2024-02-01T14:00:00Z', to: '2024-02-01T15:00:00Z' },
        created: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
        saved: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockScheduled,
    })

    const result = await api.scheduleEncounters(input)

    expect(result).toEqual(mockScheduled)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter/schedule',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })

  it('should start an encounter', async () => {
    const mockStarted = {
      _id: '507f1f77bcf86cd799439011',
      status: 'active' as const,
      created: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
      saved: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockStarted,
    })

    const result = await api.startEncounter('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockStarted)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter/507f1f77bcf86cd799439011/start',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('should finish an encounter', async () => {
    const mockFinished = {
      _id: '507f1f77bcf86cd799439011',
      status: 'complete' as const,
      created: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
      saved: { from_ip: '127.0.0.1', by_user: 'u1', at_time: '2024-01-01T00:00:00Z', correlation_id: 'c1' },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockFinished,
    })

    const result = await api.finishEncounter('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockFinished)
    expect(mockFetch).toHaveBeenCalledWith(
      '/mentor/api/encounter/507f1f77bcf86cd799439011/finish',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('should handle startEncounter error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ error: 'Forbidden' }),
    })

    await expect(api.startEncounter('507f1f77bcf86cd799439011')).rejects.toThrow(ApiError)
  })
})

