# Changelog

All notable changes to Tiny Day are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Community documentation and GitHub contribution templates.
- GitHub Actions validation for TypeScript and Expo project health on pushes
  and pull requests.
- Play Store listing copy, privacy disclosures, graphic assets, and production
  release preparation.

### Fixed

- Focus mode now gives the Complete action a full-width row so its label does
  not wrap on narrow Android screens or with larger text.

## [1.0.0] - 2026-07-19

### Added

- Offline-first Expo application with local Zustand and AsyncStorage data.
- Guided onboarding for name, day shape, planning style, notifications,
  calendar preference, and room theme.
- Natural-language task capture, review, prioritization, duration estimates,
  and gentle timeline generation.
- Today dashboard with Now, Next, and Important views plus expanded timeline.
- Focus timer with pause, extend, and completion controls.
- “My day went wrong” repair flow that protects must-do and fixed tasks while
  moving or shortening flexible work.
- Evening reflection with mood, gentle statistics, and explicit leftover-task
  choices instead of automatic carry-over.
- Tomorrow, Week, Backlog, and Routine planning views.
- Layered illustrated Room that responds to time of day, weather, and progress.
- Local priority-based notifications, quiet hours, privacy-safe lock-screen
  text, notification center, and settings.
- Light, dark, reduced-motion, and high-contrast preferences.
- Responsive tablet navigation and layouts.
- Expo EAS preview APK workflow and experimental local standalone build script.
- Complete 65-screen visual design reference under `docs/screens/`.

### Changed

- Replaced placeholder branding with the Tiny Day sage, amber, and paper mark
  across the launcher icon, adaptive icon, splash, favicon, and app UI.
- Removed the logo's background tile on the welcome screen and adjusted sizing
  to prevent clipping.
- Added setup progress, step count, and back navigation to onboarding.
- Replaced font-glyph tab icons with consistent drawn icons.
- Updated date formatting to match the product design.
- Removed all haptic feedback to preserve the app's quiet interaction model.
- Hardened font and splash startup behavior and deferred notification syncing
  away from the first frame.

### Fixed

- Corrected the EAS dependency/lockfile state so cloud Android builds succeed.
- Replaced the white Android launch screen with theme-aware branding.
- Prevented font-loading errors from blocking the app indefinitely.
- Verified the EAS APK on two physical Android devices over wireless debugging.

[Unreleased]: https://github.com/royalpinto007/Tiny-Day/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/royalpinto007/Tiny-Day/releases/tag/v1.0.0
