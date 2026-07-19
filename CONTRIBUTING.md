# Contributing to Tiny Day

Thanks for helping make daily planning calmer and more accessible. Contributions
can be code, documentation, design feedback, testing, translations, or clear bug
reports.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- Open an issue before a large feature, data-model change, or visual redesign.
- Keep proposals aligned with Tiny Day's offline-first, low-pressure approach.
- Never add analytics, account requirements, cloud storage, guilt mechanics, or
  haptics without an explicit project decision.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Small fixes and documentation improvements can go directly to a pull request.

## Local setup

You need Node.js 20 or newer and npm.

```bash
git clone https://github.com/royalpinto007/Tiny-Day.git
cd Tiny-Day
npm install
npx expo start
```

From the Expo terminal, press `a` for Android, `i` for iOS, or `w` for web.
Native platforms require their usual SDK or simulator tooling.

## Project conventions

- Use TypeScript and keep the existing Expo Router file-based navigation.
- Reuse tokens from `theme/` and components from `components/` before adding
  one-off styles.
- Preserve 44px minimum touch targets, screen-reader labels, dynamic type, and
  non-color indicators for important state.
- Keep user data on-device and avoid new network dependencies unless discussed.
- Keep notification copy private, gentle, and actionable.
- Use clear, imperative commit messages such as `Improve empty backlog state`.

See [Architecture](docs/ARCHITECTURE.md) for module boundaries and data flow.

## Quality checks

Before opening a pull request, run:

```bash
npm run typecheck
npx expo-doctor
```

Also exercise the changed flow on a physical device or emulator. For visual
changes, check light and dark themes, larger text, and at least one narrow phone
layout. Mention exactly what you tested in the pull request.

For an installable Android test build:

```bash
npx eas-cli build -p android --profile preview
```

Maintainer Expo credentials are not required for most contributions; local Expo
development is usually sufficient.

## Pull requests

- Keep each pull request focused on one concern.
- Explain the user-facing outcome and any tradeoffs.
- Link the related issue when one exists.
- Include before/after screenshots for visual changes.
- Update README or architecture documentation when behavior changes.
- Add an entry under `Unreleased` in `CHANGELOG.md` for notable changes.
- Do not commit APKs, generated native directories, IDE settings, credentials,
  or local environment files.

By contributing, you agree that your contribution is licensed under the
project's [MIT License](LICENSE).
