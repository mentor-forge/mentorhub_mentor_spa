import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfig } from './useConfig'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: {
    getConfig: vi.fn()
  }
}))

describe('useConfig', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.mocked(api.getConfig).mockResolvedValueOnce({
      config_items: [],
      versions: [],
      enumerators: [],
      token: {}
    } as any)
    const { loadConfig } = useConfig()
    await loadConfig()
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
          { collection_name: 'TestCollection', current_version: '0.1.0.1' },
          { name: 'AltCollection', version: '0.2.0.2' },
          null as any,
        ],
        enumerators: [],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, findCollectionVersion } = useConfig()
      await loadConfig()

      expect(findCollectionVersion('TestCollection')).toBe('0.1.0.1')
      expect(findCollectionVersion('AltCollection')).toBe('0.2.0.2')
      expect(findCollectionVersion('NonExistent')).toBeNull()
    })

    it('should return null for non-existent collection with empty config', () => {
      const { findCollectionVersion } = useConfig()
      expect(findCollectionVersion('TestCollection')).toBeNull()
    })
  })

  describe('getEnumeratorValues', () => {
    it('should get enumerator values for collection with numeric and string versions', async () => {
      const mockConfig = {
        config_items: [],
        versions: [
          { collection_name: 'TestCollection', current_version: '0.1.0.1' },
          { collection_name: 'StringVerCollection', current_version: '0.1.0.2' },
          { collection_name: 'BadVerCollection', current_version: 'invalid' },
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
              },
              {
                name: 'empty_values',
                values: null as any,
              },
            ]
          },
          {
            version: '2' as any,
            enumerators: [
              {
                name: 'type',
                values: [{ value: 'custom', description: 'Custom' }]
              }
            ]
          },
          null as any,
        ],
        token: {}
      }

      vi.mocked(api.getConfig).mockResolvedValueOnce(mockConfig)

      const { loadConfig, getEnumeratorValues } = useConfig()
      await loadConfig()

      expect(getEnumeratorValues('TestCollection', 'status')).toEqual([
        { value: 'active', description: 'Active status' },
        { value: 'inactive', description: 'Inactive status' }
      ])
      expect(getEnumeratorValues('StringVerCollection', 'type')).toEqual([
        { value: 'custom', description: 'Custom' }
      ])
      expect(getEnumeratorValues('TestCollection', 'nonexistent')).toEqual([])
      expect(getEnumeratorValues('TestCollection', 'empty_values')).toEqual([])
      expect(getEnumeratorValues('BadVerCollection', 'status')).toEqual([])
      expect(getEnumeratorValues('NonExistent', 'status')).toEqual([])
    })

    it('should return empty array for non-existent enumerator without matching config', () => {
      const { getEnumeratorValues } = useConfig()
      expect(getEnumeratorValues('TestCollection', 'status')).toEqual([])
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
