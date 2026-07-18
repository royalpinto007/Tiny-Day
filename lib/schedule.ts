import { minToLabel, Task } from './types';

export interface Conflict {
  a: Task;
  b: Task;
  message: string;
}

/**
 * Lay out flexible tasks into free slots between fixed ones,
 * inside the user's wake–sleep window. Returns updated startMin per task id.
 */
export function buildDayTimeline(tasks: Task[], wakeMin: number, sleepMin: number): Map<string, number> {
  const placements = new Map<string, number>();
  const fixed = tasks
    .filter((t) => t.flexibility === 'fixed' && t.startMin != null)
    .sort((a, b) => a.startMin! - b.startMin!);
  fixed.forEach((t) => placements.set(t.id, t.startMin!));

  const flexible = tasks
    .filter((t) => !(t.flexibility === 'fixed' && t.startMin != null))
    .sort((a, b) => {
      const p = { must: 0, should: 1, optional: 2 };
      return p[a.priority] - p[b.priority] || b.durationMin - a.durationMin;
    });

  // busy intervals from fixed tasks
  const busy: [number, number][] = fixed.map((t) => [t.startMin!, t.startMin! + t.durationMin]);

  const fits = (start: number, dur: number) =>
    start >= wakeMin &&
    start + dur <= sleepMin &&
    !busy.some(([s, e]) => start < e && start + dur > s);

  for (const task of flexible) {
    let placed = false;
    // honor a preferred start if it fits
    if (task.startMin != null && fits(task.startMin, task.durationMin)) {
      placements.set(task.id, task.startMin);
      busy.push([task.startMin, task.startMin + task.durationMin]);
      placed = true;
    }
    if (!placed) {
      for (let start = wakeMin; start + task.durationMin <= sleepMin; start += 15) {
        if (fits(start, task.durationMin)) {
          placements.set(task.id, start);
          busy.push([start, start + task.durationMin]);
          placed = true;
          break;
        }
      }
    }
    // no room — leave unscheduled (overloaded day handled by UI)
  }
  return placements;
}

export function findConflicts(tasks: Task[]): Conflict[] {
  const scheduled = tasks
    .filter((t) => t.startMin != null && t.status !== 'completed' && t.status !== 'skipped')
    .sort((a, b) => a.startMin! - b.startMin!);
  const out: Conflict[] = [];
  for (let i = 0; i < scheduled.length - 1; i++) {
    const a = scheduled[i];
    const b = scheduled[i + 1];
    if (a.startMin! + a.durationMin > b.startMin!) {
      out.push({
        a,
        b,
        message: `${a.name} overlaps with ${b.name} at ${minToLabel(b.startMin!)}.`,
      });
    }
  }
  return out;
}

export function freeSlots(tasks: Task[], wakeMin: number, sleepMin: number, minLen = 30): [number, number][] {
  const busy = tasks
    .filter((t) => t.startMin != null && t.status !== 'skipped')
    .map((t) => [t.startMin!, t.startMin! + t.durationMin] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const slots: [number, number][] = [];
  let cursor = wakeMin;
  for (const [s, e] of busy) {
    if (s - cursor >= minLen) slots.push([cursor, s]);
    cursor = Math.max(cursor, e);
  }
  if (sleepMin - cursor >= minLen) slots.push([cursor, sleepMin]);
  return slots;
}
