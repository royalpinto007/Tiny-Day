import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Room, RoomTimeState, useLiveRoomState } from '../../components/Room';
import { useIsTablet, useTheme } from '../../theme';
import { useTasks, tasksForDate } from '../../lib/store/tasks';
import { minToLabel, todayISO } from '../../lib/types';

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

export default function RoomScreen() {
  const t = useTheme();
  const router = useRouter();
  const isTablet = useIsTablet();
  const state = useLiveRoomState();
  const tasks = useTasks((s) => s.tasks);

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

  return (
    <Screen>
      <Text variant="display">Your room</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
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
    </Screen>
  );
}
