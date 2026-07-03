/**
 * ISO 8601 week utilities.
 *
 * Week format: "YYYY-WNN" (e.g. "2026-W26")
 * Days: Mon=0 … Sun=6
 */

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type DayName = (typeof DAY_NAMES)[number]

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snacks'] as const
export type MealSlot = (typeof MEAL_SLOTS)[number]

/** Capitalize a meal slot for display. */
export function displayMealSlot(slot: MealSlot): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1)
}

/** Convert a Date to an ISO date string "YYYY-MM-DD" (UTC). */
export function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/** Get the ISO week string "YYYY-WNN" for a given Date. */
export function dateToIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Set to nearest Thursday (in current week)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

/** Get the Monday Date for the given ISO week string. */
export function isoWeekToMonday(week: string): Date {
  const [yearStr, weekPart] = week.split('-W')
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekPart, 10)
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dow = jan4.getUTCDay() || 7 // 1=Mon, 7=Sun
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dow + 1 + (weekNum - 1) * 7)
  return monday
}

/** Return 7 Date objects [Mon..Sun] for the given ISO week. */
export function weekDates(week: string): Date[] {
  const monday = isoWeekToMonday(week)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return d
  })
}

/** Format a week label: "Week 26, Jun 23 – Jun 29". */
export function formatWeekLabel(week: string): string {
  const weekNum = parseInt(week.split('-W')[1], 10)
  const dates = weekDates(week)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return `Week ${weekNum}, ${fmt(dates[0])} – ${fmt(dates[6])}`
}

/** Return the current ISO week string. */
export function currentIsoWeek(): string {
  return dateToIsoWeek(new Date())
}

/** Navigate to previous week. */
export function prevWeek(week: string): string {
  const monday = isoWeekToMonday(week)
  monday.setUTCDate(monday.getUTCDate() - 7)
  return dateToIsoWeek(monday)
}

/** Navigate to next week. */
export function nextWeek(week: string): string {
  const monday = isoWeekToMonday(week)
  monday.setUTCDate(monday.getUTCDate() + 7)
  return dateToIsoWeek(monday)
}

/** Format a Date to a short label: "Mon 23" */
export function shortDayLabel(d: Date): string {
  const day = DAY_NAMES[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]
  return `${day} ${d.getUTCDate()}`
}
