import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { PriorityChip } from '../components/chips';
import { useTheme } from '../theme';
import { tasksForDate, useTasks } from '../lib/store/tasks';
import { minToLabel, todayISO } from '../lib/types';
import { useSettings } from '../lib/store/settings';

export default function NotificationCenterScreen() {
  const t = useTheme();
  const router = useRouter();
  const tasks = useTasks((s) => s.tasks);
  const level = useSettings((s) => s.notificationLevel);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const upcoming = useMemo(
    () =>
      tasksForDate(tasks, todayISO()).filter(
        (x) =>
          x.startMin != null &&
          x.startMin >= nowMin &&
          x.status !== 'completed' && x.status !== 'skipped' && x.status !== 'rescheduled' &&
          x.priority !== 'optional' &&
          !(x.priority === 'should' && level === 'minimal') &&
          level !== 'none'
      ),
    [tasks, nowMin, level]
  );

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="bodyBold" color={t.colors.sub}>‹ Back</Text>
      </Pressable>
      <Text variant="display">Reminders today</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
        ▲ Must = remind + one follow-up · ● Should = one reminder · ○ Optional stays silent.
      </Text>

      <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
        {level === 'none' && (
          <Card style={{ alignItems: 'center', paddingVertical: t.spacing.xl }}>
            <Text variant="title" center>All quiet</Text>
            <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
              You chose silence — nothing will interrupt you.
            </Text>
          </Card>
        )}
        {level !== 'none' && upcoming.length === 0 && (
          <Card style={{ alignItems: 'center', paddingVertical: t.spacing.xl }}>
            <Text variant="title" center>Nothing queued</Text>
            <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
              No reminders left for today. Enjoy the quiet.
            </Text>
          </Card>
        )}
        {upcoming.map((x) => (
          <Card key={x.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="cardTitle" style={{ flex: 1 }}>{x.name}</Text>
              <PriorityChip priority={x.priority} />
            </View>
            <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>
              Reminder ~{minToLabel(Math.max(0, (x.startMin ?? 0) - (x.reminderMinBefore ?? 15)))}
              {x.priority === 'must' ? ' · gentle follow-up 10 min after start' : ''}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
