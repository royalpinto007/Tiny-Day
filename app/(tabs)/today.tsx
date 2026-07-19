import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PriorityChip } from '../../components/chips';
import { Room } from '../../components/Room';
import { useIsTablet, useTheme } from '../../theme';
import { useSettings } from '../../lib/store/settings';
import { tasksForDate, useTasks } from '../../lib/store/tasks';
import { minToLabel, PRIORITY_GLYPH, Task, todayISO } from '../../lib/types';
import { useToast } from '../../components/Toast';
import { longDateLabel } from '../../lib/format';
import { BrandMark } from '../../components/BrandMark';

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}



export default function TodayScreen() {
  const t = useTheme();
  const isTablet = useIsTablet();
  const router = useRouter();
  const toast = useToast();
  const name = useSettings((s) => s.name);
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);
  const setFocusTask = useTasks((s) => s.setFocusTask);

  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const open = today.filter((x) => x.status !== 'completed' && x.status !== 'skipped' && x.status !== 'rescheduled');
  const done = today.filter((x) => x.status === 'completed');
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const current: Task | undefined =
    open.find((x) => x.startMin != null && x.startMin <= nowMin && x.startMin + x.durationMin > nowMin) ?? open[0];
  const next = open.find((x) => x !== current && (x.startMin == null || x.startMin >= nowMin));
  const important = open.filter((x) => x.priority === 'must' && x !== current);
  const completion = today.length ? done.length / today.length : 0;
  const allDone = today.length > 0 && open.length === 0;

  const complete = (task: Task) => {
    setStatus(task.id, 'completed');
    toast.show({ message: 'Nice — one more thing done.', actionLabel: 'Undo', onAction: () => setStatus(task.id, 'not_started') });
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text variant="display">{greeting(name)}</Text>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{longDateLabel()}</Text>
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

      {allDone && (
        <Card style={{ marginTop: t.spacing.lg, alignItems: 'center', paddingVertical: t.spacing.xl }}>
          <Text variant="title" center>All done for today</Text>
          <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
            The room is glowing. You did enough for today.
          </Text>
          <Button title="Evening check-in" onPress={() => router.push('/evening')} style={{ marginTop: t.spacing.lg, alignSelf: 'stretch' }} />
        </Card>
      )}

      {current && (
        <Card style={{ marginTop: t.spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="label" color={t.colors.sageDeep}>Now</Text>
            <PriorityChip priority={current.priority} />
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/task/${current.id}`)}>
            <Text variant="title" style={{ marginTop: 6 }}>{current.name}</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>
              {current.startMin != null ? `${minToLabel(current.startMin)} · ` : ''}{current.durationMin} min
            </Text>
          </Pressable>
          <View
            style={{ height: 6, backgroundColor: t.colors.trackFill, borderRadius: 3, marginTop: t.spacing.md, overflow: 'hidden' }}
          >
            <View
              style={{
                height: 6,
                width: `${current.startMin != null && current.startMin <= nowMin
                  ? Math.min(100, Math.max(4, ((nowMin - current.startMin) / current.durationMin) * 100))
                  : 4}%`,
                backgroundColor: t.colors.sage,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
            <Button
              title="Focus"
              style={{ flex: 1 }}
              onPress={() => {
                setFocusTask(current.id);
                router.push('/focus');
              }}
            />
            <Button title="Done" kind="secondary" style={{ flex: 1 }} onPress={() => complete(current)} />
          </View>
        </Card>
      )}

      {next && (
        <Card style={{ marginTop: t.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="label" color={t.colors.blue}>Next</Text>
            {next.startMin != null && <Text variant="bodyBold" color={t.colors.sub}>{minToLabel(next.startMin)}</Text>}
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/task/${next.id}`)}>
            <Text variant="cardTitle" style={{ marginTop: 4 }}>{next.name}</Text>
          </Pressable>
        </Card>
      )}

      {important.length > 0 && (
        <Card style={{ marginTop: t.spacing.md, backgroundColor: t.colors.mustFill, borderColor: 'transparent' }}>
          <Text variant="label" color={t.colors.mustText}>Important today</Text>
          {important.map((x) => (
            <Pressable key={x.id} accessibilityRole="button" onPress={() => router.push(`/task/${x.id}`)} style={{ marginTop: 8, minHeight: 28 }}>
              <Text variant="taskTitle" color={t.dark ? t.colors.ink : '#6B4430'}>
                {PRIORITY_GLYPH[x.priority]}  {x.name}{x.startMin != null ? ` · ${minToLabel(x.startMin)}` : ''}
              </Text>
            </Pressable>
          ))}
        </Card>
      )}

      {today.length > 0 && (
        <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
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
            style={{
              flex: 1, borderRadius: t.radius.md, borderWidth: 1.5, borderColor: t.colors.terra,
              alignItems: 'center', justifyContent: 'center', padding: t.spacing.md, backgroundColor: t.colors.surface,
            }}
          >
            <Text variant="taskTitle" color={t.colors.terra} center>↺ My day went wrong</Text>
          </Pressable>
        </View>
      )}

      {today.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.lg }}>
          <Link href="/timeline" asChild>
            <Pressable accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text variant="bodyBold" color={t.colors.sageDeep}>See full timeline →</Text>
            </Pressable>
          </Link>
          <Link href="/notifications" asChild>
            <Pressable accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text variant="bodyBold" color={t.colors.sub}>Reminders</Text>
            </Pressable>
          </Link>
          <Link href="/evening" asChild>
            <Pressable accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text variant="bodyBold" color={t.colors.sub}>Evening check-in</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </Screen>
  );
}
