import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme';
import { buildRepairPlan, WrongReason } from '../lib/repair';
import { tasksForDate, useTasks } from '../lib/store/tasks';
import { useSettings } from '../lib/store/settings';
import { minToLabel, PRIORITY_GLYPH, todayISO } from '../lib/types';

const REASONS: { key: WrongReason; title: string; note: string }[] = [
  { key: 'woke_late', title: 'I woke up late', note: 'The morning slipped — we’ll compress gently.' },
  { key: 'ran_long', title: 'A task ran long', note: 'It happens. We’ll make room.' },
  { key: 'too_tired', title: 'I’m too tired', note: 'We’ll lighten the day and add rest.' },
  { key: 'urgent_thing', title: 'Something urgent came up', note: 'We’ll protect what matters and shift the rest.' },
];

type Step = 'reason' | 'compare' | 'done';

export default function ReplanScreen() {
  const t = useTheme();
  const router = useRouter();
  const tasks = useTasks((s) => s.tasks);
  const updateTask = useTasks((s) => s.updateTask);
  const addTask = useTasks((s) => s.addTask);
  const { sleepMin } = useSettings();
  const [step, setStep] = useState<Step>('reason');
  const [reason, setReason] = useState<WrongReason | null>(null);

  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const plan = useMemo(
    () => (reason ? buildRepairPlan(today, reason, nowMin, sleepMin, todayISO()) : null),
    [reason, today, nowMin, sleepMin]
  );

  const apply = () => {
    if (!plan) return;
    for (const ch of plan.changes) {
      updateTask(ch.taskId, ch.patch);
    }
    if (plan.restInserted) {
      addTask({ name: 'Rest', category: 'break', durationMin: 20, priority: 'must', date: todayISO(), reminderMinBefore: null });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStep('done');
  };

  return (
    <Screen padBottom={40}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="bodyBold" color={t.colors.sub}>✕ Close</Text>
      </Pressable>

      {step === 'reason' && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>Plans changed.{'\n'}That’s okay.</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>What happened?</Text>
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {REASONS.map((r) => (
              <Pressable key={r.key} accessibilityRole="radio" accessibilityState={{ selected: reason === r.key }}
                onPress={() => setReason(r.key)}>
                <Card style={{ borderColor: reason === r.key ? t.colors.terra : t.colors.border, borderWidth: reason === r.key ? 2 : 1 }}>
                  <Text variant="cardTitle">{r.title}</Text>
                  <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{r.note}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
          <Button title="Suggest a repair" disabled={!reason} onPress={() => setStep('compare')} style={{ marginTop: t.spacing.xl }} />
        </>
      )}

      {step === 'compare' && plan && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>A gentle repair</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            ▲ Musts and fixed appointments stay put. {plan.summary}.
          </Text>

          {plan.changes.length === 0 && !plan.restInserted ? (
            <Card style={{ marginTop: t.spacing.lg }}>
              <Text variant="cardTitle">Your day already looks kind to you.</Text>
              <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>Nothing needs to move.</Text>
            </Card>
          ) : (
            <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
              {plan.changes.map((ch, i) => (
                <Card key={`${ch.taskId}-${ch.kind}-${i}`}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="taskTitle" style={{ flex: 1 }}>{ch.taskName}</Text>
                    <Text variant="caption" color={t.colors.terra}>
                      {ch.kind === 'moved_tomorrow' ? 'before: today · after: tomorrow'
                        : ch.kind === 'shortened' ? 'shorter'
                        : ch.patch.startMin != null ? `after: ${minToLabel(ch.patch.startMin)}` : ''}
                    </Text>
                  </View>
                  <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{ch.detail}</Text>
                </Card>
              ))}
              {plan.restInserted && (
                <Card style={{ backgroundColor: t.colors.successFill, borderColor: 'transparent' }}>
                  <Text variant="taskTitle" color={t.colors.successText}>+ 20 min of rest, because you asked your day for too much.</Text>
                </Card>
              )}
            </View>
          )}

          <Button title="Repair my day" onPress={apply} style={{ marginTop: t.spacing.xl }} />
          <Pressable accessibilityRole="button" onPress={() => setStep('reason')} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="body" color={t.colors.sub}>Pick a different reason</Text>
          </Pressable>
        </>
      )}

      {step === 'done' && (
        <View style={{ alignItems: 'center', marginTop: 120 }}>
          <Text variant="display" center>Your day has{'\n'}been repaired.</Text>
          <Text variant="body" color={t.colors.sub} center style={{ marginTop: 8 }}>
            The protected things are safe. The rest found new homes.
          </Text>
          <Button title="Back to today" onPress={() => router.back()} style={{ marginTop: t.spacing.xl, alignSelf: 'stretch' }} />
        </View>
      )}
    </Screen>
  );
}
