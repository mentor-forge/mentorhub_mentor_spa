import { describe, it, expect } from 'vitest'
import type {
  Error,
  Breadcrumb,
  Control,
  ControlInput,
  ControlUpdate,
  Create,
  CreateInput,
  Consume,
  ConfigResponse,
  InfiniteScrollParams,
  InfiniteScrollResponse
} from './types'

describe('API Types', () => {
  describe('Error', () => {
    it('should match Error interface', () => {
      const error: Error = {
        error: 'Test error message'
      }
      
      expect(error.error).toBe('Test error message')
    })
  })

  describe('Breadcrumb', () => {
    it('should match Breadcrumb interface', () => {
      const breadcrumb: Breadcrumb = {
        from_ip: '192.168.1.1',
        by_user: 'user-123',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-abc123'
      }
      
      expect(breadcrumb.from_ip).toBe('192.168.1.1')
      expect(breadcrumb.by_user).toBe('user-123')
      expect(breadcrumb.at_time).toBe('2024-01-01T00:00:00Z')
      expect(breadcrumb.correlation_id).toBe('corr-abc123')
    })
  })

  describe('Control', () => {
    it('should match Control interface with all fields', () => {
      const control: Control = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-control',
        description: 'Test description',
        status: 'active',
        created: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        },
        saved: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
      
      expect(control._id).toBe('507f1f77bcf86cd799439011')
      expect(control.name).toBe('test-control')
      expect(control.description).toBe('Test description')
      expect(control.status).toBe('active')
    })

    it('should match Control interface with optional fields', () => {
      const control: Control = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-control',
        created: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        },
        saved: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
      
      expect(control.name).toBe('test-control')
      expect(control.description).toBeUndefined()
      expect(control.status).toBeUndefined()
    })

    it('should accept archived status', () => {
      const control: Control = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-control',
        status: 'archived',
        created: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        },
        saved: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
      
      expect(control.status).toBe('archived')
    })
  })

  describe('ControlInput', () => {
    it('should match ControlInput interface', () => {
      const input: ControlInput = {
        name: 'test-control',
        description: 'Test description',
        status: 'active'
      }
      
      expect(input.name).toBe('test-control')
      expect(input.description).toBe('Test description')
      expect(input.status).toBe('active')
    })

    it('should allow optional fields', () => {
      const input: ControlInput = {
        name: 'test-control'
      }
      
      expect(input.name).toBe('test-control')
      expect(input.description).toBeUndefined()
      expect(input.status).toBeUndefined()
    })
  })

  describe('ControlUpdate', () => {
    it('should match ControlUpdate interface with partial fields', () => {
      const update: ControlUpdate = {
        name: 'updated-control'
      }
      
      expect(update.name).toBe('updated-control')
    })

    it('should allow all fields to be optional', () => {
      const update: ControlUpdate = {}
      
      expect(update.name).toBeUndefined()
      expect(update.description).toBeUndefined()
      expect(update.status).toBeUndefined()
    })
  })

  describe('Create', () => {
    it('should match Create interface', () => {
      const create: Create = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-create',
        description: 'Test description',
        status: 'active',
        created: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
      
      expect(create._id).toBe('507f1f77bcf86cd799439011')
      expect(create.name).toBe('test-create')
      expect(create.status).toBe('active')
    })
  })

  describe('CreateInput', () => {
    it('should match CreateInput interface', () => {
      const input: CreateInput = {
        name: 'test-create',
        description: 'Test description',
        status: 'active'
      }
      
      expect(input.name).toBe('test-create')
      expect(input.description).toBe('Test description')
      expect(input.status).toBe('active')
    })
  })

  describe('Consume', () => {
    it('should match Consume interface', () => {
      const consume: Consume = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-consume',
        description: 'Test description',
        status: 'active'
      }
      
      expect(consume._id).toBe('507f1f77bcf86cd799439011')
      expect(consume.name).toBe('test-consume')
      expect(consume.status).toBe('active')
    })
  })

  describe('ConfigResponse', () => {
    it('should match ConfigResponse interface', () => {
      const config: ConfigResponse = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: {
          claims: {
            sub: 'user-123',
            roles: ['admin']
          }
        }
      }
      
      expect(config.config_items).toEqual([])
      expect(config.versions).toEqual([])
      expect(config.enumerators).toEqual([])
      expect(config.token?.claims).toEqual({
        sub: 'user-123',
        roles: ['admin']
      })
    })

    it('should allow optional token field', () => {
      const config: ConfigResponse = {
        config_items: [],
        versions: [],
        enumerators: []
      }
      
      expect(config.token).toBeUndefined()
    })
  })

  describe('InfiniteScrollParams', () => {
    it('should match InfiniteScrollParams interface with all fields', () => {
      const params: InfiniteScrollParams = {
        name: 'test',
        after_id: '507f1f77bcf86cd799439011',
        limit: 20,
        sort_by: 'name',
        order: 'asc'
      }
      
      expect(params.name).toBe('test')
      expect(params.after_id).toBe('507f1f77bcf86cd799439011')
      expect(params.limit).toBe(20)
      expect(params.sort_by).toBe('name')
      expect(params.order).toBe('asc')
    })

    it('should allow optional fields', () => {
      const params: InfiniteScrollParams = {}
      
      expect(params.name).toBeUndefined()
      expect(params.after_id).toBeUndefined()
      expect(params.limit).toBeUndefined()
      expect(params.sort_by).toBeUndefined()
      expect(params.order).toBeUndefined()
    })

    it('should accept desc order', () => {
      const params: InfiniteScrollParams = {
        order: 'desc'
      }
      
      expect(params.order).toBe('desc')
    })
  })

  describe('InfiniteScrollResponse', () => {
    it('should match InfiniteScrollResponse interface', () => {
      const response: InfiniteScrollResponse<Control> = {
        items: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'test-control',
            created: {
              from_ip: '192.168.1.1',
              by_user: 'user-123',
              at_time: '2024-01-01T00:00:00Z',
              correlation_id: 'corr-123'
            },
            saved: {
              from_ip: '192.168.1.1',
              by_user: 'user-123',
              at_time: '2024-01-01T00:00:00Z',
              correlation_id: 'corr-123'
            }
          }
        ],
        limit: 20,
        has_more: true,
        next_cursor: '507f1f77bcf86cd799439011'
      }
      
      expect(response.items).toHaveLength(1)
      expect(response.limit).toBe(20)
      expect(response.has_more).toBe(true)
      expect(response.next_cursor).toBe('507f1f77bcf86cd799439011')
    })

    it('should allow null next_cursor when no more items', () => {
      const response: InfiniteScrollResponse<Create> = {
        items: [],
        limit: 20,
        has_more: false,
        next_cursor: null
      }
      
      expect(response.has_more).toBe(false)
      expect(response.next_cursor).toBeNull()
    })

    it('should be generic over item type', () => {
      const controlResponse: InfiniteScrollResponse<Control> = {
        items: [],
        limit: 20,
        has_more: false,
        next_cursor: null
      }
      
      const createResponse: InfiniteScrollResponse<Create> = {
        items: [],
        limit: 20,
        has_more: false,
        next_cursor: null
      }
      
      expect(controlResponse.items).toEqual([])
      expect(createResponse.items).toEqual([])
    })
  })
})
