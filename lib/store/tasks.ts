import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDaysISO, DaySnapshot, makeId, Routine, Task, todayISO } from '../types';

interface TasksState {
  tasks: Task[];
  routines: Routine[];
  snapshots: Record<string, DaySnapshot>;
  focusTaskId: string | null;
  /** dates for which routine tasks have already been generated */
  routineSeededDates: string[];

  addTask: (partial: Partial<Task> & { name: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setStatus: (id: string, status: Task['status']) => void;

  addRoutine: (partial: Partial<Routine> & { name: string }) => Routine;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  removeRoutine: (id: string) => void;

  saveSnapshot: (snap: DaySnapshot) => void;
  setFocusTask: (id: string | null) => void;
  seedRoutinesForDate: (date: string) => void;
  loadDemoData: () => void;
  clearDemoData: () => void;
}

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      routines: [],
      snapshots: {},
      focusTaskId: null,
      routineSeededDates: [],

      addTask: (partial) => {
        const task: Task = {
          id: makeId('t'),
          name: partial.name,
          date: partial.date === undefined ? todayISO() : partial.date,
          startMin: partial.startMin ?? null,
          durationMin: partial.durationMin ?? 30,
          priority: partial.priority ?? 'should',
          category: partial.category ?? 'personal',
          status: partial.status ?? 'not_started',
          flexibility: partial.flexibility ?? 'flexible',
          energy: partial.energy,
          reminderMinBefore: partial.reminderMinBefore ?? 15,
          notes: partial.notes,
          subtasks: partial.subtasks ?? [],
          routineId: partial.routineId,
          calendarEventKey: partial.calendarEventKey,
          isDemo: partial.isDemo,
          createdAt: Date.now(),
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      setStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, completedAt: status === 'completed' ? Date.now() : t.completedAt }
              : t
          ),
        })),

      addRoutine: (partial) => {
        const routine: Routine = {
          id: makeId('r'),
          name: partial.name,
          category: partial.category ?? 'routine',
          startMin: partial.startMin ?? 8 * 60,
          durationMin: partial.durationMin ?? 30,
          days: partial.days ?? [1, 2, 3, 4, 5],
          enabled: partial.enabled ?? true,
          isDemo: partial.isDemo,
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return routine;
      },
      updateRoutine: (id, patch) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      saveSnapshot: (snap) => set((s) => ({ snapshots: { ...s.snapshots, [snap.date]: snap } })),
      setFocusTask: (id) => set({ focusTaskId: id }),

      seedRoutinesForDate: (date) => {
        const s = get();
        if (s.routineSeededDates.includes(date)) return;
        const dow = new Date(`${date}T12:00:00`).getDay();
        const due = s.routines.filter((r) => r.enabled && r.days.includes(dow));
        const newTasks: Task[] = due.map((r) => ({
          id: makeId('t'),
          name: r.name,
          date,
          startMin: r.startMin,
          durationMin: r.durationMin,
          priority: 'should',
          category: r.category,
          status: 'not_started',
          flexibility: 'flexible',
          reminderMinBefore: null,
          subtasks: [],
          routineId: r.id,
          createdAt: Date.now(),
        }));
        set({
          tasks: [...s.tasks, ...newTasks],
          routineSeededDates: [...s.routineSeededDates.slice(-30), date],
        });
      },

      loadDemoData: () => {
        const s = get();
        const today = todayISO();
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
        const demoTask = (partial: Partial<Task> & Pick<Task, 'name' | 'date'>): Task => ({
          id: makeId('demo'),
          name: partial.name,
          date: partial.date,
          startMin: partial.startMin ?? null,
          durationMin: partial.durationMin ?? 30,
          priority: partial.priority ?? 'should',
          category: partial.category ?? 'personal',
          status: partial.status ?? 'not_started',
          flexibility: partial.flexibility ?? 'flexible',
          reminderMinBefore: partial.reminderMinBefore ?? null,
          notes: partial.notes,
          subtasks: partial.subtasks ?? [],
          createdAt: Date.now(),
          completedAt: partial.completedAt,
          isDemo: true,
        });
        const demoTasks: Task[] = [
          demoTask({ name: 'Morning stretch', date: today, startMin: 8 * 60, durationMin: 15, category: 'health', status: 'completed', completedAt: Date.now() - 3600000 }),
          demoTask({ name: 'Review project proposal', date: today, startMin: Math.min(23 * 60, Math.ceil((nowMin + 15) / 15) * 15), durationMin: 45, priority: 'must', category: 'work', flexibility: 'fixed', reminderMinBefore: 15, subtasks: [{ id: makeId('sub'), name: 'Check budget', done: true }, { id: makeId('sub'), name: 'Send final notes', done: false }] }),
          demoTask({ name: 'Pick up groceries', date: today, durationMin: 30, category: 'errand', priority: 'optional' }),
          demoTask({ name: 'Dentist appointment', date: addDaysISO(today, 1), startMin: 10 * 60 + 30, durationMin: 60, category: 'appointment', priority: 'must', flexibility: 'fixed', reminderMinBefore: 30 }),
          demoTask({ name: 'Write weekly update', date: addDaysISO(today, 1), startMin: 15 * 60, durationMin: 45, category: 'work' }),
          demoTask({ name: 'Evening walk', date: addDaysISO(today, 2), startMin: 18 * 60, durationMin: 30, category: 'health' }),
          demoTask({ name: 'Call family', date: addDaysISO(today, 3), startMin: 20 * 60, durationMin: 30, category: 'personal' }),
          demoTask({ name: 'Read saved article', date: null, durationMin: 25, category: 'study', priority: 'optional' }),
        ];
        const demoRoutines: Routine[] = [{
          id: makeId('demo-routine'), name: 'Plan tomorrow', category: 'routine',
          startMin: 21 * 60, durationMin: 15, days: [1, 2, 3, 4, 5], enabled: true, isDemo: true,
        }];
        const demoSnapshots: DaySnapshot[] = [
          { date: addDaysISO(today, -1), mood: 'productive', plannedCount: 5, completedCount: 4, focusMinutes: 80, closedAt: Date.now() - 86400000, isDemo: true },
          { date: addDaysISO(today, -2), mood: 'calm', plannedCount: 4, completedCount: 3, focusMinutes: 45, closedAt: Date.now() - 172800000, isDemo: true },
          { date: addDaysISO(today, -3), mood: 'heavy', plannedCount: 6, completedCount: 2, focusMinutes: 20, closedAt: Date.now() - 259200000, isDemo: true },
        ];
        const snapshots = Object.fromEntries(Object.entries(s.snapshots).filter(([, snap]) => !snap.isDemo));
        for (const snap of demoSnapshots) snapshots[snap.date] = snap;
        set({
          tasks: [...s.tasks.filter((task) => !task.isDemo), ...demoTasks],
          routines: [...s.routines.filter((routine) => !routine.isDemo), ...demoRoutines],
          snapshots,
        });
      },

      clearDemoData: () => set((s) => ({
        tasks: s.tasks.filter((task) => !task.isDemo),
        routines: s.routines.filter((routine) => !routine.isDemo),
        snapshots: Object.fromEntries(Object.entries(s.snapshots).filter(([, snap]) => !snap.isDemo)),
      })),
    }),
    {
      name: 'tinyday-data',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        routines: s.routines,
        snapshots: s.snapshots,
        routineSeededDates: s.routineSeededDates,
      }),
    }
  )
);

export function tasksForDate(tasks: Task[], date: string): Task[] {
  return tasks
    .filter((t) => t.date === date)
    .sort((a, b) => (a.startMin ?? 24 * 60) - (b.startMin ?? 24 * 60));
}

export function backlogTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.date === null);
}
