import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme';
import { durationLabel, Flexibility, minToLabel, Priority, Task, todayISO } from '../lib/types';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Text } from './Text';
import { TextField } from './controls';
import { dateButtonLabel, ScheduleField, TimeChoiceModal } from './QuickAddSheet';

interface Props {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onSave: (patch: Partial<Task>) => void;
}

export function EditTaskSheet({ visible, task, onClose, onSave }: Props) {
  const t = useTheme();
  const [name, setName] = useState(task.name);
  const [date, setDate] = useState(task.date ?? todayISO());
  const [time, setTime] = useState<number | null>(task.startMin);
  const [duration, setDuration] = useState(task.durationMin);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [reminder, setReminder] = useState<number | null>(task.reminderMinBefore);
  const [flexibility, setFlexibility] = useState<Flexibility>(task.flexibility);
  const [notes, setNotes] = useState(task.notes ?? '');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(task.name);
    setDate(task.date && task.date >= todayISO() ? task.date : todayISO());
    setTime(task.startMin);
    setDuration(task.durationMin);
    setPriority(task.priority);
    setReminder(task.reminderMinBefore);
    setFlexibility(task.flexibility);
    setNotes(task.notes ?? '');
    setDatePickerVisible(false);
    setTimePickerVisible(false);
  }, [task, visible]);

  const pickerValue = useMemo(() => new Date(`${date}T12:00:00`), [date]);
  const onDateChange = (event: DateTimePickerEvent, value?: Date) => {
    setDatePickerVisible(false);
    if (event.type === 'dismissed' || !value) return;
    const selected = todayISO(value);
    const safeDate = selected < todayISO() ? todayISO() : selected;
    setDate(safeDate);
    if (safeDate === todayISO() && time != null) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const taskIsCurrentlyRunning = task.date === safeDate && task.startMin === time && time + task.durationMin > nowMin;
      if (time <= nowMin && !taskIsCurrentlyRunning) setTime(null);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title">Edit task</Text>
      <TextField
        value={name}
        onChangeText={setName}
        accessibilityLabel="Task name"
        placeholder="Task name"
        style={{ marginTop: t.spacing.lg }}
      />
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
        <ScheduleField label="Date" value={dateButtonLabel(date)} accessibilityLabel={`Date: ${dateButtonLabel(date)}. Tap to change`} onPress={() => { Keyboard.dismiss(); setDatePickerVisible(true); }} />
        <ScheduleField label="Time" value={time == null ? 'Any time' : minToLabel(time)} accessibilityLabel={`Time: ${time == null ? 'any time' : minToLabel(time)}. Tap to change`} onPress={() => { Keyboard.dismiss(); setTimePickerVisible(true); }} />
      </View>
      {datePickerVisible && <DateTimePicker value={pickerValue} mode="date" minimumDate={new Date(`${todayISO()}T00:00:00`)} onChange={onDateChange} />}
      <TimeChoiceModal visible={timePickerVisible} date={date} selected={time} onClose={() => setTimePickerVisible(false)} onSelect={(value) => { setTime(value); setTimePickerVisible(false); }} />

      <ChoiceSection label="Duration">
        {[15, 30, 45, 60, 90, 120].map((value) => <Choice key={value} label={durationLabel(value)} selected={duration === value} onPress={() => setDuration(value)} />)}
      </ChoiceSection>
      <ChoiceSection label="Priority">
        {([['must', 'Must'], ['should', 'Should'], ['optional', 'Optional']] as [Priority, string][]).map(([value, label]) => <Choice key={value} label={label} selected={priority === value} onPress={() => setPriority(value)} />)}
      </ChoiceSection>
      <ChoiceSection label="Reminder">
        {([['15 min', 15], ['30 min', 30], ['1 hour', 60], ['None', null]] as [string, number | null][]).map(([label, value]) => <Choice key={label} label={label} selected={reminder === value} onPress={() => setReminder(value)} />)}
      </ChoiceSection>
      <ChoiceSection label="Flexibility">
        <Choice label="Can move" selected={flexibility === 'flexible'} onPress={() => setFlexibility('flexible')} />
        <Choice label="Fixed" selected={flexibility === 'fixed'} onPress={() => setFlexibility('fixed')} />
      </ChoiceSection>
      <Text variant="label" color={t.colors.sub} style={{ marginTop: t.spacing.lg, marginBottom: 6 }}>Notes</Text>
      <TextField value={notes} onChangeText={setNotes} accessibilityLabel="Task notes" placeholder="Optional notes" multiline style={{ minHeight: 86, textAlignVertical: 'top' }} />
      <Button
        title="Save changes"
        disabled={!name.trim()}
        style={{ marginTop: t.spacing.lg }}
        onPress={() => onSave({ name: name.trim(), date, startMin: time, durationMin: duration, priority, reminderMinBefore: reminder, flexibility, notes: notes.trim() || undefined })}
      />
      <Button title="Cancel" kind="tertiary" compact style={{ marginTop: t.spacing.sm }} onPress={onClose} />
    </BottomSheet>
  );
}

function ChoiceSection({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ marginTop: t.spacing.lg }}><Text variant="label" color={t.colors.sub} style={{ marginBottom: 7 }}>{label}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{children}</View></View>;
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: t.radius.pill, backgroundColor: selected ? t.colors.sage : t.colors.surfaceAlt }}><Text variant="bodyBold" color={selected ? t.colors.onSage : t.colors.sub} style={{ fontSize: 12.5 }}>{label}</Text></Pressable>;
}
