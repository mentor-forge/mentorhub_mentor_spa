import { describe, it, expect } from 'vitest'
import { ScheduleEncountersDialog } from './index'

describe('dashboard index barrel', () => {
  it('re-exports ScheduleEncountersDialog', () => {
    expect(ScheduleEncountersDialog).toBeDefined()
    expect(typeof ScheduleEncountersDialog).not.toBe('undefined')
  })
})
