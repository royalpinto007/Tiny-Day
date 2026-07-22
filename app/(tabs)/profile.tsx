import React, { useMemo, useState } from 'react';
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
import { connectAndSyncCalendar } from '../../lib/calendar';
import { useToast } from '../../components/Toast';

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const s = useSettings();
  const toast = useToast();
  const snapshots = useTasks((x) => x.snapshots);
  const hasDemoData = useTasks((x) => x.tasks.some((task) => task.isDemo));
  const loadDemoData = useTasks((x) => x.loadDemoData);
  const clearDemoData = useTasks((x) => x.clearDemoData);
  const [calendarBusy, setCalendarBusy] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState('');
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
        <View>
          <Text variant="taskTitle">Calendar</Text>
          <Text variant="caption" color={t.colors.sub} style={{ marginTop: 2 }}>
            {s.calendarConnected ? 'Connected · read-only · next 7 days' : 'Not connected'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Button
              title={calendarBusy ? 'Syncing…' : s.calendarConnected ? 'Sync now' : 'Connect & import'}
              kind="secondary"
              compact
              disabled={calendarBusy}
              onPress={async () => {
                setCalendarBusy(true);
                setCalendarMessage('');
                try {
                  const result = await connectAndSyncCalendar();
                  if (result.status === 'synced') {
                    s.set({ calendarConnected: true });
                    setCalendarMessage(result.imported > 0
                      ? `${result.imported} new ${result.imported === 1 ? 'event' : 'events'} imported.`
                      : 'Calendar is up to date.');
                  } else {
                    s.set({ calendarConnected: false });
                    setCalendarMessage(result.status === 'denied'
                      ? 'Calendar access was not allowed. Check Android Settings if needed.'
                      : 'No device calendars were found.');
                  }
                } catch {
                  s.set({ calendarConnected: false });
                  setCalendarMessage('Could not read the calendar. Please try again.');
                } finally {
                  setCalendarBusy(false);
                }
              }}
            />
            {s.calendarConnected && (
              <Button title="Disconnect" kind="tertiary" compact onPress={() => {
                s.set({ calendarConnected: false });
                setCalendarMessage('Disconnected. Previously imported appointments remain in your plan.');
              }} />
            )}
          </View>
          {!!calendarMessage && <Text variant="caption" color={t.colors.sub} style={{ marginTop: 8 }}>{calendarMessage}</Text>}
        </View>
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

      <Text variant="title" style={{ marginTop: t.spacing.xl }}>Testing</Text>
      <Card style={{ marginTop: t.spacing.md }}>
        <Text variant="body" color={t.colors.sub}>
          Load sample tasks, routines, and recent days to exercise Today, Plan,
          Focus, Room, Backlog, and task recovery. Your own data is left untouched.
        </Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
          <Button
            title={hasDemoData ? 'Reset demo data' : 'Load demo data'}
            kind="secondary"
            compact
            style={{ flex: 1 }}
            onPress={() => {
              loadDemoData();
              toast.show({ message: hasDemoData ? 'Demo data reset.' : 'Demo data loaded.' });
            }}
          />
          {hasDemoData && (
            <Button
              title="Remove demo"
              kind="tertiary"
              compact
              style={{ flex: 1 }}
              onPress={() => {
                clearDemoData();
                toast.show({ message: 'Demo data removed. Your data is safe.' });
              }}
            />
          )}
        </View>
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
