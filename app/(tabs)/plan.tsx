import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TaskCard } from '../../components/TaskCard';
import { PlainChip } from '../../components/chips';
import { SegmentedControl, TextField, Toggle } from '../../components/controls';
import { useTheme } from '../../theme';
import { backlogTasks, tasksForDate, useTasks } from '../../lib/store/tasks';
import { addDaysISO, CATEGORY_LABEL, minToLabel, PRIORITY_GLYPH, todayISO } from '../../lib/types';
import { useToast } from '../../components/Toast';

type ViewKey = 'tomorrow' | 'week' | 'backlog' | 'routines';
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function PlanScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<ViewKey>('tomorrow');
  const tasks = useTasks((s) => s.tasks);
  const routines = useTasks((s) => s.routines);
  const updateTask = useTasks((s) => s.updateTask);
  const setStatus = useTasks((s) => s.setStatus);
  const addRoutine = useTasks((s) => s.addRoutine);
  const updateRoutine = useTasks((s) => s.updateRoutine);
  const removeRoutine = useTasks((s) => s.removeRoutine);

  const tomorrowISO = addDaysISO(todayISO(), 1);
  const tomorrow = useMemo(() => tasksForDate(tasks, tomorrowISO), [tasks, tomorrowISO]);
  const backlog = useMemo(() => backlogTasks(tasks), [tasks]);
  const [newRoutine, setNewRoutine] = useState('');

  return (
    <Screen>
      <Text variant="display">Plan</Text>
      <SegmentedControl<ViewKey>
        options={[
          { key: 'tomorrow', label: 'Tomorrow' },
          { key: 'week', label: 'Week' },
          { key: 'backlog', label: 'Backlog' },
          { key: 'routines', label: 'Routines' },
        ]}
        value={view}
        onChange={setView}
        style={{ marginTop: t.spacing.lg }}
      />

      {view === 'tomorrow' && (
        <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
          {tomorrow.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: t.spacing.xl }}>
              <Text variant="title" center>Tomorrow is a blank page</Text>
              <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
                Add things with the + button, or leave it open — that’s allowed.
              </Text>
            </Card>
          ) : (
            tomorrow.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/task/${task.id}`)}
                onToggleComplete={() => setStatus(task.id, task.status === 'completed' ? 'not_started' : 'completed')}
              />
            ))
          )}
          {backlog.length > 0 && (
            <Card style={{ backgroundColor: t.colors.surfaceAlt, borderColor: 'transparent' }}>
              <Text variant="body" color={t.colors.sub}>
                {backlog.length} in the backlog — pull one in if tomorrow feels light.
              </Text>
            </Card>
          )}
        </View>
      )}

      {view === 'week' && (
        <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
          {Array.from({ length: 7 }, (_, i) => {
            const iso = addDaysISO(todayISO(), i);
            const dayTasks = tasksForDate(tasks, iso);
            const d = new Date(`${iso}T12:00:00`);
            const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
              : d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' });
            return (
              <Card key={iso}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="cardTitle">{label}</Text>
                  <Text variant="caption" color={t.colors.sub}>
                    {dayTasks.length === 0 ? 'open' : `${dayTasks.length} planned`}
                  </Text>
                </View>
                {dayTasks.slice(0, 3).map((x) => (
                  <Text key={x.id} variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
                    {PRIORITY_GLYPH[x.priority]} {x.name}{x.startMin != null ? ` · ${minToLabel(x.startMin)}` : ''}
                  </Text>
                ))}
                {dayTasks.length > 3 && (
                  <Text variant="caption" color={t.colors.faint} style={{ marginTop: 4 }}>
                    + {dayTasks.length - 3} more
                  </Text>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {view === 'backlog' && (
        <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
          {backlog.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: t.spacing.xl }}>
              <Text variant="title" center>The backlog is empty</Text>
              <Text variant="body" color={t.colors.sub} center style={{ marginTop: 6 }}>
                Someday-things live here — safely out of today’s way.
              </Text>
            </Card>
          ) : (
            backlog.map((task) => (
              <Card key={task.id}>
                <Text variant="cardTitle">{PRIORITY_GLYPH[task.priority]} {task.name}</Text>
                <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>
                  {CATEGORY_LABEL[task.category]} · {task.durationMin} min
                </Text>
                <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: 10 }}>
                  <Button title="Do tomorrow" kind="secondary" compact style={{ flex: 1 }}
                    onPress={() => {
                      updateTask(task.id, { date: tomorrowISO });
                      toast.show({ message: 'Pulled into tomorrow.' });
                    }} />
                  <Button title="Today" kind="secondary" compact style={{ flex: 1 }}
                    onPress={() => {
                      updateTask(task.id, { date: todayISO() });
                      toast.show({ message: 'Added to today.' });
                    }} />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {view === 'routines' && (
        <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
          <Card>
            <Text variant="label" color={t.colors.sub}>New routine</Text>
            <TextField
              value={newRoutine}
              onChangeText={setNewRoutine}
              placeholder="Morning pages, evening stretch…"
              style={{ marginTop: 8 }}
              accessibilityLabel="New routine name"
            />
            <Button
              title="Add routine"
              compact
              disabled={newRoutine.trim().length < 2}
              onPress={() => {
                addRoutine({ name: newRoutine.trim() });
                setNewRoutine('');
              }}
              style={{ marginTop: t.spacing.md }}
            />
          </Card>
          {routines.length === 0 && (
            <Text variant="body" color={t.colors.sub} center>
              Routines repeat on the days you pick and appear on Today automatically.
            </Text>
          )}
          {routines.map((r) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="cardTitle" style={{ flex: 1 }}>{r.name}</Text>
                <Toggle value={r.enabled} onChange={(v) => updateRoutine(r.id, { enabled: v })} label={`${r.name} enabled`} />
              </View>
              <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>
                {minToLabel(r.startMin)} · {r.durationMin} min
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {DAY_NAMES.map((dn, di) => {
                  const on = r.days.includes(di);
                  return (
                    <Pressable
                      key={di}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={`${r.name} on day ${di}`}
                      onPress={() =>
                        updateRoutine(r.id, { days: on ? r.days.filter((x) => x !== di) : [...r.days, di] })
                      }
                      style={{
                        width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: on ? t.colors.sage : t.colors.surfaceAlt,
                      }}
                    >
                      <Text variant="bodyBold" color={on ? t.colors.onSage : t.colors.sub} style={{ fontSize: 12 }}>{dn}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable accessibilityRole="button" onPress={() => removeRoutine(r.id)} style={{ minHeight: 36, justifyContent: 'center', marginTop: 6 }}>
                <Text variant="caption" color={t.colors.terra}>Remove routine</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
