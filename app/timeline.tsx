import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TaskCard } from '../components/TaskCard';
import { useTheme } from '../theme';
import { tasksForDate, useTasks } from '../lib/store/tasks';
import { minToLabel, todayISO } from '../lib/types';
import { freeSlots } from '../lib/schedule';
import { useSettings } from '../lib/store/settings';

export default function TimelineScreen() {
  const t = useTheme();
  const router = useRouter();
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);
  const wakeMin = useSettings((s) => s.wakeMin);
  const sleepMin = useSettings((s) => s.sleepMin);
  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const slots = useMemo(() => freeSlots(today, wakeMin, sleepMin, 45), [today, wakeMin, sleepMin]);

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="bodyBold" color={t.colors.sub}>‹ Back</Text>
      </Pressable>
      <Text variant="display">Today’s timeline</Text>
      <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>
        Tap a card for details.
      </Text>

      <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
        {today.length === 0 && (
          <Text variant="body" color={t.colors.sub}>Nothing scheduled yet — add something from the + button.</Text>
        )}
        {today.map((task) => (
          <View key={task.id} style={{ flexDirection: 'row', gap: t.spacing.md }}>
            <View style={{ width: 48, paddingTop: 14 }}>
              {task.startMin != null ? (
                <>
                  <Text variant="bodyBold" color={t.colors.sub}>{minToLabel(task.startMin).replace(/ (AM|PM)/, '')}</Text>
                  <Text variant="caption" color={t.colors.faint}>{task.durationMin}m</Text>
                </>
              ) : (
                <Text variant="caption" color={t.colors.faint}>any{'\n'}time</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <TaskCard
                task={task}
                onPress={() => router.push(`/task/${task.id}`)}
                onToggleComplete={() => setStatus(task.id, task.status === 'completed' ? 'not_started' : 'completed')}
              />
            </View>
          </View>
        ))}
      </View>

      {slots.length > 0 && (
        <View
          style={{
            marginTop: t.spacing.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.borderStrong,
            borderRadius: t.radius.md, padding: t.spacing.lg, alignItems: 'center',
          }}
        >
          <Text variant="body" color={t.colors.sub} center>
            + Free slot · {minToLabel(slots[0][0])} – {minToLabel(slots[0][1])} · add something or keep it free
          </Text>
        </View>
      )}
    </Screen>
  );
}
