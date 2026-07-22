# Security Policy

## Supported versions

Tiny Day is currently maintained on the latest published release only.

| Version | Supported |
| --- | --- |
| 1.1.x | Yes |
| 1.0.x | No |
| Earlier versions | No |

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue. Use
[GitHub's private vulnerability reporting](https://github.com/royalpinto007/Tiny-Day/security/advisories/new)
when available. If that form is unavailable, contact the repository owner
privately through <https://github.com/royalpinto007>.

Include the affected version, device and OS version, reproduction steps,
potential impact, and any suggested mitigation. Avoid including real personal
planning data in screenshots or logs.

You can expect acknowledgement within seven days. After validation, the
maintainer will coordinate a fix and disclosure timeline appropriate to the
severity. Please allow reasonable time for a patched release before publishing
details.

## Privacy and data model

Tiny Day does not require an account, cloud sync, advertising, or analytics.
Task and preference data is stored locally on the device using AsyncStorage,
and reminders are scheduled as local notifications. Device backups, a modified
device, or another application with elevated access may still expose local
data; Tiny Day does not currently encrypt its local database independently of
the operating system.

Never commit signing keys, Expo access tokens, device logs containing personal
data, or `.env` files to this repository.
