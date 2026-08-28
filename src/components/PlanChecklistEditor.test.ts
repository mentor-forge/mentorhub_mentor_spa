import { describe, it, expect, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import PlanChecklistEditor, {
  appendChecklistItem,
  moveChecklistItem,
  removeChecklistItem,
  reorderChecklistItem,
  stepTextRule,
  updateChecklistItem,
} from './PlanChecklistEditor.vue'

const VTextFieldStub = {
  name: 'VTextField',
  props: ['modelValue', 'dataAutomationId'],
  methods: {
    focus() {},
  },
  template: '<input :data-automation-id="dataAutomationId" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" />',
}

describe('PlanChecklistEditor', () => {
  it('uses shared MhCard chrome and preserves its automation ID', () => {
    const wrapper = shallowMount(PlanChecklistEditor, {
      props: {
        checklist: [],
        onSave: async () => undefined,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template:
              '<section :data-automation-id="automationId" :data-title="title"><slot /></section>',
          },
          VTextField: true,
          VBtn: true,
        },
      },
    })

    const card = wrapper.get('[data-automation-id="plan-edit-checklist-section"]')
    expect(card.attributes('data-title')).toBe('Checklist')
  })

  it('updates local checklist when props change', async () => {
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1', 'Step 2'],
        onSave: vi.fn(),
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: true,
          VIcon: true,
        },
      },
    })

    await wrapper.setProps({ checklist: ['Step 1'] })
    expect(wrapper.findAll('.plan-checklist-todo-row').length).toBe(2)

    await wrapper.setProps({ checklist: ['Step A', 'Step B', 'Step C'] })
    expect(wrapper.findAll('.plan-checklist-todo-row').length).toBe(3)
  })

  it('adds a step via the add button and calls onSave', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const addInput = wrapper.find('[data-automation-id="plan-edit-checklist-add-input"]')
    await addInput.setValue('Step 2')

    const addBtn = wrapper.find('[data-automation-id="plan-edit-checklist-add-button"]')
    await addBtn.trigger('click')

    expect(onSave).toHaveBeenCalledWith(['Step 1', 'Step 2'])
  })

  it('adds an empty step without calling onSave', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const addBtn = wrapper.find('[data-automation-id="plan-edit-checklist-add-button"]')
    await addBtn.trigger('click')

    expect(onSave).not.toHaveBeenCalled()
  })

  it('validates invalid step on add', async () => {
    const onSave = vi.fn()
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const addInput = wrapper.find('[data-automation-id="plan-edit-checklist-add-input"]')
    await addInput.setValue('has\ttab')
    const addBtn = wrapper.find('[data-automation-id="plan-edit-checklist-add-button"]')
    await addBtn.trigger('click')

    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves an edited step on blur', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const stepInput = wrapper.find('[data-automation-id="plan-edit-checklist-step-1-input"]')
    await stepInput.setValue('Step 1 Edited')
    await stepInput.trigger('blur')

    expect(onSave).toHaveBeenCalledWith(['Step 1 Edited'])
  })

  it('handles unchanged or invalid edited step on blur', async () => {
    const onSave = vi.fn()
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: true,
          VIcon: true,
        },
      },
    })

    const stepInput = wrapper.find('[data-automation-id="plan-edit-checklist-step-1-input"]')
    await stepInput.trigger('blur')
    expect(onSave).not.toHaveBeenCalled()

    await stepInput.setValue('has\ttab')
    await stepInput.trigger('blur')
    expect(onSave).not.toHaveBeenCalled()

    await stepInput.setValue('')
    await stepInput.trigger('blur')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('deletes a step when delete button is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1', 'Step 2'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const deleteBtn = wrapper.find('[data-automation-id="plan-edit-checklist-step-1-delete-button"]')
    await deleteBtn.trigger('click')

    expect(onSave).toHaveBeenCalledWith(['Step 2'])
  })

  it('deletes last step calling onSave with empty array', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const deleteBtn = wrapper.find('[data-automation-id="plan-edit-checklist-step-1-delete-button"]')
    await deleteBtn.trigger('click')

    expect(onSave).toHaveBeenCalledWith([])
  })

  it('handles drag and drop reordering', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1', 'Step 2', 'Step 3'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const rows = wrapper.findAll('.plan-checklist-todo-row')
    const handle0 = wrapper.find('[data-automation-id="plan-edit-checklist-step-1-drag-handle"]')

    // Drag over self or when null
    await rows[0].trigger('dragover')
    await rows[0].trigger('drop')

    await handle0.trigger('dragstart', { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
    await rows[0].trigger('dragover')
    await rows[1].trigger('dragover')
    await rows[1].trigger('drop')

    expect(onSave).toHaveBeenCalledWith(['Step 2', 'Step 1', 'Step 3'])
  })

  it('handles error in persistChecklist', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save error'))
    const wrapper = mount(PlanChecklistEditor, {
      props: {
        checklist: ['Step 1'],
        onSave,
      },
      global: {
        stubs: {
          MhCard: {
            props: ['title', 'automationId'],
            template: '<section :data-automation-id="automationId"><slot /></section>',
          },
          VTextField: VTextFieldStub,
          VBtn: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          VIcon: true,
        },
      },
    })

    const addInput = wrapper.find('[data-automation-id="plan-edit-checklist-add-input"]')
    await addInput.setValue('Step 2')
    const addBtn = wrapper.find('[data-automation-id="plan-edit-checklist-add-button"]')
    await addBtn.trigger('click')

    expect(onSave).toHaveBeenCalled()
  })
})

