import * as Calendar from 'expo-calendar';
import { useTasks } from './store/tasks';
import { todayISO } from './types';

export type CalendarSyncResult =
  | { status: 'synced'; imported: number; found: number }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable' };

/** Requests read access and imports the next seven days of timed events locally. */
export async function connectAndSyncCalendar(): Promise<CalendarSyncResult> {
  const permission = await Calendar.requestCalendarPermissions();
  if (!permission.granted) {
    return { status: 'denied', canAskAgain: permission.canAskAgain };
  }

  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  if (calendars.length === 0) return { status: 'unavailable' };

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const events = await Calendar.listEvents(calendars, start, end);
  const timedEvents = events.filter((event) => !event.allDay && event.title?.trim());
  const taskStore = useTasks.getState();
  const existingKeys = new Set(
    taskStore.tasks.map((task) => task.calendarEventKey).filter((key): key is string => !!key)
  );
  let imported = 0;

  for (const event of timedEvents) {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime())) continue;
    const key = `${event.calendarId}:${event.id}:${eventStart.toISOString()}`;
    if (existingKeys.has(key)) continue;

    taskStore.addTask({
      name: event.title.trim(),
      date: todayISO(eventStart),
      startMin: eventStart.getHours() * 60 + eventStart.getMinutes(),
      durationMin: Math.max(5, Math.round((eventEnd.getTime() - eventStart.getTime()) / 60000)),
      priority: 'must',
      category: 'appointment',
      flexibility: 'fixed',
      reminderMinBefore: null,
      notes: [event.location && `Location: ${event.location}`, 'Imported from your device calendar.']
        .filter(Boolean)
        .join('\n'),
      calendarEventKey: key,
    });
    existingKeys.add(key);
    imported += 1;
  }

  return { status: 'synced', imported, found: timedEvents.length };
}
