import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Toggle } from '../components/controls';
import { useTheme } from '../theme';
import { NotificationLevel, useSettings } from '../lib/store/settings';
import { minToLabel } from '../lib/types';

const LEVELS: { key: NotificationLevel; title: string; note: string }[] = [
  { key: 'all', title: 'Keep me on track', note: 'Reminders for ▲ musts and ● shoulds, plus a gentle follow-up for musts.' },
  { key: 'important', title: 'Only what matters', note: '▲ must = remind + one follow-up · ● should = one reminder · ○ optional = silent.' },
  { key: 'minimal', title: 'Barely there', note: 'Only ▲ musts, once.' },
  { key: 'none', title: 'Silence', note: 'No reminders. The app still works fully.' },
];

export default function NotificationSettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const s = useSettings();

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="bodyBold" color={t.colors.sub}>‹ Back</Text>
      </Pressable>
      <Text variant="display">Notifications</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 4 }}>
        Never guilt, never streaks — just the nudges you asked for.
      </Text>

      {!s.notificationsGranted && (
        <Card style={{ marginTop: t.spacing.lg, backgroundColor: t.colors.surfaceAlt, borderColor: 'transparent' }}>
          <Text variant="body" color={t.colors.sub}>
            Notifications are off at the system level. Tiny Day works fine without them — reminders just stay in the app.
          </Text>
          <Button
            title="Allow notifications"
            compact
            kind="secondary"
            style={{ marginTop: t.spacing.md }}
            onPress={async () => {
              try {
                const res = await Notifications.requestPermissionsAsync();
                s.set({ notificationsGranted: res.granted ?? false });
              } catch {
                s.set({ notificationsGranted: false });
              }
            }}
          />
        </Card>
      )}

      <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
        {LEVELS.map((l) => (
          <Pressable key={l.key} accessibilityRole="radio" accessibilityState={{ selected: s.notificationLevel === l.key }}
            onPress={() => s.set({ notificationLevel: l.key })}>
            <Card style={{ borderColor: s.notificationLevel === l.key ? t.colors.sage : t.colors.border, borderWidth: s.notificationLevel === l.key ? 2 : 1 }}>
              <Text variant="cardTitle">{l.title}</Text>
              <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{l.note}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card style={{ marginTop: t.spacing.lg, gap: t.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text variant="taskTitle">Quiet hours</Text>
            <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>
              {minToLabel(s.quietStartMin)} – {minToLabel(s.quietEndMin)} · nothing fires in this window.
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text variant="taskTitle">Privacy mode</Text>
            <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>
              Lock screen shows “Important reminder due now” instead of the task name.
            </Text>
          </View>
          <Toggle value={s.privacyMode} onChange={(v) => s.set({ privacyMode: v })} label="Privacy mode" />
        </View>
      </Card>

      <Text variant="caption" color={t.colors.faint} style={{ marginTop: t.spacing.lg }} center>
        When you fall behind, Tiny Day offers one gentle replan prompt — never a guilt loop.
      </Text>
    </Screen>
  );
}
