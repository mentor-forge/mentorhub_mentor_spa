import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import ScheduleEncountersDialog from './ScheduleEncountersDialog.vue'

const mockPlans = ref<any[]>([])
const mockIsLoadingPlans = ref(false)

vi.mock('@tanstack/vue-query', () => ({
  useQuery: () => ({
    data: mockPlans,
    isLoading: mockIsLoadingPlans,
  }),
}))

vi.mock('@/api/client', () => ({
  api: {
    getPlans: vi.fn(),
  },
}))

describe('ScheduleEncountersDialog component', () => {
  beforeEach(() => {
    mockPlans.value = []
    mockIsLoadingPlans.value = false
  })

  it('renders correctly when closed', () => {
    const wrapper = shallowMount(ScheduleEncountersDialog, {
      props: {
        modelValue: false,
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
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
          'v-select': true,
          'v-text-field': true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits update:modelValue on cancel', async () => {
    const wrapper = mount(ScheduleEncountersDialog, {
      props: {
        modelValue: true,
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-select': true,
          'v-text-field': true,
          'v-btn': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-spacer': true,
          'v-progress-linear': true,
        },
      },
    })

    const cancelBtn = wrapper.find('[data-automation-id="schedule-encounters-cancel-button"]')
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('emits submit with ScheduleEncounterInput payload on valid submission', async () => {
    mockPlans.value = [
      { _id: 'plan-1', name: 'Test Plan 1' },
      { _id: 'plan-2', name: 'Test Plan 2' },
    ]

    const wrapper = mount(ScheduleEncountersDialog, {
      props: {
        modelValue: true,
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
      },
      global: {
        stubs: {
          'v-dialog': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-select': {
            props: ['modelValue', 'items'],
            template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="item in items" :key="item._id || item.value" :value="item._id || item.value">{{ item.name || item.title }}</option></select>',
          },
          'v-text-field': {
            props: ['modelValue'],
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          },
          'v-btn': {
            props: ['disabled'],
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
          },
          'v-spacer': true,
          'v-progress-linear': true,
        },
      },
    })

    // Wait for watcher to initialize selectedPlanId from mockPlans
    await wrapper.vm.$nextTick()

    const submitBtn = wrapper.find('[data-automation-id="schedule-encounters-submit-button"]')
    await submitBtn.trigger('click')

    expect(wrapper.emitted('submit')).toBeDefined()
    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toMatchObject({
      mentor_id: 'mentor-123',
      mentee_id: 'mentee-456',
      plan_id: 'plan-1',
      recurrence_days: 7,
      count: 4,
    })
  })
})
