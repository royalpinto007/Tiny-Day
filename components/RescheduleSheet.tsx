import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme';
import { addDaysISO, minToLabel, todayISO } from '../lib/types';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Text } from './Text';
import { dateButtonLabel, ScheduleField, TimeChoiceModal } from './QuickAddSheet';

interface Props {
  visible: boolean;
  currentDate: string | null;
  currentTime: number | null;
  onClose: () => void;
  onConfirm: (date: string, startMin: number) => void;
}

export function RescheduleSheet({ visible, currentDate, currentTime, onClose, onConfirm }: Props) {
  const t = useTheme();
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<number | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const today = todayISO();
    const now = new Date();
    const minimum = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 15) * 15;
    let nextDate = currentDate && currentDate >= today ? currentDate : today;
    let nextTime = currentTime;
    if (nextDate === today && (nextTime == null || nextTime < minimum)) nextTime = minimum <= 23 * 60 + 45 ? minimum : null;
    if (nextDate === today && nextTime == null && minimum > 23 * 60 + 45) {
      nextDate = addDaysISO(today, 1);
      nextTime = currentTime ?? 9 * 60;
    }
    setDate(nextDate);
    setTime(nextTime);
    setDatePickerVisible(false);
    setTimePickerVisible(false);
  }, [currentDate, currentTime, visible]);

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
      if (time <= nowMin) setTime(null);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title">Reschedule task</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 6 }}>
        Choose exactly when this task should return to your plan.
      </Text>
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
        <ScheduleField
          label="New date"
          value={dateButtonLabel(date)}
          accessibilityLabel={`New date: ${dateButtonLabel(date)}. Tap to change`}
          onPress={() => { Keyboard.dismiss(); setDatePickerVisible(true); }}
        />
        <ScheduleField
          label="New time"
          value={time == null ? 'Choose time' : minToLabel(time)}
          accessibilityLabel={`New time: ${time == null ? 'not selected' : minToLabel(time)}. Tap to change`}
          onPress={() => { Keyboard.dismiss(); setTimePickerVisible(true); }}
        />
      </View>
      {time == null && (
        <Text variant="caption" color={t.colors.terra} style={{ marginTop: 8 }}>
          Select a future time to reschedule this task.
        </Text>
      )}
      {datePickerVisible && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          minimumDate={new Date(`${todayISO()}T00:00:00`)}
          onChange={onDateChange}
        />
      )}
      <TimeChoiceModal
        visible={timePickerVisible}
        date={date}
        selected={time}
        allowAnyTime={false}
        onClose={() => setTimePickerVisible(false)}
        onSelect={(minutes) => {
          setTime(minutes);
          setTimePickerVisible(false);
        }}
      />
      <Button
        title="Confirm reschedule"
        disabled={time == null}
        style={{ marginTop: t.spacing.lg }}
        onPress={() => time != null && onConfirm(date, time)}
      />
      <Button title="Cancel" kind="tertiary" compact style={{ marginTop: t.spacing.sm }} onPress={onClose} />
    </BottomSheet>
  );
}
