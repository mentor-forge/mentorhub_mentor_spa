import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { ConfigResponse } from '@/api/types'

const config = ref<ConfigResponse | null>(null)
const isLoading = ref(false)
const error = ref<Error | null>(null)

export function useConfig() {

  /**
   * Extract the final digit from a version string
   * Examples: "Grade.0.1.0.0" -> 0, "Tags.0.1.0.1" -> 1, "0.1.0.0" -> 0
   */
  function extractVersionDigit(versionString: string): number | null {
    if (!versionString) return null
    const parts = versionString.split('.')
    if (parts.length === 0) return null
    const lastPart = parts[parts.length - 1]
    const digit = parseInt(lastPart, 10)
    return isNaN(digit) ? null : digit
  }

  /**
   * Find the version for a collection name
   * Returns the version string or null if not found
   */
  function findCollectionVersion(collectionName: string): string | null {
    if (!config.value?.versions) return null
    
    for (const version of config.value.versions) {
      if (typeof version === 'object' && version !== null) {
        const v = version as Record<string, unknown>
        const name = String(v.collection_name || v.name || '')
        if (name === collectionName) {
          return String(v.current_version || v.version || '')
        }
      }
    }
    return null
  }

  /**
   * Get enumerator items for a specific version
   */
  function getEnumeratorItemsForVersion(version: number): Array<Record<string, unknown>> {
    if (!config.value?.enumerators) return []
    
    for (const enumerator of config.value.enumerators) {
      if (typeof enumerator === 'object' && enumerator !== null) {
        const e = enumerator as Record<string, unknown>
        const enumVersion = e.version
        const versionNum = typeof enumVersion === 'number' 
          ? enumVersion 
          : (typeof enumVersion === 'string' ? parseInt(enumVersion, 10) : null)
        
        if (versionNum === version && Array.isArray(e.enumerators)) {
          return e.enumerators as Array<Record<string, unknown>>
        }
      }
    }
    return []
  }

  /**
   * Get enumerator values for a specific collection and enumerator name
   * @param collectionName - The collection name (e.g., "TestRun", "Grade")
   * @param enumeratorName - The enumerator name (e.g., "job_status", "ollama_models")
   */
  function getEnumeratorValues(collectionName: string, enumeratorName: string): Array<{ value: string; description: string }> {
    if (!config.value) return []
    
    const versionString = findCollectionVersion(collectionName)
    if (!versionString) return []
    
    const versionDigit = extractVersionDigit(versionString)
    if (versionDigit === null) return []
    
    const enumeratorItems = getEnumeratorItemsForVersion(versionDigit)
    
    for (const item of enumeratorItems) {
      const name = String(item.name || '')
      if (name === enumeratorName && Array.isArray(item.values)) {
        return (item.values as Array<Record<string, unknown>>).map(val => ({
          value: String(val.value || ''),
          description: String(val.description || ''),
        }))
      }
    }
    
    return []
  }

  /**
   * Get dropdown items for a collection and enumerator name
   * Returns items in the format { title: string; value: string }
   */
  function getDropdownItems(collectionName: string, enumeratorName: string): Array<{ title: string; value: string }> {
    const values = getEnumeratorValues(collectionName, enumeratorName)
    return values.map(v => ({
      title: v.value,
      value: v.value,
    }))
  }

  /**
   * Load the config (call this after login)
   */
  async function loadConfig() {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.getConfig()
      config.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    config: computed(() => config.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadConfig,
    getEnumeratorValues,
    getDropdownItems,
    findCollectionVersion,
  }
}

