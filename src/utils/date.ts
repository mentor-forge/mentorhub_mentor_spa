import type { Encounter } from '@/api/types'

/**
 * Checks whether the given date string represents today's date in local time.
 * Supports ISO timestamps (e.g. 2026-09-10T14:00:00Z) and date-only strings (YYYY-MM-DD).
 * An optional referenceDate can be provided for deterministic testing.
 */
export function isEncounterDateToday(dateStr?: string, referenceDate: Date = new Date()): boolean {
  if (!dateStr) return false
  const trimmed = dateStr.trim()
  if (!trimmed) return false

  // Date-only format YYYY-MM-DD
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnlyMatch) {
    const year = parseInt(dateOnlyMatch[1], 10)
    const month = parseInt(dateOnlyMatch[2], 10) - 1
    const day = parseInt(dateOnlyMatch[3], 10)
    return (
      year === referenceDate.getFullYear() &&
      month === referenceDate.getMonth() &&
      day === referenceDate.getDate()
    )
  }

  const d = new Date(trimmed)
  if (isNaN(d.getTime())) return false

  return (
    d.getFullYear() === referenceDate.getFullYear() &&
    d.getMonth() === referenceDate.getMonth() &&
    d.getDate() === referenceDate.getDate()
  )
}

/**
 * Returns the earliest scheduled encounter for a mentee, ordered chronologically ascending.
 */
export function getNextScheduledEncounter(encounters?: Encounter[]): Encounter | undefined {
  if (!encounters || encounters.length === 0) return undefined
  const scheduled = encounters.filter((e) => e.status === 'scheduled')
  if (scheduled.length === 0) return undefined

  scheduled.sort((a, b) => {
    const aTime = a.appointment?.from || a.date || a.created?.at_time || ''
    const bTime = b.appointment?.from || b.date || b.created?.at_time || ''
    return new Date(aTime).getTime() - new Date(bTime).getTime()
  })

  return scheduled[0]
}
