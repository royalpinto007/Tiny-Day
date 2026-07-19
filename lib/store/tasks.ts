import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DaySnapshot, makeId, Routine, Task, todayISO } from '../types';

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
