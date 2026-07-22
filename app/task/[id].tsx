import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CategoryChip, PriorityChip, StatusChip } from '../../components/chips';
import { useTheme } from '../../theme';
import { useTasks } from '../../lib/store/tasks';
import { durationLabel, minToLabel, todayISO } from '../../lib/types';
import { useToast } from '../../components/Toast';
import { RescheduleSheet } from '../../components/RescheduleSheet';

export default function TaskDetailsScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTasks((s) => s.tasks.find((x) => x.id === id));
  const updateTask = useTasks((s) => s.updateTask);
  const setStatus = useTasks((s) => s.setStatus);
  const removeTask = useTasks((s) => s.removeTask);
  const setFocusTask = useTasks((s) => s.setFocusTask);
  const [rescheduleVisible, setRescheduleVisible] = useState(false);

  if (!task) {
    return (
      <Screen>
        <Text variant="title">This task has floated away.</Text>
        <Button title="Back" kind="secondary" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slotHasPassed = task.date != null && (
    task.date < todayISO()
    || (task.date === todayISO() && task.startMin != null && task.startMin + task.durationMin <= nowMin)
  );
  const expiredCompletion = task.status === 'completed' && slotHasPassed;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text variant="bodyBold" color={t.colors.sub}>‹ Back</Text>
        </Pressable>
        <Text variant="label" color={t.colors.sub}>Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text variant="display" style={{ marginTop: 8 }}>{task.name}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: t.spacing.md }}>
        <PriorityChip priority={task.priority} />
        <CategoryChip category={task.category} />
        <StatusChip status={task.status} />
      </View>

      <Card style={{ marginTop: t.spacing.lg, gap: t.spacing.md }}>
        <Row label="Scheduled" value={
          task.date == null ? 'Backlog'
          : `${task.date === todayISO() ? 'Today' : task.date}${task.startMin != null
            ? ` · ${minToLabel(task.startMin)} – ${minToLabel(task.startMin + task.durationMin)}` : ''}`
        } />
        <Row label="Duration" value={durationLabel(task.durationMin)} />
        <Row label="Reminder" value={task.reminderMinBefore == null ? 'None' : `${task.reminderMinBefore} min before`} />
        <Row label="Flexibility" value={task.flexibility === 'fixed' ? 'Fixed' : 'Can move'} />
      </Card>

      {task.subtasks.length > 0 && (
        <Card style={{ marginTop: t.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label" color={t.colors.sub}>Subtasks</Text>
            <Text variant="bodyBold" color={t.colors.sageDeep}>{doneSubs} of {task.subtasks.length}</Text>
          </View>
          {task.subtasks.map((sub) => (
            <Pressable
              key={sub.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: sub.done }}
              onPress={() =>
                updateTask(task.id, {
                  subtasks: task.subtasks.map((x) => (x.id === sub.id ? { ...x, done: !x.done } : x)),
                })
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}
            >
              <View
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  borderWidth: sub.done ? 0 : 1.5, borderColor: t.colors.borderStrong,
                  backgroundColor: sub.done ? t.colors.sage : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {sub.done && <Text variant="caption" color={t.colors.onSage}>✓</Text>}
              </View>
              <Text
                variant="taskTitle"
                color={sub.done ? t.colors.faint : t.colors.ink}
                style={sub.done ? { textDecorationLine: 'line-through' } : undefined}
              >
                {sub.name}
              </Text>
            </Pressable>
          ))}
        </Card>
      )}

      {task.notes ? (
        <Card style={{ marginTop: t.spacing.md }}>
          <Text variant="label" color={t.colors.sub}>Notes</Text>
          <Text variant="body" style={{ marginTop: 6 }}>{task.notes}</Text>
        </Card>
      ) : null}

      <Button
        title="Start focus"
        style={{ marginTop: t.spacing.xl }}
        onPress={() => {
          setFocusTask(task.id);
          router.push('/focus');
        }}
      />
      {expiredCompletion && (
        <Text variant="caption" color={t.colors.sub} center style={{ marginTop: t.spacing.md }}>
          This completed time has passed. Reschedule it to work on it again.
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
        {!expiredCompletion && (
          <Button
            title={task.status === 'completed' ? 'Mark not done' : 'Mark complete'}
            kind="secondary"
            style={{ flex: 1 }}
            onPress={() => {
              setStatus(task.id, task.status === 'completed' ? 'not_started' : 'completed');
              router.back();
            }}
          />
        )}
        <Button
          title="Reschedule"
          kind="secondary"
          style={{ flex: 1 }}
          onPress={() => setRescheduleVisible(true)}
        />
      </View>
      <Button
        title="Delete task"
        kind="tertiary"
        compact
        style={{ marginTop: t.spacing.md, alignSelf: 'center' }}
        onPress={() => {
          removeTask(task.id);
          router.back();
        }}
      />
      <RescheduleSheet
        visible={rescheduleVisible}
        currentDate={task.date}
        currentTime={task.startMin}
        onClose={() => setRescheduleVisible(false)}
        onConfirm={(date, startMin) => {
          updateTask(task.id, { date, startMin, status: 'rescheduled', completedAt: undefined });
          setRescheduleVisible(false);
          toast.show({ message: `Rescheduled for ${date === todayISO() ? 'today' : date} at ${minToLabel(startMin)}.` });
        }}
      />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="body" color={t.colors.sub}>{label}</Text>
      <Text variant="taskTitle">{value}</Text>
    </View>
  );
}
