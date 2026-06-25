import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'
import type { EventInput } from './types'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Event POST', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should create an event', async () => {
    const input: EventInput = {
      name: 'login',
      description: 'New description',
      status: 'active',
    }

    const mockResponse = { _id: '507f1f77bcf86cd799439011' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: (name: string) => (name === 'content-length' ? '100' : null) },
      json: async () => mockResponse,
    })

    const result = await api.createEvent(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/event',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })
})
