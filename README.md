# Tiny Day

A cozy daily planner. Your day, made manageable.

[![GitHub release](https://img.shields.io/github/v/release/royalpinto007/Tiny-Day)](https://github.com/royalpinto007/Tiny-Day/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-7E9B77.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020.svg)](https://expo.dev/)

Tiny Day is a fully offline React Native (Expo) app: no account, no cloud, no analytics. You brain-dump your day in plain language, it shapes a gentle timeline, and a tiny illustrated room lives alongside you — brightening as things get done, dimming into lamplight at night. When life happens, one tap repairs the day without guilt.

<p align="center">
  <img src="docs/screens/1a-today-morning.png" width="240" alt="Today dashboard, morning" />
  <img src="docs/screens/1f-focus-mode.png" width="240" alt="Focus mode" />
  <img src="docs/screens/1b-today-evening-dark.png" width="240" alt="Today, evening dark mode" />
</p>

## Features

- **The Room** — a layered SVG scene (window sky, lamp glow, tint overlay, tiny character) with four time states plus a rain variant. It follows the real clock and reflects completion.
- **Morning planning** — brain-dump text is parsed into task cards (name, category, duration, priority, time heuristics), then a priority and energy pass builds a timeline with protected meals and free time kept open on purpose.
- **Daily loop** — Now/Next/Important cards, a real countdown focus timer (pause / +10 min / complete), quick-add with natural-language parsing ("call the framer tomorrow at 4").
- **"My day went wrong"** — pick what changed (woke late, ran long, too tired, urgent thing); Tiny Day moves optionals, shortens flexibles, protects ▲ musts and fixed appointments, inserts rest, and shows the changes before applying. *"Your day has been repaired."*
- **Evening** — mood check-in, gentle stats, leftovers triage (tomorrow / backlog / let go — never auto-carry). *"You did enough for today."*
- **Notifications** — ▲ must = remind + one follow-up · ● should = one reminder · ○ optional = silent. Quiet hours, privacy mode ("Important reminder due now"), and at most one gentle replan prompt. No streaks, no guilt.
- **Plan tab** — Tomorrow, Week, Backlog, and a Routine builder with per-day scheduling.
- **Accessibility** — 44px+ touch targets, dynamic type, reduce-motion and high-contrast toggles, screen-reader labels, and priority always shown as glyph + label, never color alone. No haptics: the app never vibrates.
- **Tablet** — sidebar navigation and wide layouts at ≥768px.

<p align="center">
  <img src="docs/screens/3f.png" width="240" alt="Generated plan" />
  <img src="docs/screens/4a.png" width="240" alt="My day went wrong" />
  <img src="docs/screens/5h.png" width="240" alt="Evening review" />
</p>

## Design system

Quicksand (display) + Karla (UI) · 4px spacing grid · radii 12/16/20/pill.

Light: paper `#FAF6F0`, ink `#3A3532`, sage `#7E9B77`, dusty blue `#7D97B8`, terracotta `#C4714F`, peach `#F2CDB4`, beige `#E8D8C2`.
Dark (never pure black): bg `#26232A`, surface `#312D34`, ink `#F3EDE6`, with 18% tint chip fills and white borders at 6–8%.

<p align="center">
  <img src="docs/screens/1g-design-system.png" width="380" alt="Design system" />
  <img src="docs/screens/9e-dark-tokens.png" width="380" alt="Dark mode tokens" />
</p>

The full 65-screen design spec lives in [docs/screens/](docs/screens/) — see [INDEX.txt](docs/screens/INDEX.txt) for the naming scheme ([10a](docs/screens/10a-navigation-map.png) is the navigation map, [10b](docs/screens/10b-user-flow.png) the user journey).

## Stack

- Expo SDK 57 · TypeScript · expo-router
- Zustand + AsyncStorage (all data local; works fully offline)
- react-native-svg (the Room) · react-native-reanimated
- expo-notifications (local only) · expo-google-fonts (Quicksand, Karla)

## Run it

Requirements: Node.js 20 or newer and npm. For native device/emulator workflows,
install the relevant Android or iOS tooling as described in the Expo docs.

```bash
npm install
npx expo start        # then press a for Android, i for iOS, w for web
npm run typecheck     # tsc --noEmit
```

## Install the Android app

Download the APK from the [latest GitHub release](https://github.com/royalpinto007/Tiny-Day/releases/latest),
allow installation from your browser or file manager when Android asks, and
open the downloaded file. Tiny Day currently targets Android 7.0 (API 24) and
newer.

## Build an Android preview

EAS is the supported path for producing the installable test APK:

```bash
npx eas-cli build -p android --profile preview
```

The `preview` profile in `eas.json` produces an APK. Production builds use the
`production` profile and should only be published after device testing.

For local Android debugging:

```bash
npm run android
```

An experimental local standalone script is also available:

```bash
scripts/build-standalone.sh            # -> TinyDay-standalone.apk
adb install -r TinyDay-standalone.apk
```

This script creates a development-signed diagnostic build and is not the release
pipeline. Set `TINYDAY_KEYSTORE`, `TINYDAY_KEYSTORE_PASS`, and
`TINYDAY_KEY_ALIAS` if you need a specific local signing key.

## Project layout

```
app/            expo-router screens (tabs, onboarding, planning, replan, evening, focus…)
components/     design-system components (TaskCard, chips, ProgressRing, BottomSheet, Room…)
theme/          light/dark tokens, type scale, ThemeProvider
lib/            types, zustand stores, NL parsing, scheduler, repair engine, notifications
docs/screens/   the 65-screen design reference
```

For the main modules and data flow, see [Architecture](docs/ARCHITECTURE.md).

## A note on text rendering

If text looks outlined or "stroked", especially in light mode, check
**Settings → Accessibility → High contrast text** on the device. Android draws
an outline around all text system-wide when that is on, which reads very
differently from the design. It is a device preference, not an app setting, and
the app cannot (and should not) override it.

## Privacy

Tiny Day stores planning data locally with AsyncStorage. It does not require an
account and does not include cloud sync, advertising, or analytics. Local
notifications are scheduled on the device. See [Security](SECURITY.md) for
responsible vulnerability reporting and the current support policy.

## Contributing

Bug reports, accessibility feedback, documentation improvements, and focused
pull requests are welcome. Read [Contributing](CONTRIBUTING.md) before starting,
and review the [Code of Conduct](CODE_OF_CONDUCT.md). Release history is tracked
in the [Changelog](CHANGELOG.md).

## License

Tiny Day is available under the [MIT License](LICENSE).
