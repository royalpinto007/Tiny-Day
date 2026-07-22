# Architecture

Tiny Day is an offline-first Expo and React Native application. Expo Router owns
navigation, Zustand stores own local state, and AsyncStorage persists user data.
There is no application backend.

## Main areas

| Path | Responsibility |
| --- | --- |
| `app/` | File-based routes and screen-level user flows |
| `app/(tabs)/` | Today, Room, Plan, and Profile navigation |
| `components/` | Reusable UI, controls, task cards, sheets, and the Room scene |
| `lib/store/` | Persisted task and settings state |
| `lib/` | Parsing, scheduling, repair rules, formatting, and notifications |
| `theme/` | Color tokens, typography, spacing, and theme provider |
| `assets/` | App icon, adaptive icon, splash, favicon, and logo assets |
| `docs/screens/` | Product design and interaction reference |

## Data flow

1. A route collects an action, such as quick-add text or a planning choice.
2. Domain helpers in `lib/` parse or transform the input.
3. A Zustand store applies the state change and persists it with AsyncStorage.
4. Screens subscribe to the relevant store slices and render reusable
   components with tokens from `theme/`.
5. Notification helpers schedule or cancel local device reminders when needed.

Planning is deterministic and local. `lib/parse.ts` interprets quick-add text,
`lib/schedule.ts` creates a timeline, and `lib/repair.ts` adjusts an interrupted
day while protecting fixed and must-do tasks.

## Navigation

`app/_layout.tsx` provides root services and font/theme setup. `app/index.tsx`
routes a new user into onboarding and a configured user into the tab shell.
Focused flows—planning, focus, replanning, evening review, task details, and
notification settings—live as top-level routes around that shell.

The phone tab order is Today → Room → quick add → Plan → Profile. Today owns
the room overview and full daily timeline; Room owns the compact Now/Next
execution controls; Plan owns future-day, week, backlog, and routine work.
Task details opens reusable edit and reschedule sheets so mutations update the
same persisted task ID, including when a focus session is active.

## Design principles

- Offline and useful without registration.
- Calm language with no streaks, guilt, or automatic carry-over.
- Accessible controls, text scaling, and redundant non-color status cues.
- Shared design tokens instead of screen-specific colors and measurements.
- Explicit user choices before rescheduling or discarding work.

## Builds

Development uses Expo/Metro. Installable Android previews are produced by the
`preview` profile in `eas.json`; Play Store bundles use the `production`
profile. GitHub v1.1.0 is a minified, resource-shrunk ARM64 APK signed with the
same release certificate as v1.0.0 so it can update an existing installation.
Generated native directories and binary artifacts are intentionally excluded
from source control and EAS uploads.
