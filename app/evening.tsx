import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MoodSelector, TextField } from '../components/controls';
import { Room } from '../components/Room';
import { useTheme } from '../theme';
import { tasksForDate, useTasks } from '../lib/store/tasks';
import { addDaysISO, Mood, PRIORITY_GLYPH, Task, todayISO } from '../lib/types';

type Step = 'mood' | 'summary' | 'leftovers' | 'closed';
type Triage = 'tomorrow' | 'backlog' | 'let_go';

export default function EveningScreen() {
  const t = useTheme();
  const router = useRouter();
  const tasks = useTasks((s) => s.tasks);
  const updateTask = useTasks((s) => s.updateTask);
  const setStatus = useTasks((s) => s.setStatus);
  const saveSnapshot = useTasks((s) => s.saveSnapshot);

  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<Mood | undefined>();
  const [reflection, setReflection] = useState('');
  const [choices, setChoices] = useState<Record<string, Triage>>({});

  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const done = today.filter((x) => x.status === 'completed');
  const leftovers = today.filter(
    (x) => x.status !== 'completed' && x.status !== 'skipped' && x.status !== 'rescheduled'
  );
  const focusMinutes = done.reduce((sum, x) => sum + x.durationMin, 0);

  const closeDay = () => {
    for (const task of leftovers) {
      const choice = choices[task.id] ?? 'tomorrow';
      if (choice === 'tomorrow') {
        updateTask(task.id, { date: addDaysISO(todayISO(), 1), startMin: null, status: 'not_started' });
      } else if (choice === 'backlog') {
        updateTask(task.id, { date: null, startMin: null, status: 'not_started' });
      } else {
        setStatus(task.id, 'skipped');
      }
    }
    saveSnapshot({
      date: todayISO(),
      mood,
      reflection: reflection.trim() || undefined,
      plannedCount: today.length,
      completedCount: done.length,
      focusMinutes,
      closedAt: Date.now(),
    });
    setStep('closed');
  };

  return (
    <Screen padBottom={40}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="bodyBold" color={t.colors.sub}>✕ Close</Text>
      </Pressable>

      {step === 'mood' && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>How did today{'\n'}feel?</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            Not how much you did — how it felt.
          </Text>
          <View style={{ marginTop: t.spacing.xl }}>
            <MoodSelector value={mood} onChange={setMood} />
          </View>
          <TextField
            value={reflection}
            onChangeText={setReflection}
            placeholder="A line about today, if you like…"
            style={{ marginTop: t.spacing.xl }}
            accessibilityLabel="Reflection"
          />
          <Button title="Continue" onPress={() => setStep('summary')} style={{ marginTop: t.spacing.xl }} />
        </>
      )}

      {step === 'summary' && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>Today, gently{'\n'}counted</Text>
          <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="display" color={t.colors.sageDeep}>{done.length}</Text>
              <Text variant="caption" color={t.colors.sub}>things done</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="display" color={t.colors.blue}>{Math.round(focusMinutes / 6) / 10}h</Text>
              <Text variant="caption" color={t.colors.sub}>of focus</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text variant="display" color={t.colors.terra}>{leftovers.length}</Text>
              <Text variant="caption" color={t.colors.sub}>left over</Text>
            </Card>
          </View>
          {done.length > 0 && (
            <Card style={{ marginTop: t.spacing.md }}>
              <Text variant="label" color={t.colors.sub}>Done today</Text>
              {done.map((x) => (
                <Text key={x.id} variant="body" color={t.colors.sub} style={{ marginTop: 6 }}>
                  ✓ {x.name}
                </Text>
              ))}
            </Card>
          )}
          <Button
            title={leftovers.length > 0 ? 'Sort the leftovers' : 'Close the day'}
            onPress={() => (leftovers.length > 0 ? setStep('leftovers') : closeDay())}
            style={{ marginTop: t.spacing.xl }}
          />
        </>
      )}

      {step === 'leftovers' && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>What about{'\n'}these?</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            Nothing carries over on its own. You decide — and “let go” is a fine choice.
          </Text>
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {leftovers.map((task: Task) => {
              const choice = choices[task.id] ?? 'tomorrow';
              return (
                <Card key={task.id}>
                  <Text variant="cardTitle">{PRIORITY_GLYPH[task.priority]} {task.name}</Text>
                  <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: 10 }}>
                    {([
                      ['tomorrow', 'Tomorrow'],
                      ['backlog', 'Backlog'],
                      ['let_go', 'Let go'],
                    ] as [Triage, string][]).map(([key, label]) => (
                      <Pressable
                        key={key}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: choice === key }}
                        onPress={() => setChoices((c) => ({ ...c, [task.id]: key }))}
                        style={{
                          flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center',
                          borderRadius: t.radius.pill,
                          backgroundColor: choice === key ? t.colors.sage : t.colors.surfaceAlt,
                        }}
                      >
                        <Text variant="bodyBold" color={choice === key ? t.colors.onSage : t.colors.sub} style={{ fontSize: 12.5 }}>
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Card>
              );
            })}
          </View>
          <Button title="Close the day" onPress={closeDay} style={{ marginTop: t.spacing.xl }} />
        </>
      )}

      {step === 'closed' && (
        <View style={{ marginTop: 40 }}>
          <Room state="night" height={190} />
          <Text variant="display" center style={{ marginTop: t.spacing.xl }}>You did enough{'\n'}for today.</Text>
          <Text variant="body" color={t.colors.sub} center style={{ marginTop: 8 }}>
            The lamp is on, the room is quiet. Tomorrow is already sketched.
          </Text>
          <Button title="Good night" onPress={() => router.back()} style={{ marginTop: t.spacing.xl }} />
        </View>
      )}
    </Screen>
  );
}
