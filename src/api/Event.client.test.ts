import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'
import type { EventInput } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Event Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all events', async () => {
    const mockEvents = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-event',
        description: 'Test description',
        status: 'active',
        created: {
          from_ip: '127.0.0.1',
          by_user: 'user1',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockEvents
    })

    const result = await api.getEvents()

    expect(result).toEqual(mockEvents)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/event',
      expect.objectContaining({
        headers: expect.objectContaining({ offset: '0', size: '20' })
      })
    )
  })

  it('should get events with query filters and pagination headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => []
    })

    await api.getEvents({
      type: 'login',
      profile_id: '507f1f77bcf86cd799439011',
      offset: 20,
      size: 10,
      sort_by: 'created.at_time',
      order: 'desc'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/event?type=login&profile_id=507f1f77bcf86cd799439011&sort_by=created.at_time&order=desc',
      expect.objectContaining({
        headers: expect.objectContaining({ offset: '20', size: '10' })
      })
    )
  })

  it('should get a single event', async () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-event',
      created: {
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
      json: async () => mockEvent
    })

    const result = await api.getEvent('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockEvent)
  })

  it('should create a event', async () => {
    const input: EventInput = {
      name: 'new-event',
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

    const result = await api.createEvent(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/event',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input)
      })
    )
  })
})