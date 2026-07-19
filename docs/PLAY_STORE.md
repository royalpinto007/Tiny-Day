# Google Play submission package

Prepared for Tiny Day `com.tinyday.app`. Review this document whenever app
behavior, permissions, SDKs, or data handling changes.

## Main store listing

**App name — 8/30 characters**

> Tiny Day

**Default language**

> English (United States) — en-US

**App or game**

> App

**Category**

> Productivity

**Tags to consider**

> Planner, Task management, Time management

**Short description — 76/80 characters**

> A calm, offline daily planner for gentle schedules, focus, and flexible days

**Full description**

> Make today feel manageable.
>
> Tiny Day is a calm, offline daily planner that turns a simple brain dump into a realistic timeline. Plan what matters, focus on one task at a time, and gently reshape the day when plans change.
>
> PLAN WITHOUT THE PRESSURE
>
> Add tasks in everyday language, choose what matters most, and let Tiny Day arrange a practical schedule around meals, rest, and open time. Priorities are always shown with words and symbols, not color alone.
>
> FOCUS ON WHAT IS NEXT
>
> See what is happening now, what comes next, and which important tasks still need attention. Start a quiet focus timer, pause when needed, add ten minutes, or mark the task complete.
>
> REPLAN WITHOUT GUILT
>
> When the day changes, use “My day went wrong” to repair the remaining plan. Tiny Day protects fixed and must-do tasks while moving optional work, shortening flexible blocks, or making room for rest. You review every change before applying it.
>
> END THE DAY GENTLY
>
> Reflect on how the day felt, review progress without streaks or judgment, and decide what should happen to unfinished work. Nothing is carried forward automatically.
>
> A ROOM THAT CHANGES WITH YOUR DAY
>
> A small illustrated room follows the time of day and brightens as tasks are completed, giving progress a warm visual rhythm.
>
> PRIVATE BY DESIGN
>
> • No account required
> • No cloud sync
> • No advertising or analytics
> • Tasks and preferences stay on your device
> • Optional local reminders with privacy-safe notification text
>
> BUILT FOR DIFFERENT DAYS
>
> • Light and dark appearance
> • Reduced-motion and high-contrast preferences
> • Screen-reader labels and generous touch targets
> • Phone and tablet layouts
> • Tomorrow, week, backlog, and routine planning
>
> Tiny Day helps you make a plan that can bend without making you feel behind.

## URLs and contact

- Privacy policy: <https://royalpinto007.github.io/Tiny-Day/privacy-policy.html>
- Support: <https://github.com/royalpinto007/Tiny-Day/issues>
- Contact email: `royalpinto007@gmail.com`
- Website/source: <https://github.com/royalpinto007/Tiny-Day>

## Data safety draft

Answer these from the behavior of the current release; verify again before every
submission.

| Play Console question | Current answer | Basis |
| --- | --- | --- |
| Does the app collect or share required user-data types? | No | App content remains on-device and is not transmitted to the developer or a third party. |
| Is all user data encrypted in transit? | Not applicable | The app does not transmit user data. |
| Can users request data deletion? | Yes, locally | Individual content can be deleted in-app; all data can be erased through Android clear-storage or uninstall. There is no server copy or account. |
| Does the app contain ads? | No | No advertising SDK or ad content. |
| Does the app require an account? | No | There is no registration or authentication. |

Locally processed information includes the optional first name, tasks, notes,
routines, schedule and completion state, mood check-ins, and preferences. Local
processing is not “collection” under the Data safety definition when it never
leaves the device. The notification permission and on-device notification
content must still be accurately described in the privacy policy.

## App content draft

- Target audience: general audience; select age groups appropriate for a daily
  productivity tool. The app is not specifically designed for children.
- Content rating: productivity/utility; no violence, sexual content, gambling,
  controlled substances, or user-to-user communication.
- Ads declaration: no ads.
- News declaration: not a news app.
- Health declaration: not a health or medical app; mood reflection is a general
  planning feature and makes no health claims.
- Financial features: none.
- Government affiliation: none.
- App access: all features are available without login or special instructions.

The final content rating is generated from the answers entered in Play Console;
do not claim a rating before completing that questionnaire.

## Graphic assets

Prepared under `store-assets/`:

- `icon-512.png` — 512×512 Play Store icon.
- `feature-graphic.png` — 1024×500, opaque RGB feature graphic.
- `feature-graphic.svg` — editable source for the feature graphic.

**Feature graphic alt text**

> Tiny Day logo beside a gentle timeline flowing through warm sage and paper-colored shapes.

## Screenshot plan

Capture at least four real phone screenshots at 1080×1920 or higher in 9:16
portrait. Use demo tasks rather than personal information. Keep the first three
focused on the actual interface.

| Order | Screen | Suggested caption | Alt text |
| --- | --- | --- | --- |
| 1 | Today | A calmer view of today | Today dashboard showing the current task, next task, progress, and illustrated room. |
| 2 | Generated timeline | Turn a brain dump into a plan | Planned timeline with tasks, protected breaks, and open time. |
| 3 | Replan comparison | Plans changed. Your day can too. | Before-and-after schedule showing gentle changes to an interrupted day. |
| 4 | Focus mode | One thing at a time | Focus timer for the current task with pause, extend, and complete controls. |
| 5 | Evening review | End the day without guilt | Evening reflection with mood selection and a gentle progress summary. |
| 6 | Dark mode room | A space that follows your rhythm | Dark-mode room scene and daily task progress. |

Before upload, confirm every screenshot is JPEG or 24-bit PNG without alpha,
between 320px and 3840px per dimension, and no dimension is more than twice the
other. Do not use the lower-resolution design-reference images as final store
screenshots.

## Release checklist

- [ ] Incorporate closed-test feedback and rerun CI.
- [ ] Increment the user-facing version for changes after `v1.0.0`.
- [ ] Run `npm run typecheck` and `npx expo-doctor`.
- [ ] Build with `npx eas-cli build -p android --profile production`.
- [ ] Confirm target API, package name, version code, and signing certificate.
- [ ] Upload the AAB to the intended Play testing track.
- [ ] Complete Data safety, App content, Content rating, and Ads declarations.
- [ ] Upload icon, feature graphic, and at least four real phone screenshots.
- [ ] Verify the public privacy-policy URL from a signed-out browser.
- [ ] Add at least 12 opted-in closed testers for 14 continuous days if the
      Play developer account is subject to the new-personal-account rule.
- [ ] Record feedback and fixes before applying for production access.
