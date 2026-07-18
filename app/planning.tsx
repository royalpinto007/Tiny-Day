import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextField } from '../components/controls';
import { CategoryChip, PlainChip, PriorityChip } from '../components/chips';
import { useTheme } from '../theme';
import { parseBrainDump, ParsedTask } from '../lib/parse';
import { buildDayTimeline, findConflicts } from '../lib/schedule';
import { useSettings } from '../lib/store/settings';
import { useTasks } from '../lib/store/tasks';
import {
  CATEGORIES, durationLabel, makeId, minToLabel, Priority, PRIORITY_GLYPH, Task, todayISO,
} from '../lib/types';

type Step = 1 | 2 | 3 | 4;

interface Draft extends ParsedTask {
  id: string;
  energy?: 'low' | 'high';
}

const NEXT_PRIORITY: Record<Priority, Priority> = { must: 'should', should: 'optional', optional: 'must' };
const DURATIONS = [15, 20, 30, 40, 45, 60, 90, 120];

export default function PlanningScreen() {
  const t = useTheme();
  const router = useRouter();
  const { wakeMin, sleepMin, lunchMin } = useSettings();
  const addTask = useTasks((s) => s.addTask);
  const [step, setStep] = useState<Step>(1);
  const [dump, setDump] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const patch = (id: string, p: Partial<Draft>) =>
    setDrafts((d) => d.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const scheduled = useMemo(() => {
    if (step !== 4) return [];
    const withLunch: Draft[] = [
      ...drafts,
      { id: '__lunch__', name: 'Lunch', category: 'meal', durationMin: 45, priority: 'should', date: todayISO(), startMin: lunchMin, flexibility: 'fixed' },
    ];
    const asTasks: Task[] = withLunch.map((d) => ({
      id: d.id, name: d.name, date: todayISO(), startMin: d.startMin, durationMin: d.durationMin,
      priority: d.priority, category: d.category, status: 'not_started', flexibility: d.flexibility,
      reminderMinBefore: 15, subtasks: [], createdAt: 0, energy: d.energy,
    }));
    const placements = buildDayTimeline(asTasks, wakeMin, sleepMin);
    return asTasks
      .map((x) => ({ ...x, startMin: placements.get(x.id) ?? null }))
      .sort((a, b) => (a.startMin ?? 1e9) - (b.startMin ?? 1e9));
  }, [step, drafts, wakeMin, sleepMin, lunchMin]);

  const conflicts = useMemo(() => findConflicts(scheduled), [scheduled]);
  const unplaced = scheduled.filter((x) => x.startMin == null);

  const confirm = () => {
    for (const x of scheduled) {
      if (x.id === '__lunch__') {
        addTask({ name: 'Lunch', category: 'meal', durationMin: 45, priority: 'should', date: todayISO(), startMin: x.startMin, flexibility: 'fixed', reminderMinBefore: null });
      } else {
        addTask({
          name: x.name, category: x.category, durationMin: x.durationMin, priority: x.priority,
          date: todayISO(), startMin: x.startMin, flexibility: x.flexibility, energy: x.energy,
        });
      }
    }
    router.replace('/(tabs)/today');
  };

  return (
    <Screen padBottom={40}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back"
          onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text variant="bodyBold" color={t.colors.sub}>‹</Text>
        </Pressable>
        <Text variant="label" color={t.colors.sub}>Build your day · {step} of 4</Text>
        <View style={{ width: 24 }} />
      </View>

      {step === 1 && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>What’s on your{'\n'}mind today?</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            One thing per line. Don’t sort it — just empty your head.
          </Text>
          <TextField
            value={dump}
            onChangeText={setDump}
            placeholder={'Finish client storyboard 90 min\nCall mom\nBuy shampoo\nGym at 5'}
            multiline
            numberOfLines={8}
            autoFocus
            style={{ marginTop: t.spacing.lg, minHeight: 180, textAlignVertical: 'top' }}
            accessibilityLabel="Brain dump"
          />
          <Button
            title="Shape my day"
            disabled={dump.trim().length < 2}
            onPress={() => {
              setDrafts(parseBrainDump(dump).map((p) => ({ ...p, id: makeId('d') })));
              setStep(2);
            }}
            style={{ marginTop: t.spacing.xl }}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>Did we get{'\n'}these right?</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            Tap a chip to change it. Nothing is locked in yet.
          </Text>
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {drafts.map((d) => (
              <Card key={d.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="cardTitle" style={{ flex: 1 }}>{d.name}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${d.name}`} hitSlop={8}
                    onPress={() => setDrafts((x) => x.filter((y) => y.id !== d.id))}>
                    <Text variant="bodyBold" color={t.colors.faint}>✕</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Priority ${d.priority}, tap to change`}
                    onPress={() => patch(d.id, { priority: NEXT_PRIORITY[d.priority] })}>
                    <PriorityChip priority={d.priority} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Category ${d.category}, tap to change`}
                    onPress={() => patch(d.id, { category: CATEGORIES[(CATEGORIES.indexOf(d.category) + 1) % CATEGORIES.length] })}>
                    <CategoryChip category={d.category} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Duration ${d.durationMin} minutes, tap to change`}
                    onPress={() => {
                      const i = DURATIONS.findIndex((x) => x >= d.durationMin);
                      patch(d.id, { durationMin: DURATIONS[(i + 1) % DURATIONS.length] });
                    }}>
                    <PlainChip label={durationLabel(d.durationMin)} />
                  </Pressable>
                  {d.startMin != null && <PlainChip label={minToLabel(d.startMin)} selected />}
                </View>
              </Card>
            ))}
          </View>
          <Button title="Continue" disabled={drafts.length === 0} onPress={() => setStep(3)} style={{ marginTop: t.spacing.xl }} />
        </>
      )}

      {step === 3 && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>When’s your{'\n'}best energy?</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            Mark the heavy thinkers — they’ll get your best hours. ▲ musts are always protected.
          </Text>
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {drafts.map((d) => (
              <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text variant="taskTitle">{PRIORITY_GLYPH[d.priority]} {d.name}</Text>
                  <Text variant="caption" color={t.colors.sub}>{durationLabel(d.durationMin)}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${d.name}: ${d.energy === 'high' ? 'deep focus' : 'light'} — tap to switch`}
                  onPress={() => patch(d.id, { energy: d.energy === 'high' ? 'low' : 'high' })}
                >
                  <PlainChip label={d.energy === 'high' ? 'Deep focus' : 'Light'} selected={d.energy === 'high'} />
                </Pressable>
              </Card>
            ))}
          </View>
          <Button title="Build my timeline" onPress={() => setStep(4)} style={{ marginTop: t.spacing.xl }} />
        </>
      )}

      {step === 4 && (
        <>
          <Text variant="display" style={{ marginTop: 8 }}>Here’s a gentle plan</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
            Lunch is protected. Free time is kept open on purpose.
          </Text>

          {conflicts.length > 0 && (
            <Card style={{ marginTop: t.spacing.lg, backgroundColor: t.colors.mustFill, borderColor: 'transparent' }}>
              <Text variant="taskTitle" color={t.colors.mustText}>{conflicts[0].message}</Text>
              <View style={{ flexDirection: 'row', gap: t.spacing.lg, marginTop: 8 }}>
                <Pressable accessibilityRole="button" style={{ minHeight: 32, justifyContent: 'center' }}
                  onPress={() => {
                    const later = conflicts[0].b;
                    if (later.id !== '__lunch__') {
                      patch(later.id, { startMin: null, flexibility: 'flexible' });
                    } else {
                      patch(conflicts[0].a.id, { startMin: null, flexibility: 'flexible' });
                    }
                  }}>
                  <Text variant="bodyBold" color={t.colors.mustText}>Let it move</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={{ minHeight: 32, justifyContent: 'center' }}
                  onPress={() => {
                    const a = conflicts[0].a;
                    if (a.id !== '__lunch__') patch(a.id, { durationMin: Math.max(15, Math.round((a.durationMin * 0.7) / 5) * 5) });
                  }}>
                  <Text variant="bodyBold" color={t.colors.mustText}>Shorten</Text>
                </Pressable>
              </View>
            </Card>
          )}

          <View style={{ gap: t.spacing.sm, marginTop: t.spacing.lg }}>
            {scheduled.map((x) => (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Text variant="bodyBold" color={t.colors.sub} style={{ width: 46 }}>
                  {x.startMin != null ? minToLabel(x.startMin).replace(/ (AM|PM)/, '') : '—'}
                </Text>
                <Card style={{ flex: 1, paddingVertical: 10, backgroundColor: x.id === '__lunch__' ? t.colors.surfaceAlt : t.colors.surface }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="taskTitle" style={{ flex: 1 }}>
                      {x.name} {x.id !== '__lunch__' ? PRIORITY_GLYPH[x.priority] : '· protected'}
                    </Text>
                    <Text variant="caption" color={t.colors.sub}>
                      {x.flexibility === 'fixed' ? 'fixed' : `${x.durationMin}m`}
                    </Text>
                  </View>
                  {x.energy === 'high' && (
                    <Text variant="caption" color={t.colors.sageDeep}>deep focus · your best hours</Text>
                  )}
                </Card>
              </View>
            ))}
          </View>

          {unplaced.length > 0 && (
            <Card style={{ marginTop: t.spacing.md, backgroundColor: t.colors.surfaceAlt, borderColor: 'transparent' }}>
              <Text variant="body" color={t.colors.sub}>
                {unplaced.length} {unplaced.length === 1 ? 'task doesn’t' : 'tasks don’t'} fit comfortably today — they’ll stay flexible instead of squeezing your day.
              </Text>
            </Card>
          )}

          <Button title="Looks good — continue" onPress={confirm} style={{ marginTop: t.spacing.xl }} />
          <Pressable accessibilityRole="button" onPress={() => setStep(2)} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="body" color={t.colors.sub}>↺ Redo</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
