import { computed } from 'vue'
import { useRoles as useRolesBase, type AuthProvider, type ConfigProvider } from '@{{org.git_org}}/{{info.slug}}_spa_utils'
import { useAuth } from './useAuth'
import { useConfig } from './useConfig'

/**
 * Wrapper for spa_utils useRoles that provides app-specific auth and config
 */
export function useRoles() {
  const { roles: authRoles } = useAuth()
  const { config } = useConfig()
  
  const authProvider: AuthProvider = { roles: authRoles as any }
  const configProvider: ConfigProvider = { 
    token: computed(() => config.value?.token || null) as any
  }
  
  return useRolesBase(authProvider, configProvider)
}
