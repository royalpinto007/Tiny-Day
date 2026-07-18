import { buildDayTimeline } from './schedule';
import { addDaysISO, Task } from './types';

export type WrongReason = 'woke_late' | 'ran_long' | 'too_tired' | 'urgent_thing';

export interface RepairChange {
  taskId: string;
  taskName: string;
  kind: 'moved_tomorrow' | 'shortened' | 'rescheduled' | 'rest_added';
  detail: string;
  patch: Partial<Task>;
}

export interface RepairPlan {
  changes: RepairChange[];
  restInserted: boolean;
  summary: string;
}

/**
 * Gentle repair: protect ▲ musts and fixed appointments, move ○ optionals off
 * today, shorten flexible tasks, insert rest when tired, then re-lay out the
 * remaining flexible tasks from `nowMin` forward.
 */
export function buildRepairPlan(
  tasks: Task[],
  reason: WrongReason,
  nowMin: number,
  sleepMin: number,
  today: string
): RepairPlan {
  const changes: RepairChange[] = [];
  const open = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'skipped' && t.status !== 'rescheduled'
  );
  const remaining = open.filter(
    (t) => t.startMin == null || t.startMin + t.durationMin > nowMin || t.flexibility === 'flexible'
  );

  const protectedTasks = remaining.filter(
    (t) => t.priority === 'must' || (t.flexibility === 'fixed' && t.category === 'appointment')
  );
  const movable = remaining.filter((t) => !protectedTasks.includes(t));

  const workingSet: Task[] = [...protectedTasks];

  // 1. Optionals move to tomorrow
  for (const t of movable) {
    if (t.priority === 'optional') {
      changes.push({
        taskId: t.id,
        taskName: t.name,
        kind: 'moved_tomorrow',
        detail: 'Moved to tomorrow — it can wait.',
        patch: { date: addDaysISO(today, 1), startMin: null, status: 'rescheduled' },
      });
    } else {
      workingSet.push(t);
    }
  }

  // 2. Shorten flexible shoulds when time is tight or the day ran long
  const budget = sleepMin - nowMin;
  const needed = workingSet.reduce((sum, t) => sum + t.durationMin, 0);
  const shortenAll = reason === 'ran_long' || reason === 'woke_late' || needed > budget;
  const shortened = workingSet.map((t) => {
    if (shortenAll && t.flexibility === 'flexible' && t.priority === 'should' && t.durationMin > 20) {
      const next = Math.max(20, Math.round((t.durationMin * 0.7) / 5) * 5);
      changes.push({
        taskId: t.id,
        taskName: t.name,
        kind: 'shortened',
        detail: `Shortened from ${t.durationMin} to ${next} min.`,
        patch: { durationMin: next },
      });
      return { ...t, durationMin: next };
    }
    return t;
  });

  // 3. Insert rest when tired
  let restInserted = false;
  let layoutSet = shortened;
  if (reason === 'too_tired') {
    restInserted = true;
    layoutSet = [
      {
        id: '__rest__',
        name: 'Rest',
        date: today,
        startMin: null,
        durationMin: 20,
        priority: 'must',
        category: 'break',
        status: 'not_started',
        flexibility: 'flexible',
        reminderMinBefore: null,
        subtasks: [],
        createdAt: 0,
      },
      ...shortened,
    ];
  }

  // 4. Re-lay out from now
  const placements = buildDayTimeline(layoutSet, nowMin, sleepMin);
  for (const t of shortened) {
    const newStart = placements.get(t.id);
    if (newStart != null && newStart !== t.startMin && t.flexibility === 'flexible') {
      changes.push({
        taskId: t.id,
        taskName: t.name,
        kind: 'rescheduled',
        detail: `Now at a calmer time.`,
        patch: { startMin: newStart },
      });
    }
  }

  const moved = changes.filter((c) => c.kind === 'moved_tomorrow').length;
  const parts: string[] = [];
  if (moved) parts.push(`${moved} optional ${moved === 1 ? 'task' : 'tasks'} moved to tomorrow`);
  const short = changes.filter((c) => c.kind === 'shortened').length;
  if (short) parts.push(`${short} shortened`);
  if (restInserted) parts.push('a rest added');
  return {
    changes,
    restInserted,
    summary: parts.length ? parts.join(' · ') : 'Small shifts only — your musts are safe.',
  };
}
