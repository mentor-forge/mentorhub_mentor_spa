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

const dialogStubs = {
  'v-dialog': {
    props: ['modelValue'],
    template:
      '<div data-automation-id="schedule-dialog-stub"><slot /><button type="button" data-automation-id="dialog-model-value-false" @click="$emit(\'update:modelValue\', false)" /><button type="button" data-automation-id="dialog-model-value-true" @click="$emit(\'update:modelValue\', true)" /></div>',
  },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-select': {
    props: ['modelValue', 'items'],
    template:
      '<select :data-automation-id="$attrs[\'data-automation-id\']" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="item in items" :key="item._id ?? item.value" :value="item._id ?? item.value">{{ item.name ?? item.title }}</option></select>',
  },
  'v-text-field': {
    props: ['modelValue', 'type'],
    template:
      '<input :data-automation-id="$attrs[\'data-automation-id\']" :type="type || \'text\'" :value="modelValue" @input="$emit(\'update:modelValue\', type === \'number\' ? Number($event.target.value) : $event.target.value)" />',
  },
  'v-btn': {
    props: ['disabled'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
  'v-spacer': true,
  'v-progress-linear': {
    template: '<div data-automation-id="schedule-plans-loading" />',
  },
}

function mountDialog(
  props: Partial<{
    modelValue: boolean
    loading: boolean
    mentorId: string
    menteeId: string
  }> = {},
) {
  return mount(ScheduleEncountersDialog, {
    props: {
      modelValue: true,
      mentorId: 'mentor-123',
      menteeId: 'mentee-456',
      ...props,
    },
    global: { stubs: dialogStubs },
  })
}

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

  it('shows loading indicator while plans are loading', () => {
    mockIsLoadingPlans.value = true
    const wrapper = mountDialog()
    expect(wrapper.find('[data-automation-id="schedule-plans-loading"]').exists()).toBe(true)
  })

  it('emits update:modelValue on cancel', async () => {
    const wrapper = mountDialog()

    const cancelBtn = wrapper.find('[data-automation-id="schedule-encounters-cancel-button"]')
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('forwards dialog update:modelValue to parent', async () => {
    const wrapper = mountDialog()

    await wrapper.find('[data-automation-id="dialog-model-value-false"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    await wrapper.find('[data-automation-id="dialog-model-value-true"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([true])
  })

  it('selects the first plan when plans load and dialog opens', async () => {
    mockPlans.value = [
      { _id: 'plan-1', name: 'Test Plan 1' },
      { _id: 'plan-2', name: 'Test Plan 2' },
    ]

    const wrapper = mount(ScheduleEncountersDialog, {
      props: {
        modelValue: false,
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
      },
      global: { stubs: dialogStubs },
    })

    await wrapper.setProps({ modelValue: true })
    await wrapper.vm.$nextTick()

    const planSelect = wrapper.get('[data-automation-id="schedule-encounters-plan-select"]')
    expect((planSelect.element as HTMLSelectElement).value).toBe('plan-1')
  })

  it('updates plan, day, time, start date, and count via form controls', async () => {
    mockPlans.value = [
      { _id: 'plan-1', name: 'Test Plan 1' },
      { _id: 'plan-2', name: 'Test Plan 2' },
    ]

    const wrapper = mountDialog()
    await wrapper.vm.$nextTick()

    await wrapper.get('[data-automation-id="schedule-encounters-plan-select"]').setValue('plan-2')
    await wrapper.get('[data-automation-id="schedule-encounters-day-select"]').setValue('3')
    await wrapper.get('[data-automation-id="schedule-encounters-time-input"]').setValue('09:30')
    await wrapper
      .get('[data-automation-id="schedule-encounters-start-date-input"]')
      .setValue('2026-12-01')
    await wrapper.get('[data-automation-id="schedule-encounters-count-input"]').setValue('6')

    const submitBtn = wrapper.get('[data-automation-id="schedule-encounters-submit-button"]')
    await submitBtn.trigger('click')

    expect(wrapper.emitted('submit')).toBeDefined()
    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toMatchObject({
      mentor_id: 'mentor-123',
      mentee_id: 'mentee-456',
      plan_id: 'plan-2',
      start_date: '2026-12-01',
      day_of_week: 3,
      time_of_day: '09:30',
      recurrence_days: 7,
      count: 6,
    })
  })

  it('does not emit submit when form is invalid', async () => {
    const wrapper = mountDialog()
    await wrapper.get('[data-automation-id="schedule-encounters-count-input"]').setValue('0')
    await wrapper.get('[data-automation-id="schedule-encounters-submit-button"]').trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('disables submit while parent loading prop is true', async () => {
    mockPlans.value = [{ _id: 'plan-1', name: 'Test Plan 1' }]
    const wrapper = mountDialog({ loading: true })
    await wrapper.vm.$nextTick()

    const submitBtn = wrapper.get('[data-automation-id="schedule-encounters-submit-button"]')
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('emits submit with ScheduleEncounterInput payload on valid submission', async () => {
    mockPlans.value = [
      { _id: 'plan-1', name: 'Test Plan 1' },
      { _id: 'plan-2', name: 'Test Plan 2' },
    ]

    const wrapper = mountDialog()
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
