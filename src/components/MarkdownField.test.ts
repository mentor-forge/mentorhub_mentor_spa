import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownField from './MarkdownField.vue'

describe('MarkdownField', () => {
  it('renders root element with data-automation-id', () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: 'Some markdown',
      },
    })
    expect(wrapper.attributes('data-automation-id')).toBe('markdown-field')
  })

  it('renders label when label prop is provided', () => {
    const wrapper = mount(MarkdownField, {
      props: {
        label: 'Mentor Notes',
        modelValue: 'Some text',
      },
    })
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Mentor Notes')
  })

  it('renders textarea in edit mode by default (readonly=false)', () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: 'Initial notes',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Initial notes')
    expect(wrapper.find('[data-automation-id="markdown-field-display"]').exists()).toBe(false)
  })

  it('emits update:modelValue when textarea value changes', async () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: 'Initial notes',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Updated notes')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Updated notes'])
  })

  it('emits blur when textarea loses focus', async () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: 'Initial notes',
        readonly: false,
      },
    })
    const textarea = wrapper.find('textarea')
    await textarea.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders formatted markdown HTML in read-only mode', () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: 'Here is **bold** text and *italic* text\nand a newline with `code`',
        readonly: true,
      },
    })
    expect(wrapper.find('textarea').exists()).toBe(false)
    const display = wrapper.find('[data-automation-id="markdown-field-display"]')
    expect(display.exists()).toBe(true)
    expect(display.html()).toContain('<strong>bold</strong>')
    expect(display.html()).toContain('<em>italic</em>')
    expect(display.html()).toContain('<code>code</code>')
    expect(display.html()).toContain('<br>')
  })

  it('safely escapes raw HTML in read-only mode', () => {
    const wrapper = mount(MarkdownField, {
      props: {
        modelValue: '<script>alert("xss")</script> **safe bold**',
        readonly: true,
      },
    })
    const display = wrapper.find('[data-automation-id="markdown-field-display"]')
    expect(display.html()).toContain('&lt;script&gt;')
    expect(display.html()).not.toContain('<script>')
    expect(display.html()).toContain('<strong>safe bold</strong>')
  })
})
