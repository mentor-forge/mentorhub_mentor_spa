import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'
import type { {{item}}Input } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - {{item}} Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all {{item | lower}}s', async () => {
    const mock{{item}}s = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-{{item | lower}}',
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

    const mockResponse = {
      items: mock{{item}}s,
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

    const result = await api.get{{item}}s()

    expect(result).toEqual(mockResponse)
  })

  it('should get a single {{item | lower}}', async () => {
    const mock{{item}} = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-{{item | lower}}',
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
      json: async () => mock{{item}}
    })

    const result = await api.get{{item}}('507f1f77bcf86cd799439011')

    expect(result).toEqual(mock{{item}})
  })

  it('should create a {{item | lower}}', async () => {
    const input: {{item}}Input = {
      name: 'new-{{item | lower}}',
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

    const result = await api.create{{item}}(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/{{item | lower}}',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input)
      })
    )
  })
})
