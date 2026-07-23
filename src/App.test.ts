import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, toValue } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { provideEditorConfig } from '@mentor-forge/mentorhub_spa_utils'
import App from './App.vue'

const mocks = vi.hoisted(() => ({
  afterEach: vi.fn(),
  config: undefined as ReturnType<typeof ref> | undefined,
  isAuthenticated: undefined as ReturnType<typeof ref> | undefined,
  loadConfig: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ afterEach: mocks.afterEach }),
}))

vi.mock('@/composables/useConfig', () => ({
  useConfig: () => ({
    config: mocks.config,
    loadConfig: mocks.loadConfig,
  }),
}))

vi.mock('@/composables/useRoles', () => ({
  useRoles: () => ({
    hasRole: () => ref(false),
  }),
}))

vi.mock('@mentor-forge/mentorhub_spa_utils', () => {
  return {
    provideEditorConfig: vi.fn(),
    redirectToIdpLogin: vi.fn(),
    useAuth: () => ({
      isAuthenticated: mocks.isAuthenticated,
      logout: vi.fn(),
    }),
  }
})

describe('App editor config boundary', () => {
  beforeEach(() => {
    mocks.config = ref(null)
    mocks.isAuthenticated = ref(false)
    mocks.loadConfig.mockReset()
    mocks.afterEach.mockReset()
    vi.mocked(provideEditorConfig).mockReset()
  })

  it('provides reactive config for loading and unknown enumerator states', () => {
    shallowMount(App)

    expect(provideEditorConfig).toHaveBeenCalledOnce()
    const providedConfig = vi.mocked(provideEditorConfig).mock.calls[0][0]

    expect(toValue(providedConfig)).toBeNull()

    mocks.config!.value = {
      enumerators: [
        {
          version: 1,
          enumerators: [
            {
              name: 'status',
              values: [{ value: 'active', description: 'Active' }],
            },
          ],
        },
      ],
    }

    expect(toValue(providedConfig)).toBe(mocks.config!.value)
    expect(
      mocks.config!.value.enumerators[0].enumerators.find(
        (enumerator: { name: string }) => enumerator.name === 'unknown',
      ),
    ).toBeUndefined()
  })
})
