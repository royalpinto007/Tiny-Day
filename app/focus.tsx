import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ProgressRing } from '../components/ProgressRing';
import { PriorityChip } from '../components/chips';
import { useTheme } from '../theme';
import { useTasks, tasksForDate } from '../lib/store/tasks';
import { todayISO } from '../lib/types';
import { useToast } from '../components/Toast';

export default function FocusScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const focusTaskId = useTasks((s) => s.focusTaskId);
  const task = useTasks((s) => s.tasks.find((x) => x.id === s.focusTaskId));
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);
  const updateTask = useTasks((s) => s.updateTask);
  const setFocusTask = useTasks((s) => s.setFocusTask);

  const [totalSec, setTotalSec] = useState(() => (task ? task.durationMin * 60 : 0));
  const [remaining, setRemaining] = useState(totalSec);
  const [paused, setPaused] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (task && !startedRef.current) {
      startedRef.current = true;
      if (task.status === 'not_started') updateTask(task.id, { status: 'in_progress' });
    }
  }, [task, updateTask]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [paused, remaining <= 0]);

  if (!task || focusTaskId == null) {
    return (
      <Screen>
        <Text variant="title">Nothing to focus on right now.</Text>
        <Button title="Back" kind="secondary" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  const open = tasksForDate(tasks, todayISO()).filter(
    (x) => x.id !== task.id && x.status !== 'completed' && x.status !== 'skipped' && x.status !== 'rescheduled'
  );
  const nextUp = open[0];
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStatus(task.id, 'completed');
    setFocusTask(null);
    toast.show({ message: 'Done. The room just got a little brighter.' });
    router.back();
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between', paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit focus"
          onPress={() => {
            setFocusTask(null);
            router.back();
          }}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text variant="bodyBold" color={t.colors.sub}>✕ Exit focus</Text>
        </Pressable>
        <PriorityChip priority={task.priority} />
      </View>

      <View style={{ alignItems: 'center' }}>
        <Text variant="label" color={t.colors.sub}>Focusing on</Text>
        <Text variant="display" center style={{ marginTop: 6 }}>{task.name}</Text>
        <View style={{ marginTop: t.spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing
            size={200}
            strokeWidth={12}
            progress={totalSec > 0 ? 1 - remaining / totalSec : 0}
          />
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text variant="display" style={{ fontSize: 40, lineHeight: 46 }}>
              {remaining <= 0 ? 'Time' : `${mm}:${ss}`}
            </Text>
            <Text variant="caption" color={t.colors.sub}>
              {remaining <= 0 ? 'is up — no rush' : paused ? 'paused' : 'remaining'}
            </Text>
          </View>
        </View>
        {nextUp && (
          <Text variant="body" color={t.colors.sub} style={{ marginTop: t.spacing.xl }}>
            Next up: <Text variant="bodyBold">{nextUp.name}</Text>
          </Text>
        )}
      </View>

      <View>
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <Button title={paused ? 'Resume' : 'Pause'} kind="secondary" style={{ flex: 1 }} onPress={() => setPaused(!paused)} />
          <Button title="Complete" style={{ flex: 1.2 }} onPress={complete} />
          <Button
            title="+10 min"
            kind="secondary"
            style={{ flex: 1 }}
            onPress={() => {
              setTotalSec((s) => s + 600);
              setRemaining((r) => r + 600);
            }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setFocusTask(null);
            router.replace('/replan');
          }}
          style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}
        >
          <Text variant="body" color={t.colors.sub}>I’m stuck — help me adjust</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
