import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { validatePlanSelection } from './planSelectValidation'
import { PlanSelectDialog } from './index'

const mockData = ref<any[]>([])
const mockIsLoading = ref(false)

vi.mock('@tanstack/vue-query', () => ({
  useQuery: () => ({
    data: mockData,
    isLoading: mockIsLoading,
  }),
}))

vi.mock('@/api/client', () => ({
  api: {
    getPlans: vi.fn(),
  },
}))

describe('PlanSelectDialog validation', () => {
  it('returns validation message when no plan is selected', () => {
    expect(validatePlanSelection('')).toBe('Select a plan to continue.')
  })

  it('returns null when a plan is selected', () => {
    expect(validatePlanSelection('507f1f77bcf86cd799439011')).toBeNull()
  })
})

describe('PlanSelectDialog component', () => {
  beforeEach(() => {
    mockData.value = []
    mockIsLoading.value = false
  })

  it('renders correctly when closed', () => {
    const wrapper = shallowMount(PlanSelectDialog, {
      props: {
        modelValue: false,
      },
      global: {
        stubs: {
          'v-dialog': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-btn': true,
          'v-spacer': true,
          'v-progress-linear': true,
          'v-alert': true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders empty alert when no plans exist', () => {
    mockData.value = []
    const wrapper = mount(PlanSelectDialog, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-alert': { template: '<div class="alert"><slot /></div>' },
          'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'v-spacer': true,
          'router-link': { template: '<a><slot /></a>' },
          'v-progress-linear': true,
        },
      },
    })
    expect(wrapper.find('.alert').text()).toContain('No encounter plans yet')
  })

  it('renders plans list and emits submit when plan is selected', async () => {
    mockData.value = [
      { _id: 'plan-1', name: '', description: '', checklist: null },
      { _id: 'plan-2', name: 'Plan 2', description: 'Desc 2', checklist: [] },
    ]

    const wrapper = mount(PlanSelectDialog, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-list': { template: '<div><slot /></div>' },
          'v-list-item': {
            props: ['active'],
            template: '<div class="list-item" @click="$emit(\'click\')"><slot /><slot name="prepend" /></div>',
          },
          'v-list-item-title': { template: '<div><slot /></div>' },
          'v-list-item-subtitle': { template: '<div><slot /></div>' },
          'v-list-item-action': { template: '<div><slot /></div>' },
          'v-checkbox-btn': true,
          'v-btn': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-spacer': true,
          'router-link': true,
          'v-progress-linear': true,
          'v-alert': true,
        },
      },
    })

    // Click on the first plan
    const items = wrapper.findAll('.list-item')
    expect(items.length).toBe(2)
    await items[0].trigger('click')

    // Submit
    const submitBtn = wrapper.find('[data-automation-id="plan-select-submit-button"]')
    await submitBtn.trigger('click')

    expect(wrapper.emitted('submit')?.[0]).toEqual(['plan-1'])

    // Toggle modelValue open again to trigger watcher
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
  })

  it('shows validation message on submit when no plan is selected', async () => {
    mockData.value = [
      { _id: 'plan-1', name: 'Plan 1', description: 'Desc 1', checklist: [] },
    ]

    const wrapper = mount(PlanSelectDialog, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-list': { template: '<div><slot /></div>' },
          'v-list-item': { template: '<div><slot /></div>' },
          'v-list-item-title': { template: '<div><slot /></div>' },
          'v-list-item-subtitle': { template: '<div><slot /></div>' },
          'v-list-item-action': { template: '<div><slot /></div>' },
          'v-checkbox-btn': true,
          'v-btn': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-spacer': true,
          'router-link': true,
          'v-progress-linear': true,
          'v-alert': true,
        },
      },
    })

    const submitBtn = wrapper.find('[data-automation-id="plan-select-submit-button"]')
    await submitBtn.trigger('click')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[data-automation-id="plan-select-validation"]').text()).toBe('Select a plan to continue.')
  })

  it('emits update:modelValue on cancel', async () => {
    const wrapper = mount(PlanSelectDialog, {
      props: {
        modelValue: true,
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-list': true,
          'v-btn': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-spacer': true,
          'router-link': true,
          'v-progress-linear': true,
          'v-alert': true,
        },
      },
    })

    const cancelBtn = wrapper.find('[data-automation-id="plan-select-cancel-button"]')
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
