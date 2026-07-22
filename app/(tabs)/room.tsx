import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Room, RoomTimeState, useLiveRoomState } from '../../components/Room';
import { useIsTablet, useTheme } from '../../theme';
import { useTasks, tasksForDate } from '../../lib/store/tasks';
import { addDaysISO, minToLabel, Mood, todayISO } from '../../lib/types';

/** One quiet line about where the day stands — never a nag, never a score. */
function statusLine(total: number, done: number, state: RoomTimeState): string {
  if (total === 0) {
    return state === 'night'
      ? 'Nothing on today. The lamp is on anyway.'
      : 'Nothing on today. An open, quiet room.';
  }
  if (done === 0) return 'The day is still ahead of you.';
  if (done === total) return 'Everything done. The room is glowing.';
  if (done / total >= 0.5) return 'More than halfway — the room is brightening.';
  return 'The room is beginning to brighten.';
}

const TIME_NOTE: Record<RoomTimeState, string> = {
  morning: 'Morning · soft sunlight',
  afternoon: 'Afternoon · bright and clear',
  sunset: 'Sunset · the lamp is on',
  night: 'Night · stars and cosy dark',
};

const MOOD_LABEL: Record<Mood, string> = {
  calm: 'Calm',
  productive: 'Productive',
  chaotic: 'Chaotic',
  heavy: 'Heavy',
};

export default function RoomScreen() {
  const t = useTheme();
  const router = useRouter();
  const isTablet = useIsTablet();
  const state = useLiveRoomState();
  const tasks = useTasks((s) => s.tasks);
  const snapshots = useTasks((s) => s.snapshots);

  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const done = today.filter((x) => x.status === 'completed').length;
  const completion = today.length ? done / today.length : 0;

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const next = today.find(
    (x) =>
      x.status !== 'completed' &&
      x.status !== 'skipped' &&
      x.status !== 'rescheduled' &&
      (x.startMin == null || x.startMin >= nowMin)
  );

  // The six days before today, oldest first — only days actually closed out.
  const past = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 1; i--) {
      const iso = addDaysISO(todayISO(), -i);
      const snap = snapshots[iso];
      if (snap) out.push(snap);
    }
    return out;
  }, [snapshots]);

  return (
    <Screen>
      <Text variant="display">Your room</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
        A visual reflection of Today — completed tasks brighten it.
      </Text>
      <Text variant="caption" color={t.colors.sub} style={{ marginTop: 3 }}>
        {TIME_NOTE[state]}
      </Text>

      <View style={{ marginTop: t.spacing.lg }}>
        <Room completion={completion} height={isTablet ? 300 : 230} />
      </View>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>
        {statusLine(today.length, done, state)}
      </Text>

      {today.length > 0 && (
        <>
          <View
            style={{
              height: 6,
              backgroundColor: t.colors.trackFill,
              borderRadius: 3,
              marginTop: t.spacing.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 6,
                width: `${Math.round(completion * 100)}%`,
                backgroundColor: t.colors.sage,
              }}
            />
          </View>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: t.spacing.sm }}>
            {done} of {today.length} done
          </Text>
        </>
      )}

      {next && (
        <Text variant="body" color={t.colors.sub} style={{ marginTop: t.spacing.lg }}>
          Next up: <Text variant="bodyBold">{next.name}</Text>
          {next.startMin != null ? ` · ${minToLabel(next.startMin)}` : ''}
        </Text>
      )}

      {today.length === 0 && (
        <Button
          title="Plan today"
          onPress={() => router.push('/planning')}
          style={{ marginTop: t.spacing.xl }}
        />
      )}

      <Text variant="title" style={{ marginTop: t.spacing.xxl }}>
        The days before
      </Text>
      {past.length === 0 ? (
        <Text variant="body" color={t.colors.sub} style={{ marginTop: t.spacing.sm }}>
          Your days gather here as you close them in the evening check-in. Nothing
          to look back on yet.
        </Text>
      ) : (
        <>
          <Text variant="body" color={t.colors.sub} style={{ marginTop: t.spacing.sm }}>
            How the week has been feeling.
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: t.spacing.md,
              marginTop: t.spacing.lg,
            }}
          >
            {past.map((snap) => {
              const ratio = snap.plannedCount ? snap.completedCount / snap.plannedCount : 0;
              const d = new Date(`${snap.date}T12:00:00`);
              return (
                <View key={snap.date} style={{ width: isTablet ? 160 : 100 }}>
                  {/* height tracks the scene's 320:170 ratio so nothing crops */}
                  <Room state="afternoon" completion={ratio} height={isTablet ? 85 : 54} />
                  <Text variant="caption" style={{ marginTop: 6 }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    {snap.mood ? ` · ${MOOD_LABEL[snap.mood]}` : ''}
                  </Text>
                  <Text variant="caption" color={t.colors.sub}>
                    {snap.completedCount} of {snap.plannedCount} done
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
