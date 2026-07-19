import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';
import { Button } from './Button';
import { TextField } from './controls';
import { CategoryChip, PlainChip, PriorityChip } from './chips';
import { useToast } from './Toast';
import { parseTaskLine } from '../lib/parse';
import { useTasks } from '../lib/store/tasks';
import { durationLabel, minToLabel, todayISO } from '../lib/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export function QuickAddSheet({ visible, onClose, defaultDate = todayISO() }: Props) {
  const t = useTheme();
  const toast = useToast();
  const addTask = useTasks((s) => s.addTask);
  const removeTask = useTasks((s) => s.removeTask);
  const [text, setText] = useState('');
  const parsed = useMemo(
    () => (text.trim().length > 1 ? parseTaskLine(text, defaultDate) : null),
    [defaultDate, text]
  );
  const [reminder, setReminder] = useState<number | null>(15);
  const [flexible, setFlexible] = useState(true);

  const submit = () => {
    if (!parsed) return;
    const task = addTask({
      name: parsed.name,
      date: parsed.date,
      startMin: parsed.startMin,
      durationMin: parsed.durationMin,
      priority: parsed.priority,
      category: parsed.category,
      flexibility: flexible && parsed.flexibility !== 'fixed' ? 'flexible' : 'fixed',
      reminderMinBefore: reminder,
    });
    setText('');
    onClose();
    toast.show({
      message: parsed.date === todayISO() ? 'Task added to today' : 'Task added to tomorrow',
      actionLabel: 'Undo',
      onAction: () => removeTask(task.id),
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title">New task</Text>
      <TextField
        value={text}
        onChangeText={setText}
        placeholder="Call the framer tomorrow at 4"
        autoFocus
        accessibilityLabel="Task name"
        style={{ marginTop: t.spacing.md, borderColor: parsed ? t.colors.sage : t.colors.borderStrong }}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <Text variant="caption" color={t.colors.sub} style={{ marginTop: 6 }}>
        Type naturally — Tiny Day fills in the details.
      </Text>
      {parsed && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.lg }}>
          <PlainChip label={parsed.date === todayISO() ? 'Today' : 'Tomorrow'} selected />
          {parsed.startMin != null && <PlainChip label={minToLabel(parsed.startMin)} selected />}
          <PlainChip label={durationLabel(parsed.durationMin)} />
          <CategoryChip category={parsed.category} />
          <PriorityChip priority={parsed.priority} />
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reminder: ${reminder == null ? 'none' : `${reminder} min before`}. Tap to change`}
          onPress={() => setReminder(reminder === 15 ? 30 : reminder === 30 ? null : 15)}
          style={{
            flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radius.md,
            borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md,
          }}
        >
          <Text variant="label" color={t.colors.sub}>Reminder</Text>
          <Text variant="taskTitle" style={{ marginTop: 4 }}>
            {reminder == null ? 'None' : `${reminder} min before`}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Flexibility: ${flexible ? 'can move' : 'fixed time'}. Tap to change`}
          onPress={() => setFlexible(!flexible)}
          style={{
            flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radius.md,
            borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md,
          }}
        >
          <Text variant="label" color={t.colors.sub}>Flexibility</Text>
          <Text variant="taskTitle" style={{ marginTop: 4 }}>{flexible ? 'Can move' : 'Fixed'}</Text>
        </Pressable>
      </View>
      <Button title="Add task" onPress={submit} disabled={!parsed} style={{ marginTop: t.spacing.xl }} />
    </BottomSheet>
  );
}
