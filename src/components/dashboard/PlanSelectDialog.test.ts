import { describe, it, expect } from 'vitest'
import { validatePlanSelection } from './planSelectValidation'

describe('PlanSelectDialog validation', () => {
  it('returns validation message when no plan is selected', () => {
    expect(validatePlanSelection('')).toBe('Select a plan to continue.')
  })

  it('returns null when a plan is selected', () => {
    expect(validatePlanSelection('507f1f77bcf86cd799439011')).toBeNull()
  })
})
