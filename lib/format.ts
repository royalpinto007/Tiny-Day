/**
 * Date formatting. The design writes dates month-first ("Friday, July 18"), so
 * these pin the locale to en-US rather than following the device locale, which
 * would render day-first ("Sunday, 19 July") in much of the world.
 */

const LOCALE = 'en-US';

/** "Friday, July 18" — the Today header. */
export function longDateLabel(date: Date = new Date()): string {
  return date.toLocaleDateString(LOCALE, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "Friday, July 18" from an ISO 'YYYY-MM-DD'. */
export function longDateLabelISO(iso: string): string {
  return longDateLabel(new Date(`${iso}T12:00:00`));
}

/** "Friday, July 18" without the weekday — "July 18". */
export function monthDayLabel(date: Date = new Date()): string {
  return date.toLocaleDateString(LOCALE, { month: 'long', day: 'numeric' });
}

/** "Friday · July 18" style short weekday label for week rows. */
export function weekdayDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.toLocaleDateString(LOCALE, { weekday: 'long' })}, ${d.toLocaleDateString(LOCALE, {
    month: 'long',
    day: 'numeric',
  })}`;
}
