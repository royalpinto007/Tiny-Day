import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  const [dateOverride, setDateOverride] = useState<string>();
  const [timeOverride, setTimeOverride] = useState<number | null>();
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const requestedDate = dateOverride ?? parsed?.date ?? defaultDate;
  const scheduledDate = requestedDate < todayISO() ? todayISO() : requestedDate;
  const scheduledTime = timeOverride !== undefined ? timeOverride : parsed?.startMin ?? null;

  useEffect(() => {
    if (!visible) return;
    setDateOverride(undefined);
    setTimeOverride(undefined);
    setPicker(null);
  }, [defaultDate, visible]);

  const pickerValue = useMemo(() => {
    if (picker === 'date') return new Date(`${scheduledDate}T12:00:00`);
    const value = new Date();
    const minutes = scheduledTime ?? 9 * 60;
    value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return value;
  }, [picker, scheduledDate, scheduledTime]);

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    const mode = picker;
    setPicker(null);
    if (event.type === 'dismissed' || !value || !mode) return;
    if (mode === 'date') {
      const selectedDate = todayISO(value);
      setDateOverride(selectedDate < todayISO() ? todayISO() : selectedDate);
    }
    else setTimeOverride(value.getHours() * 60 + value.getMinutes());
  };

  const submit = () => {
    if (!parsed) return;
    const task = addTask({
      name: parsed.name,
      date: scheduledDate,
      startMin: scheduledTime,
      durationMin: parsed.durationMin,
      priority: parsed.priority,
      category: parsed.category,
      flexibility: scheduledTime == null && flexible && parsed.flexibility !== 'fixed' ? 'flexible' : 'fixed',
      reminderMinBefore: reminder,
    });
    setText('');
    onClose();
    toast.show({
      message: `Task added to ${dateButtonLabel(scheduledDate)}`,
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
        Type naturally, then confirm when it belongs.
      </Text>
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
        <ScheduleField
          label="Date"
          value={dateButtonLabel(scheduledDate)}
          accessibilityLabel={`Date: ${dateButtonLabel(scheduledDate)}. Tap to change`}
          onPress={() => { Keyboard.dismiss(); setPicker('date'); }}
        />
        <ScheduleField
          label="Time"
          value={scheduledTime == null ? 'Any time' : minToLabel(scheduledTime)}
          accessibilityLabel={`Time: ${scheduledTime == null ? 'any time' : minToLabel(scheduledTime)}. Tap to change`}
          onPress={() => { Keyboard.dismiss(); setPicker('time'); }}
        />
      </View>
      {scheduledTime != null && (
        <Pressable accessibilityRole="button" onPress={() => setTimeOverride(null)} style={{ alignSelf: 'flex-end', minHeight: 36, justifyContent: 'center' }}>
          <Text variant="caption" color={t.colors.sageDeep}>Clear time</Text>
        </Pressable>
      )}
      {picker && (
        <DateTimePicker
          value={pickerValue}
          mode={picker}
          minimumDate={picker === 'date' ? new Date(`${todayISO()}T00:00:00`) : undefined}
          onChange={onPickerChange}
        />
      )}
      {parsed && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.lg }}>
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
      <Button title="Add task" onPress={submit} disabled={!parsed} style={{ marginTop: t.spacing.lg }} />
    </BottomSheet>
  );
}

function ScheduleField({ label, value, accessibilityLabel, onPress }: {
  label: string;
  value: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 68,
        justifyContent: 'center',
        backgroundColor: t.colors.surface,
        borderRadius: t.radius.md,
        borderWidth: 1.5,
        borderColor: t.colors.borderStrong,
        paddingHorizontal: t.spacing.md,
      }}
    >
      <Text variant="label" color={t.colors.sub}>{label}</Text>
      <Text variant="taskTitle" numberOfLines={1} style={{ marginTop: 4 }}>{value}</Text>
    </Pressable>
  );
}

function dateButtonLabel(iso: string): string {
  if (iso === todayISO()) return 'Today';
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
