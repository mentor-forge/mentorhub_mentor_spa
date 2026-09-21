import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataCardGrid from './DataCardGrid.vue'

describe('DataCardGrid', () => {
  it('renders root element with data-automation-id="data-card-grid"', () => {
    const wrapper = mount(DataCardGrid)
    const el = wrapper.find('[data-automation-id="data-card-grid"]')
    expect(el.exists()).toBe(true)
    expect(el.classes()).toContain('data-card-grid')
  })

  it('renders slotted children inside the root element', () => {
    const wrapper = mount(DataCardGrid, {
      slots: {
        default: '<div class="test-child" data-automation-id="child-1">Card 1</div><div class="test-child" data-automation-id="child-2">Card 2</div>',
      },
    })
    const children = wrapper.findAll('.test-child')
    expect(children.length).toBe(2)
    expect(wrapper.find('[data-automation-id="child-1"]').text()).toBe('Card 1')
    expect(wrapper.find('[data-automation-id="child-2"]').text()).toBe('Card 2')
  })
})
