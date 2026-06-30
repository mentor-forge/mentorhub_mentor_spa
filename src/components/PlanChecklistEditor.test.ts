import { describe, it, expect } from 'vitest'
import {
  appendChecklistItem,
  removeChecklistItem,
  stepTextRule,
  updateChecklistItem,
} from './PlanChecklistEditor.vue'

describe('PlanChecklistEditor helpers', () => {
  it('validates step text per OpenAPI pattern', () => {
    expect(stepTextRule('Review homework')).toBe(true)
    expect(stepTextRule('')).toBe('Step text is required')
    expect(stepTextRule('   ')).toBe('Step text is required')
    expect(stepTextRule('has\ttab')).toBe('Max 255 characters, no tabs or newlines')
    expect(stepTextRule('a'.repeat(256))).toBe('Max 255 characters, no tabs or newlines')
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
})
