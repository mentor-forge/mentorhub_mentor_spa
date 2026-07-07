import { describe, it, expect } from 'vitest'
import {
  appendChecklistItem,
  moveChecklistItem,
  removeChecklistItem,
  reorderChecklistItem,
  stepTextRule,
  updateChecklistItem,
} from './PlanChecklistEditor.vue'

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
