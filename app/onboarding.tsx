import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextField } from '../components/controls';
import { Room } from '../components/Room';
import { BrandMark } from '../components/BrandMark';
import { useTheme } from '../theme';
import { NotificationLevel, PlanningStyle, RoomTheme, useSettings } from '../lib/store/settings';
import { minToLabel } from '../lib/types';

type Step =
  | 'welcome' | 'name' | 'dayShape' | 'style' | 'notifLevel'
  | 'notifPermission' | 'calendar' | 'roomTheme' | 'ready';

const ORDER: Step[] = ['welcome', 'name', 'dayShape', 'style', 'notifLevel', 'notifPermission', 'calendar', 'roomTheme', 'ready'];

function TimeStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
      <Text variant="body" color={t.colors.sub}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} earlier`} hitSlop={8}
          onPress={() => onChange((value - 30 + 1440) % 1440)}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="cardTitle">−</Text>
        </Pressable>
        <Text variant="taskTitle" style={{ width: 76, textAlign: 'center' }}>{minToLabel(value)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} later`} hitSlop={8}
          onPress={() => onChange((value + 30) % 1440)}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="cardTitle">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ChoiceCard({ title, note, selected, onPress }: { title: string; note: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress}>
      <Card style={{ borderColor: selected ? t.colors.sage : t.colors.border, borderWidth: selected ? 2 : 1 }}>
        <Text variant="cardTitle">{title}</Text>
        <Text variant="body" color={t.colors.sub} style={{ marginTop: 2 }}>{note}</Text>
      </Card>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const t = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [wake, setWake] = useState(settings.wakeMin);
  const [sleep, setSleep] = useState(settings.sleepMin);
  const [lunch, setLunch] = useState(settings.lunchMin);
  const [dinner, setDinner] = useState(settings.dinnerMin);
  const [style, setStyle] = useState<PlanningStyle>('flexible');
  const [level, setLevel] = useState<NotificationLevel>('important');
  const [roomTheme, setRoomTheme] = useState<RoomTheme>('cozy');

  const next = () => setStep(ORDER[Math.min(ORDER.indexOf(step) + 1, ORDER.length - 1)]);
  const previous = () => setStep(ORDER[Math.max(ORDER.indexOf(step) - 1, 0)]);
  const stepIndex = ORDER.indexOf(step);
  const setupStepCount = ORDER.length - 1;

  const finish = () => {
    settings.set({
      onboarded: true, name: name.trim(), wakeMin: wake, sleepMin: sleep,
      lunchMin: lunch, dinnerMin: dinner, planningStyle: style,
      notificationLevel: level, roomTheme,
    });
    router.replace('/(tabs)/today');
  };

  const Skip = ({ label = 'Skip for now' }: { label?: string }) => (
    <Pressable accessibilityRole="button" onPress={next} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="body" color={t.colors.sub}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen padBottom={32}>
      <View style={{ marginTop: t.spacing.xl }}>
        {step !== 'welcome' && (
          <View style={{ marginBottom: t.spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back to the previous setup step"
                hitSlop={8}
                onPress={previous}
                style={{ minHeight: 44, justifyContent: 'center', paddingRight: t.spacing.md }}
              >
                <Text variant="bodyBold" color={t.colors.sageDeep}>← Back</Text>
              </Pressable>
              <Text variant="caption" color={t.colors.sub}>
                Step {stepIndex} of {setupStepCount}
              </Text>
            </View>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: setupStepCount, now: stepIndex }}
              style={{ height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: t.colors.trackFill }}
            >
              <View
                style={{
                  width: `${(stepIndex / setupStepCount) * 100}%`,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.colors.sage,
                }}
              />
            </View>
          </View>
        )}
        {step === 'welcome' && (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <BrandMark size={136} />
            <Text variant="display" style={{ marginTop: t.spacing.xl }}>Tiny Day</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 6 }}>Your day, made manageable.</Text>
            <Button title="Get started" onPress={next} style={{ marginTop: 48, alignSelf: 'stretch' }} />
          </View>
        )}

        {step === 'name' && (
          <>
            <Text variant="display">What should we{'\n'}call you?</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>Just a first name is perfect. It stays on your phone.</Text>
            <TextField value={name} onChangeText={setName} placeholder="Your name" autoFocus style={{ marginTop: t.spacing.xl }} accessibilityLabel="Your name" />
            <Button title="Continue" onPress={next} style={{ marginTop: t.spacing.xl }} />
            <Skip />
          </>
        )}

        {step === 'dayShape' && (
          <>
            <Text variant="display">The shape of{'\n'}your day</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>So plans fit your real hours, not someone else’s.</Text>
            <Card style={{ marginTop: t.spacing.xl, gap: 4 }}>
              <TimeStepper label="I wake around" value={wake} onChange={setWake} />
              <TimeStepper label="Lunch is around" value={lunch} onChange={setLunch} />
              <TimeStepper label="Dinner is around" value={dinner} onChange={setDinner} />
              <TimeStepper label="I wind down by" value={sleep} onChange={setSleep} />
            </Card>
            <Button title="Continue" onPress={next} style={{ marginTop: t.spacing.xl }} />
          </>
        )}

        {step === 'style' && (
          <>
            <Text variant="display">How do you like{'\n'}to plan?</Text>
            <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
              <ChoiceCard title="Structured" note="Times for everything — a clear map of the day." selected={style === 'structured'} onPress={() => setStyle('structured')} />
              <ChoiceCard title="Flexible" note="A gentle order, with room to drift." selected={style === 'flexible'} onPress={() => setStyle('flexible')} />
              <ChoiceCard title="Minimal" note="Just the few things that matter." selected={style === 'minimal'} onPress={() => setStyle('minimal')} />
            </View>
            <Button title="Continue" onPress={next} style={{ marginTop: t.spacing.xl }} />
          </>
        )}

        {step === 'notifLevel' && (
          <>
            <Text variant="display">How much should{'\n'}we nudge?</Text>
            <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
              <ChoiceCard title="Keep me on track" note="Reminders for most tasks." selected={level === 'all'} onPress={() => setLevel('all')} />
              <ChoiceCard title="Only what matters" note="Reminders for ▲ musts and ● shoulds." selected={level === 'important'} onPress={() => setLevel('important')} />
              <ChoiceCard title="Barely there" note="Only ▲ musts, once." selected={level === 'minimal'} onPress={() => setLevel('minimal')} />
              <ChoiceCard title="Silence" note="No reminders at all." selected={level === 'none'} onPress={() => setLevel('none')} />
            </View>
            <Button title="Continue" onPress={next} style={{ marginTop: t.spacing.xl }} />
          </>
        )}

        {step === 'notifPermission' && (
          <>
            <Text variant="display">Gentle reminders</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
              Tiny Day only reminds you about what you asked it to — never guilt, never streaks. You can change this anytime.
            </Text>
            <Button
              title="Allow notifications"
              style={{ marginTop: t.spacing.xl }}
              onPress={async () => {
                try {
                  const res = await Notifications.requestPermissionsAsync();
                  settings.set({ notificationsGranted: res.granted ?? false });
                } catch {
                  settings.set({ notificationsGranted: false });
                }
                next();
              }}
            />
            <Skip label="Not now" />
          </>
        )}

        {step === 'calendar' && (
          <>
            <Text variant="display">Your calendar{'\n'}(optional)</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>
              Tiny Day can plan around existing events. It never writes to your calendar. Totally optional.
            </Text>
            <Button
              title="Connect calendar"
              style={{ marginTop: t.spacing.xl }}
              onPress={() => {
                settings.set({ calendarConnected: true });
                next();
              }}
            />
            <Skip label="Skip — plan without it" />
          </>
        )}

        {step === 'roomTheme' && (
          <>
            <Text variant="display">Pick your room</Text>
            <Text variant="body" color={t.colors.sub} style={{ marginTop: 8 }}>A tiny companion space that lives through your day.</Text>
            <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
              {(['cozy', 'plant', 'minimal'] as RoomTheme[]).map((rt) => (
                <Pressable key={rt} accessibilityRole="radio" accessibilityState={{ selected: roomTheme === rt }} onPress={() => setRoomTheme(rt)}>
                  <View style={{ borderRadius: t.radius.lg, borderWidth: roomTheme === rt ? 2 : 0, borderColor: t.colors.sage, overflow: 'hidden' }}>
                    <Room state={rt === 'plant' ? 'afternoon' : rt === 'minimal' ? 'night' : 'morning'} height={110} />
                  </View>
                  <Text variant="caption" color={t.colors.sub} style={{ marginTop: 4, textTransform: 'capitalize' }}>{rt}</Text>
                </Pressable>
              ))}
            </View>
            <Button title="Continue" onPress={next} style={{ marginTop: t.spacing.xl }} />
          </>
        )}

        {step === 'ready' && (
          <View style={{ marginTop: 24 }}>
            <Room state="morning" height={190} />
            <Text variant="display" center style={{ marginTop: t.spacing.xl }}>Your Tiny Day{'\n'}is ready</Text>
            <Text variant="body" color={t.colors.sub} center style={{ marginTop: 8 }}>
              Morning light is coming through the window.{'\n'}Let’s decide what today holds.
            </Text>
            <Button title="Plan today" onPress={() => { finish(); router.push('/planning'); }} style={{ marginTop: t.spacing.xl }} />
            <Pressable accessibilityRole="button" onPress={finish} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
              <Text variant="bodyBold" color={t.colors.sub}>Just look around first</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}