describe('PlanChecklistEditor helpers', () => {
  it('validates step text per OpenAPI pattern', () => {
    expect(stepTextRule('Review homework')).toBe(true)
    expect(stepTextRule('')).toBe(true)
    expect(stepTextRule('   ')).toBe(true)
    expect(stepTextRule('has\ttab')).toBe('Max 255 characters, no tabs or newlines')
    expect(stepTextRule('a'.repeat(256))).toBe('Max 255 characters, no tabs or newlines')
  })

  it('appends an empty step to the checklist', () => {
    expect(appendChecklistItem(['First'], '')).toEqual(['First', ''])
  })

  it('appends a step to the checklist', () => {
    expect(appendChecklistItem(['First'], 'Second')).toEqual(['First', 'Second'])
  })

  it('updates a step at the given index', () => {
    expect(updateChecklistItem(['First', 'Second'], 1, 'Updated')).toEqual(['First', 'Updated'])
  })

  it('removes a step at the given index', () => {
    expect(removeChecklistItem(['First', 'Second', 'Third'], 1)).toEqual(['First', 'Third'])
  })

  it('moves a step up in the checklist', () => {
    expect(moveChecklistItem(['First', 'Second', 'Third'], 1, -1)).toEqual(['Second', 'First', 'Third'])
  })

  it('moves a step down in the checklist', () => {
    expect(moveChecklistItem(['First', 'Second', 'Third'], 1, 1)).toEqual(['First', 'Third', 'Second'])
  })

  it('reorders a step from one index to another', () => {
    expect(reorderChecklistItem(['First', 'Second', 'Third', 'Fourth'], 0, 2)).toEqual([
      'Second',
      'Third',
      'First',
      'Fourth',
    ])
    expect(reorderChecklistItem(['First', 'Second', 'Third'], 2, 0)).toEqual(['Third', 'First', 'Second'])
  })

  it('returns the same checklist when reorder indices are invalid', () => {
    const checklist = ['First', 'Second']
    expect(reorderChecklistItem(checklist, 0, 0)).toBe(checklist)
    expect(reorderChecklistItem(checklist, -1, 1)).toBe(checklist)
    expect(reorderChecklistItem(checklist, 0, 5)).toBe(checklist)
  })
})
