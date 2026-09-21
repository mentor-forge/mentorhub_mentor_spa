import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MarkdownEditor from './MarkdownEditor.vue'
import { dataCardContextKey } from '@mentor-forge/mentorhub_spa_utils'

describe('MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('standalone modelValue + onSave', () => {
    it('should have correct initial props', () => {
      const onSave = vi.fn()
      const wrapper = mount(MarkdownEditor, {
        props: {
          modelValue: '# Hello',
          label: 'Summary',
          onSave,
        },
      })

      expect(wrapper.props('modelValue')).toBe('# Hello')
      expect(wrapper.props('label')).toBe('Summary')
    })

    it('should call onSave with new value on blur', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined)
      const wrapper = mount(MarkdownEditor, {
        props: { modelValue: 'initial', label: 'Summary', onSave },
      })

      const vm = wrapper.vm as any
      vm.handleInput('updated')
      await vm.handleBlur()

      expect(onSave).toHaveBeenCalledWith('updated')
    })

    it('should not call onSave when value is unchanged', async () => {
      const onSave = vi.fn()
      const wrapper = mount(MarkdownEditor, {
        props: { modelValue: 'initial', label: 'Summary', onSave },
      })

      const vm = wrapper.vm as any
      await vm.handleBlur()

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('read-only markdown rendering', () => {
    it('should render markdown headings and bold text when editable is false', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          modelValue: '#### Paula\nWelcome Daniel.\n\n**Note:** Good job.',
          editable: false,
          automationId: 'encounter-detail-transcript-input',
        },
      })

      expect(wrapper.find('textarea').exists()).toBe(false)
      const display = wrapper.find('[data-automation-id="markdown-field-display"]')
      expect(display.exists()).toBe(true)
      expect(display.html()).toContain('<h4>Paula</h4>')
      expect(display.html()).toContain('<strong>Note:</strong>')
      expect(display.html()).toContain('Welcome Daniel.')
    })

    it('should sanitize unsafe HTML via DOMPurify', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          modelValue: 'Hello <script>alert("xss")</script> world',
          editable: false,
        },
      })

      const display = wrapper.find('[data-automation-id="markdown-field-display"]')
      expect(display.html()).not.toContain('<script>')
      expect(display.text()).toContain('Hello')
    })

    it('should render an em-dash when value is empty', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          modelValue: '',
          editable: false,
        },
      })

      const display = wrapper.find('[data-automation-id="markdown-field-display"]')
      expect(display.text()).toBe('—')
    })

    it('should provide both base automationId and -display automationId', () => {
      const wrapper = mount(MarkdownEditor, {
        props: {
          modelValue: 'Test content',
          editable: false,
          automationId: 'my-editor-input',
        },
      })

      expect(wrapper.find('[data-automation-id="my-editor-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-automation-id="my-editor-input-display"]').exists()).toBe(true)
      expect(wrapper.find('[data-automation-id="markdown-field-display"]').exists()).toBe(true)
    })
  })

  describe('DataCard context integration', () => {
    function mountWithContext(context: Record<string, unknown>, props: Record<string, unknown>) {
      return mount(MarkdownEditor, {
        props,
        global: {
          provide: { [dataCardContextKey as symbol]: context },
        },
      })
    }

    it('should prefer injected DataCard model value over modelValue when field is set', () => {
      const model = ref({ transcript: '#### Daniel\nHello from card' })
      const onSave = vi.fn().mockResolvedValue(undefined)
      const wrapper = mountWithContext(
        { model, onSave },
        { field: 'transcript', modelValue: 'ignored', label: 'Transcript' }
      )

      const vm = wrapper.vm as any
      expect(vm.currentValue).toBe('#### Daniel\nHello from card')
    })

    it('should call context.onSave(field, value) on blur', async () => {
      const model = ref({ summary: 'Old summary' })
      const contextOnSave = vi.fn().mockResolvedValue(undefined)
      const wrapper = mountWithContext(
        { model, onSave: contextOnSave },
        { field: 'summary', label: 'Summary' }
      )

      const vm = wrapper.vm as any
      vm.handleInput('New summary')
      await vm.handleBlur()

      expect(contextOnSave).toHaveBeenCalledWith('summary', 'New summary')
    })
  })
})
