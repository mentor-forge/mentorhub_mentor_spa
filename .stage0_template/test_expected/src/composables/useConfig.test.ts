import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfig } from './useConfig'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: {
    getConfig: vi.fn()
  }
}))

describe('useConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      const mockConfig = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, config, isLoading } = useConfig()

      expect(isLoading.value).toBe(false)
      
      const result = await loadConfig()

      expect(result).toEqual(mockConfig)
      expect(config.value).toEqual(mockConfig)
      expect(isLoading.value).toBe(false)
    })

    it('should handle load config failure', async () => {
      const mockError = new Error('Failed to load config')
      vi.mocked(api.getConfig).mockRejectedValueOnce(mockError)

      const { loadConfig, error } = useConfig()

      await expect(loadConfig()).rejects.toThrow('Failed to load config')
      expect(error.value).toBe(mockError)
    })
  })

  describe('findCollectionVersion', () => {
    it('should find collection version', async () => {
      const mockConfig = {
        config_items: [],
        versions: [
          { collection_name: 'TestCollection', current_version: '0.1.0.1' }
        ],
        enumerators: [],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, findCollectionVersion } = useConfig()
      await loadConfig()

      const version = findCollectionVersion('TestCollection')
      expect(version).toBe('0.1.0.1')
    })

    it('should return null for non-existent collection', async () => {
      const mockConfig = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, findCollectionVersion } = useConfig()
      await loadConfig()

      const version = findCollectionVersion('NonExistent')
      expect(version).toBeNull()
    })
  })

  describe('getEnumeratorValues', () => {
    it('should get enumerator values for collection', async () => {
      const mockConfig = {
        config_items: [],
        versions: [
          { collection_name: 'TestCollection', current_version: '0.1.0.1' }
        ],
        enumerators: [
          {
            version: 1,
            enumerators: [
              {
                name: 'status',
                values: [
                  { value: 'active', description: 'Active status' },
                  { value: 'inactive', description: 'Inactive status' }
                ]
              }
            ]
          }
        ],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, getEnumeratorValues } = useConfig()
      await loadConfig()

      const values = getEnumeratorValues('TestCollection', 'status')
      expect(values).toEqual([
        { value: 'active', description: 'Active status' },
        { value: 'inactive', description: 'Inactive status' }
      ])
    })

    it('should return empty array for non-existent enumerator', async () => {
      const mockConfig = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, getEnumeratorValues } = useConfig()
      await loadConfig()

      const values = getEnumeratorValues('TestCollection', 'status')
      expect(values).toEqual([])
    })
  })

  describe('getDropdownItems', () => {
    it('should get dropdown items for enumerator', async () => {
      const mockConfig = {
        config_items: [],
        versions: [
          { collection_name: 'TestCollection', current_version: '0.1.0.1' }
        ],
        enumerators: [
          {
            version: 1,
            enumerators: [
              {
                name: 'status',
                values: [
                  { value: 'active', description: 'Active status' },
                  { value: 'inactive', description: 'Inactive status' }
                ]
              }
            ]
          }
        ],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, getDropdownItems } = useConfig()
      await loadConfig()

      const items = getDropdownItems('TestCollection', 'status')
      expect(items).toEqual([
        { title: 'active', value: 'active' },
        { title: 'inactive', value: 'inactive' }
      ])
    })
  })
})
