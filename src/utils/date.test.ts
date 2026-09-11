import { describe, it, expect } from 'vitest'
import { isEncounterDateToday, getNextScheduledEncounter } from './date'
import type { Encounter } from '@/api/types'

describe('date utilities', () => {
  const refDate = new Date('2026-09-10T14:30:00')

  describe('isEncounterDateToday', () => {
    it('returns true when date-only matches today', () => {
      expect(isEncounterDateToday('2026-09-10', refDate)).toBe(true)
    })

    it('returns true when ISO timestamp matches today', () => {
      expect(isEncounterDateToday('2026-09-10T09:00:00', refDate)).toBe(true)
    })

    it('returns false for tomorrow', () => {
      expect(isEncounterDateToday('2026-09-11', refDate)).toBe(false)
      expect(isEncounterDateToday('2026-09-11T10:00:00', refDate)).toBe(false)
    })

    it('returns false for yesterday', () => {
      expect(isEncounterDateToday('2026-09-09', refDate)).toBe(false)
      expect(isEncounterDateToday('2026-09-09T10:00:00', refDate)).toBe(false)
    })

    it('returns false for different month or year', () => {
      expect(isEncounterDateToday('2025-09-10', refDate)).toBe(false)
      expect(isEncounterDateToday('2026-10-10', refDate)).toBe(false)
    })

    it('returns false for empty or undefined', () => {
      expect(isEncounterDateToday(undefined, refDate)).toBe(false)
      expect(isEncounterDateToday('', refDate)).toBe(false)
      expect(isEncounterDateToday('   ', refDate)).toBe(false)
    })

    it('returns false for invalid date strings', () => {
      expect(isEncounterDateToday('invalid-date', refDate)).toBe(false)
    })
  })

  describe('getNextScheduledEncounter', () => {
    it('returns undefined when list is empty or undefined', () => {
      expect(getNextScheduledEncounter(undefined)).toBeUndefined()
      expect(getNextScheduledEncounter([])).toBeUndefined()
    })

    it('returns undefined when no encounters are scheduled', () => {
      const encounters = [
        { _id: '1', status: 'complete', date: '2026-09-10' } as Encounter,
        { _id: '2', status: 'active', date: '2026-09-10' } as Encounter,
      ]
      expect(getNextScheduledEncounter(encounters)).toBeUndefined()
    })

    it('returns the earliest scheduled encounter', () => {
      const encounters: Encounter[] = [
        {
          _id: 'later',
          status: 'scheduled',
          appointment: { from: '2026-09-15T10:00:00Z', to: '2026-09-15T11:00:00Z' },
        },
        {
          _id: 'earliest',
          status: 'scheduled',
          appointment: { from: '2026-09-10T10:00:00Z', to: '2026-09-10T11:00:00Z' },
        },
        {
          _id: 'complete-earlier',
          status: 'complete',
          appointment: { from: '2026-09-01T10:00:00Z', to: '2026-09-01T11:00:00Z' },
        },
        {
          _id: 'middle',
          status: 'scheduled',
          appointment: { from: '2026-09-12T10:00:00Z', to: '2026-09-12T11:00:00Z' },
        },
      ]
      const result = getNextScheduledEncounter(encounters)
      expect(result?._id).toBe('earliest')
    })

    it('falls back to date or created.at_time', () => {
      const encounters: Encounter[] = [
        { _id: '2', status: 'scheduled', date: '2026-09-20' },
        { _id: '1', status: 'scheduled', date: '2026-09-10' },
      ]
      expect(getNextScheduledEncounter(encounters)?._id).toBe('1')
    })
  })
})
