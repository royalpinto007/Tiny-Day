import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { PlainChip } from '../../components/chips';
import { Toggle } from '../../components/controls';
import { Room, RoomTimeState, useLiveRoomState } from '../../components/Room';
import { useTheme } from '../../theme';
import { useTasks, tasksForDate } from '../../lib/store/tasks';
import { todayISO } from '../../lib/types';
import { useSettings } from '../../lib/store/settings';

const STATES: { key: RoomTimeState; label: string; note: string }[] = [
  { key: 'morning', label: 'Morning', note: 'soft sunlight' },
  { key: 'afternoon', label: 'Afternoon', note: 'bright & clear' },
  { key: 'sunset', label: 'Sunset', note: 'lamp comes on' },
  { key: 'night', label: 'Night', note: 'stars & cosy dark' },
];

export default function RoomScreen() {
  const t = useTheme();
  const live = useLiveRoomState();
  const [preview, setPreview] = useState<RoomTimeState | null>(null);
  const [rain, setRain] = useState(false);
  const tasks = useTasks((s) => s.tasks);
  const today = useMemo(() => tasksForDate(tasks, todayISO()), [tasks]);
  const done = today.filter((x) => x.status === 'completed').length;
  const completion = today.length ? done / today.length : 0;
  const name = useSettings((s) => s.name);

  return (
    <Screen>
      <Text variant="display">Your room</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
        It follows the real clock — and brightens as your day comes together.
      </Text>

      <View style={{ marginTop: t.spacing.lg }}>
        <Room state={preview ?? live} rain={rain} completion={completion} height={200} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: t.spacing.md, flexWrap: 'wrap' }}>
        {STATES.map((s) => (
          <Pressable key={s.key} onPress={() => setPreview(preview === s.key ? null : s.key)}
            accessibilityRole="button" accessibilityLabel={`Preview ${s.label}`}>
            <PlainChip label={s.label} selected={(preview ?? live) === s.key} />
          </Pressable>
        ))}
      </View>
      {preview && (
        <Text variant="caption" color={t.colors.sub} style={{ marginTop: 6 }}>
          Previewing {preview}. Tap again to follow the real clock.
        </Text>
      )}

      <Card style={{ marginTop: t.spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text variant="cardTitle">Rainy day</Text>
          <Text variant="body" color={t.colors.sub}>Muted light, cosy mood.</Text>
        </View>
        <Toggle value={rain} onChange={setRain} label="Rainy day" />
      </Card>

      <Card style={{ marginTop: t.spacing.md }}>
        <Text variant="label" color={t.colors.sub}>Today</Text>
        <Text variant="cardTitle" style={{ marginTop: 4 }}>
          {today.length === 0
            ? 'A quiet, open day.'
            : done === today.length
              ? 'Everything done — the room is glowing.'
              : `${done} of ${today.length} done — the room brightens with each one.`}
        </Text>
      </Card>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>States gallery</Text>
      <View style={{ gap: t.spacing.md, marginTop: t.spacing.md }}>
        {STATES.map((s) => (
          <View key={s.key}>
            <Room state={s.key} completion={completion} height={120} />
            <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>
              {s.label} · {s.note}
            </Text>
          </View>
        ))}
        <View>
          <Room state="afternoon" rain completion={completion} height={120} />
          <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4 }}>Rainy day · muted light</Text>
        </View>
      </View>

      <Card style={{ marginTop: t.spacing.lg }}>
        <Text variant="label" color={t.colors.sub}>Share card</Text>
        <Text variant="cardTitle" style={{ marginTop: 4 }}>
          {name ? `${name}'s tiny day` : 'Your tiny day'} · {done}/{today.length || 0} done
        </Text>
        <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>
          Take a screenshot of your room to share it. Nothing leaves your phone otherwise.
        </Text>
      </Card>
    </Screen>
  );
}
