import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Room } from '../../components/Room';
import { useIsTablet, useTheme } from '../../theme';
import { useSettings } from '../../lib/store/settings';
import { tasksForDate, useTasks } from '../../lib/store/tasks';
import { minToLabel, todayISO } from '../../lib/types';
import { longDateLabel } from '../../lib/format';
import { BrandMark } from '../../components/BrandMark';
import { TaskCard } from '../../components/TaskCard';
import { freeSlots } from '../../lib/schedule';

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}



export default function TodayScreen() {
  const t = useTheme();
  const isTablet = useIsTablet();
  const router = useRouter();
  const name = useSettings((s) => s.name);
  const wakeMin = useSettings((s) => s.wakeMin);
  const sleepMin = useSettings((s) => s.sleepMin);
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);

  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const done = today.filter((x) => x.status === 'completed');
  const free = useMemo(() => freeSlots(today, wakeMin, sleepMin, 45), [sleepMin, today, wakeMin]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const completion = today.length ? done.length / today.length : 0;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text variant="display">{greeting(name)}</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{longDateLabel()}</Text>
          <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>
            Do today’s tasks here. Use Plan to arrange upcoming days.
          </Text>
        </View>
        <BrandMark size={52} />
      </View>

      <View style={{ marginTop: t.spacing.lg }}>
        <Room completion={completion} height={isTablet ? 240 : 170} />
      </View>

      {today.length === 0 && (
        <Card style={{ marginTop: t.spacing.lg, alignItems: 'center', paddingVertical: t.spacing.xl }}>
          <Text variant="title" center>A fresh, open day</Text>
          <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
            Nothing planned yet. Empty your head and Tiny Day will shape it into a gentle plan.
          </Text>
          <Button title="Plan my morning" onPress={() => router.push('/planning')} style={{ marginTop: t.spacing.lg, alignSelf: 'stretch' }} />
        </Card>
      )}

      {today.length > 0 && (
        <View style={{ marginTop: t.spacing.xl }}>
          <Text variant="title">Today’s timeline</Text>
          <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>
            Everything planned today, including what you’ve finished.
          </Text>
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {today.map((task) => {
              const completedSlotPassed = task.status === 'completed' && task.startMin != null
                && task.startMin + task.durationMin <= nowMin;
              return (
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
                      toggleAccessibilityLabel={completedSlotPassed ? `View ${task.name} to reschedule it` : undefined}
                      onToggleComplete={() => {
                        if (completedSlotPassed) {
                          router.push(`/task/${task.id}`);
                          return;
                        }
                        setStatus(task.id, task.status === 'completed' ? 'not_started' : 'completed');
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
          {free.length > 0 && (
            <View style={{ marginTop: t.spacing.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.borderStrong, borderRadius: t.radius.md, padding: t.spacing.lg }}>
              <Text variant="body" color={t.colors.sub} center>
                Free slot · {minToLabel(free[0][0])} – {minToLabel(free[0][1])}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
            <Card style={{ flex: 1 }}>
              <Text variant="label" color={t.colors.sub}>Day progress</Text>
              <View style={{ height: 6, backgroundColor: t.colors.trackFill, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <View style={{ height: 6, width: `${Math.round(completion * 100)}%`, backgroundColor: t.colors.sage }} />
              </View>
              <Text variant="bodyBold" style={{ marginTop: 8 }}>{done.length} of {today.length}</Text>
            </Card>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My day went wrong — replan gently"
              onPress={() => router.push('/replan')}
              style={{ flex: 1, borderRadius: t.radius.md, borderWidth: 1.5, borderColor: t.colors.terra, alignItems: 'center', justifyContent: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface }}
            >
              <Text variant="taskTitle" color={t.colors.terra} center>↺ My day went wrong</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}
