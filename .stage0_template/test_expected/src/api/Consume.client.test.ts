import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Consume Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all consumes', async () => {
    const mockConsumes = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-consume',
        description: 'Test description',
        status: 'active'
      }
    ]

    const mockResponse = {
      items: mockConsumes,
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

    const result = await api.getConsumes()

    expect(result).toEqual(mockResponse)
  })

  it('should get consumes with name query', async () => {
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

    await api.getConsumes({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/consume?name=test',
      expect.any(Object)
    )
  })

  it('should get a single consume', async () => {
    const mockConsume = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-consume'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockConsume
    })

    const result = await api.getConsume('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockConsume)
  })
})