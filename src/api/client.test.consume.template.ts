import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

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
        status: 'active'
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

  it('should get {{item | lower}}s with name query', async () => {
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

    await api.get{{item}}s({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/{{item | lower}}?name=test',
      expect.any(Object)
    )
  })

  it('should get a single {{item | lower}}', async () => {
    const mock{{item}} = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-{{item | lower}}'
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
})
