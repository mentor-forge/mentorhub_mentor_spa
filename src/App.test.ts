import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, toValue } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { provideEditorConfig } from '@mentor-forge/mentorhub_spa_utils'
import App from './App.vue'

const mocks = vi.hoisted(() => ({
  config: undefined as ReturnType<typeof ref> | undefined,
  isAuthenticated: undefined as ReturnType<typeof ref> | undefined,
  loadConfig: vi.fn(),
}))

vi.mock('@/composables/useConfig', () => ({
  useConfig: () => ({
    config: mocks.config,
    loadConfig: mocks.loadConfig,
  }),
}))

vi.mock('@mentor-forge/mentorhub_spa_utils', () => {
  return {
    PageFrame: {
      name: 'PageFrame',
      props: ['pageTitle'],
      template: '<div class="page-frame-stub"><slot /></div>',
    },
    provideEditorConfig: vi.fn(),
    useAuth: () => ({
      isAuthenticated: mocks.isAuthenticated,
    }),
  }
})

describe('App editor config boundary', () => {
  beforeEach(() => {
    mocks.config = ref(null)
    mocks.isAuthenticated = ref(false)
    mocks.loadConfig.mockReset()
    vi.mocked(provideEditorConfig).mockReset()
  })

  it('provides reactive config for loading and unknown enumerator states', () => {
    shallowMount(App, {
      global: {
        stubs: {
          'v-app': { template: '<div><slot /></div>' },
          'router-view': true,
        },
      },
    })

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
