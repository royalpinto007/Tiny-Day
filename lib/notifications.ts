import * as Notifications from 'expo-notifications';
import { SettingsState } from './store/settings';
import { Task, todayISO } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function inQuietHours(min: number, quietStart: number, quietEnd: number): boolean {
  // quiet window usually wraps midnight (22:00 → 07:00)
  return quietStart > quietEnd ? min >= quietStart || min < quietEnd : min >= quietStart && min < quietEnd;
}

function bodyFor(task: Task, privacyMode: boolean, followUp: boolean): { title: string; body: string } {
  if (privacyMode) {
    return { title: 'Tiny Day', body: 'Important reminder due now' };
  }
  return {
    title: followUp ? 'Still on your plate' : 'Coming up',
    body: followUp ? `${task.name} — whenever you’re ready.` : task.name,
  };
}

/**
 * Reminder rules (7c): ▲ must = remind + one follow-up · ● should = one
 * reminder · ○ optional = silent. Quiet hours suppress everything.
 * Never guilt loops — at most one gentle follow-up.
 */
export async function syncTodayReminders(
  tasks: Task[],
  settings: Pick<SettingsState, 'notificationLevel' | 'quietStartMin' | 'quietEndMin' | 'privacyMode' | 'notificationsGranted'>
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.notificationsGranted || settings.notificationLevel === 'none') return;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const today = todayISO();

    for (const task of tasks) {
      if (task.date !== today || task.startMin == null) continue;
      if (task.status === 'completed' || task.status === 'skipped' || task.status === 'rescheduled') continue;
      if (task.priority === 'optional') continue; // always silent
      if (task.priority === 'should' && settings.notificationLevel === 'minimal') continue;
      if (settings.notificationLevel === 'important' || settings.notificationLevel === 'all' || settings.notificationLevel === 'minimal') {
        const lead = task.reminderMinBefore ?? 15;
        const fireMin = task.startMin - lead;
        const schedule = async (atMin: number, followUp: boolean) => {
          if (atMin <= nowMin) return;
          if (inQuietHours(atMin, settings.quietStartMin, settings.quietEndMin)) return;
          const fire = new Date(now);
          fire.setHours(Math.floor(atMin / 60), atMin % 60, 0, 0);
          const { title, body } = bodyFor(task, settings.privacyMode, followUp);
          await Notifications.scheduleNotificationAsync({
            content: { title, body, data: { taskId: task.id } },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fire },
          });
        };
        await schedule(fireMin, false);
        if (task.priority === 'must') {
          // one gentle follow-up, 10 min after start
          await schedule(task.startMin + 10, true);
        }
      }
    }
  } catch {
    // notifications are best-effort; the app never depends on them
  }
}

/** One gentle replan prompt when the day is clearly behind — never repeated. */
export async function scheduleReplanPrompt(behindCount: number, privacyMode: boolean): Promise<void> {
  try {
    if (behindCount < 2) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tiny Day',
        body: privacyMode
          ? 'Your afternoon could use a little reshaping.'
          : 'Plans changed. That’s okay — want to reshape the afternoon?',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
    });
  } catch {
    // best-effort
  }
}
