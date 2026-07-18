import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SegmentedControl, TextField, Toggle } from '../../components/controls';
import { useTheme } from '../../theme';
import { Appearance, PlanningStyle, useSettings } from '../../lib/store/settings';
import { useTasks } from '../../lib/store/tasks';
import { minToLabel, todayISO } from '../../lib/types';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const s = useSettings();
  const snapshots = useTasks((x) => x.snapshots);
  const stats = useMemo(() => {
    const all = Object.values(snapshots);
    return {
      days: all.length,
      done: all.reduce((n, d) => n + d.completedCount, 0),
      focusH: Math.round(all.reduce((n, d) => n + d.focusMinutes, 0) / 6) / 10,
    };
  }, [snapshots]);

  return (
    <Screen>
      <Text variant="display">{s.name ? s.name : 'You'}</Text>
      <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>
        {stats.days === 0
          ? 'Your tiny days will gather here.'
          : `${stats.days} days closed · ${stats.done} things done · ${stats.focusH}h of focus`}
      </Text>

      <Card style={{ marginTop: t.spacing.lg }}>
        <Text variant="label" color={t.colors.sub}>Name</Text>
        <TextField
          value={s.name}
          onChangeText={(v) => s.set({ name: v })}
          placeholder="Your name"
          style={{ marginTop: 8 }}
          accessibilityLabel="Your name"
        />
      </Card>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>Appearance</Text>
      <Card style={{ marginTop: t.spacing.md, gap: t.spacing.lg }}>
        <View>
          <Text variant="label" color={t.colors.sub}>Theme</Text>
          <SegmentedControl<Appearance>
            options={[
              { key: 'system', label: 'System' },
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
            ]}
            value={s.appearance}
            onChange={(v) => s.set({ appearance: v })}
            style={{ marginTop: 8 }}
          />
        </View>
        <SettingRow label="Reduce motion" note="Calmer transitions, no room animation.">
          <Toggle value={s.reduceMotion} onChange={(v) => s.set({ reduceMotion: v })} label="Reduce motion" />
        </SettingRow>
        <SettingRow label="High contrast" note="Stronger borders and text.">
          <Toggle value={s.highContrast} onChange={(v) => s.set({ highContrast: v })} label="High contrast" />
        </SettingRow>
      </Card>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>Notifications</Text>
      <Card style={{ marginTop: t.spacing.md }}>
        <Text variant="body" color={t.colors.sub}>
          ▲ Must = remind + one follow-up · ● Should = one reminder · ○ Optional = silent.
        </Text>
        <Button title="Notification settings" kind="secondary" compact onPress={() => router.push('/notification-settings')} style={{ marginTop: t.spacing.md }} />
      </Card>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>Planning</Text>
      <Card style={{ marginTop: t.spacing.md, gap: t.spacing.lg }}>
        <View>
          <Text variant="label" color={t.colors.sub}>Planning style</Text>
          <SegmentedControl<PlanningStyle>
            options={[
              { key: 'structured', label: 'Structured' },
              { key: 'flexible', label: 'Flexible' },
              { key: 'minimal', label: 'Minimal' },
            ]}
            value={s.planningStyle}
            onChange={(v) => s.set({ planningStyle: v })}
            style={{ marginTop: 8 }}
          />
        </View>
        <SettingRow label="Day window" note={`${minToLabel(s.wakeMin)} – ${minToLabel(s.sleepMin)}`}>
          <View />
        </SettingRow>
        <SettingRow label="Calendar" note={s.calendarConnected ? 'Connected · read-only' : 'Not connected'}>
          <Toggle value={s.calendarConnected} onChange={(v) => s.set({ calendarConnected: v })} label="Calendar connected" />
        </SettingRow>
      </Card>

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>Privacy</Text>
      <Card style={{ marginTop: t.spacing.md, gap: t.spacing.lg }}>
        <Text variant="body" color={t.colors.sub}>
          Everything lives on your phone. No account, no cloud, no analytics. Tiny Day works fully offline — that’s the whole point.
        </Text>
        <SettingRow label="Private lock screen" note="Reminders say “Important reminder due now” instead of the task name.">
          <Toggle value={s.privacyMode} onChange={(v) => s.set({ privacyMode: v })} label="Private lock screen" />
        </SettingRow>
      </Card>

      <Text variant="caption" color={t.colors.faint} center style={{ marginTop: t.spacing.xl }}>
        Tiny Day · your day, made manageable · {todayISO()}
      </Text>
    </Screen>
  );
}

function SettingRow({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text variant="taskTitle">{label}</Text>
        {note && <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>{note}</Text>}
      </View>
      {children}
    </View>
  );
}
