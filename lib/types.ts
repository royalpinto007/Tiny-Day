export type Priority = 'must' | 'should' | 'optional';

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'missed'
  | 'rescheduled'
  | 'skipped'
  | 'waiting'
  | 'overdue';

export type Category =
  | 'work'
  | 'study'
  | 'health'
  | 'errand'
  | 'personal'
  | 'appointment'
  | 'routine'
  | 'meal'
  | 'break'
  | 'travel';

export type Energy = 'very_low' | 'low' | 'okay' | 'good';
export type Mood = 'calm' | 'productive' | 'chaotic' | 'heavy';
export type Flexibility = 'fixed' | 'flexible';

export interface Subtask {
  id: string;
  name: string;
  done: boolean;
}

export interface Task {
  id: string;
  name: string;
  /** ISO date 'YYYY-MM-DD' the task is scheduled on; null = backlog */
  date: string | null;
  /** minutes from midnight; null = unscheduled within the day */
  startMin: number | null;
  durationMin: number;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  flexibility: Flexibility;
  energy?: 'low' | 'high';
  reminderMinBefore: number | null;
  notes?: string;
  subtasks: Subtask[];
  /** id of the routine that generated this task, if any */
  routineId?: string;
  /** stable device-calendar event occurrence key, used to avoid duplicate imports */
  calendarEventKey?: string;
  /** true for reversible sample content loaded from Profile during testing */
  isDemo?: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface Routine {
  id: string;
  name: string;
  category: Category;
  startMin: number;
  durationMin: number;
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  enabled: boolean;
  isDemo?: boolean;
}

export interface DaySnapshot {
  /** ISO date 'YYYY-MM-DD' */
  date: string;
  mood?: Mood;
  reflection?: string;
  plannedCount: number;
  completedCount: number;
  focusMinutes: number;
  closedAt?: number;
  isDemo?: boolean;
}

export const PRIORITY_GLYPH: Record<Priority, string> = {
  must: '▲',
  should: '●',
  optional: '○',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  must: 'Must',
  should: 'Should',
  optional: 'Optional',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  missed: 'Missed',
  rescheduled: 'Rescheduled',
  skipped: 'Skipped',
  waiting: 'Waiting',
  overdue: 'Overdue',
};

export const STATUS_GLYPH: Record<TaskStatus, string> = {
  not_started: '',
  in_progress: '▶',
  completed: '✓',
  missed: '!',
  rescheduled: '↺',
  skipped: '–',
  waiting: '…',
  overdue: '!',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  work: 'Work',
  study: 'Study',
  health: 'Health',
  errand: 'Errand',
  personal: 'Personal',
  appointment: 'Appointment',
  routine: 'Routine',
  meal: 'Meal',
  break: 'Break',
  travel: 'Travel',
};

export const CATEGORIES: Category[] = [
  'work', 'study', 'health', 'errand', 'personal',
  'appointment', 'routine', 'meal', 'break', 'travel',
];

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function minToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  return m === 0 ? `${h}:00 ${ampm}` : `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function durationLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

let idCounter = 0;
export function makeId(prefix = 't'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
