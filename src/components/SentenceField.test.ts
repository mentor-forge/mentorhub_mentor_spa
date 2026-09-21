import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SentenceField from './SentenceField.vue'

describe('SentenceField', () => {
  it('renders root element with data-automation-id', () => {
    const wrapper = mount(SentenceField, {
      props: {
        modelValue: 'A single sentence.',
      },
    })
    expect(wrapper.attributes('data-automation-id')).toBe('sentence-field')
  })

  it('renders label when label prop is provided', () => {
    const wrapper = mount(SentenceField, {
      props: {
        label: 'TLDR',
        modelValue: 'Some text',
      },
    })
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('TLDR')
  })

  it('renders textarea in edit mode by default (readonly=false)', () => {
    const wrapper = mount(SentenceField, {
      props: {
        modelValue: 'Initial sentence',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Initial sentence')
    expect(wrapper.find('[data-automation-id="sentence-field-display"]').exists()).toBe(false)
  })

  it('renders word-wrapped plain text in read-only mode without parsing markdown', () => {
    const text = 'Here is **not bold** text and *not italic* with plain text'
    const wrapper = mount(SentenceField, {
      props: {
        modelValue: text,
        readonly: true,
      },
    })
    expect(wrapper.find('textarea').exists()).toBe(false)
    const display = wrapper.find('[data-automation-id="sentence-field-display"]')
    expect(display.exists()).toBe(true)
    expect(display.text()).toBe(text)
    expect(display.html()).not.toContain('<strong>')
    expect(display.html()).not.toContain('<em>')
  })

  it('emits update:modelValue when textarea value changes', async () => {
    const wrapper = mount(SentenceField, {
      props: {
        modelValue: 'Initial sentence',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Updated sentence')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Updated sentence'])
  })

  it('emits blur when textarea loses focus', async () => {
    const wrapper = mount(SentenceField, {
      props: {
        modelValue: 'Initial sentence',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    await textarea.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })
})
