# Roadmap

Hevier is a hobby project with one main maintainer. This roadmap is an order of
work, not a promise of dates. Last reviewed 2026-11-07.

The order comes from three things: a code audit, market research on other
workout and running apps, and three design specs (run recovery, iOS, landing
page). They are in [docs/research/](docs/research/README.md). Read the caveats
there first: the research could not read Reddit, and some citations are unchecked.

## How to read this

- **Now:** the next 8 weeks or so. Data safety first, then the base for what comes after.
- **Next:** 2 to 6 months. Real features, once the data is safe.
- **Later:** more than 6 months, or big, or waiting on a decision or on evidence.
- **Size:** `S` a few hours, one small pull request. `M` one to three days, one to three pull requests. `L` a week or more, or it needs a design decision first. These are one person's guesses.
- **Status:** `shipped`, `in progress`, `planned`. Nothing here is `planned` because it was promised to anyone.
- **IDs** (`R-01`, `R-02`, ...) never change and are never reused. Use them in issues, pull requests and the project board. The order of the list can change, the IDs cannot.
- Finding IDs (`A-10`, `Y-01`, `I-02`, ...) point into [docs/research/audit-summary.md](docs/research/audit-summary.md).

## Shipped (v1.0, Android)

Not roadmap items, listed so "planned" has something to be compared with.

- Logging: weight, reps, time or distance; warm-up and failure sets; rest timer; live PR medals; "reps left"; per-hand weight; clock with timer and stopwatch; edit, copy and back-date workouts.
- Routines in folders, drag to reorder, a training cycle that says what is next.
- Statistics, all free: body graph, recovery map, muscle distribution, push and pull balance, set counts, monthly report, profile charts, exercise pages with records and history.
- Science notes with cited studies: [how sets count](docs/science/sets.md), [recovery windows](docs/science/recovery.md).
- 5,600+ exercise catalogue (openGym), a Conditioning card against the WHO cardio guideline.
- Rest notification with Complete, Skip, -15s and +15s buttons, and four home-screen widgets.
- Hevy CSV import, and Hevier Sync (backup to your own PC over Wi-Fi or USB).
- Checks on every commit and pull request: types, lint, tests, SonarQube.

## At a glance

| ID | Item | Size | Status | Horizon |
|---|---|---|---|---|
| R-01 | Monorepo with pnpm and Turborepo | M | in progress | Now |
| R-02 | Roadmap, agent rules, GitHub workflow | S | in progress | Now |
| R-03 | Pairing hardening | S | planned | Now |
| R-04 | Restore and sync safety | L | planned | Now |
| R-05 | Atomic migrations | S | planned | Now |
| R-06 | PC backup durability and validation | M | planned | Now |
| R-07 | Android notification and widget fixes | M | planned | Now |
| R-08 | Input and chart guards | S | planned | Now |
| R-09 | Cleanup and dependency pass | S | planned | Now |
| R-10 | Landing page v1 | M | planned | Now |
| R-11 | Run recovery: science note and pure model | M | planned | Now |
| R-12 | Warm-ups out of records | M | planned | Next |
| R-13 | Accessibility: shared components | M | planned | Next |
| R-14 | Accessibility: screens | L | planned | Next |
| R-15 | UI test layer | M | planned | Next |
| R-16 | Store and hook tests, draft resilience | M | planned | Next |
| R-17 | Run recovery: Run exercise and log run | M | planned | Next |
| R-18 | Run recovery: today card and check-in | M | planned | Next |
| R-19 | FIT, GPX and TCX import for runs | M | planned | Next |
| R-20 | Backup to a folder and full export | M | planned | Next |
| R-21 | Plate and warm-up calculators, rest timer per set type | M | planned | Next |
| R-22 | iOS spike and baseline | M | planned | Next |
| R-23 | Health Connect import | L | planned | Next |
| R-24 | F-Droid release | M | planned | Next |
| R-39 | CSV import robustness | M | planned | Next |
| R-25 | Run recovery: week, calendar, what-if | M | planned | Later |
| R-26 | Run recovery: wearable inputs | M | planned | Later |
| R-27 | Combined lifting and running load view | M | planned | Later |
| R-28 | Exercise history list | M | planned | Later |
| R-29 | Free program library | L | planned | Later |
| R-30 | Translations | L | planned | Later |
| R-31 | Strength score | M | planned | Later |
| R-32 | iOS rest timer as a Live Activity | L | planned | Later |
| R-33 | iOS widgets | L | planned | Later |
| R-34 | Wear OS companion | L | planned | Later |
| R-35 | Sync transport security | L | planned | Later |
| R-36 | Performance and data model debt | L | planned | Later |
| R-37 | Export lifts as FIT | M | planned | Later |
| R-38 | Local monthly report | S | planned | Later |

## Now

Why this order: the audit found no critical bug, but the two highest findings can
lose a user's whole history (restore) or send it to a stranger (pairing link).
Hevier's promise is "your data stays yours", so those come before any feature.
R-10 and R-11 touch other files and can run in parallel with the safety work.

### R-01 Monorepo with pnpm and Turborepo
`M` · in progress · branch `chore/monorepo-turbo`, not on `main` yet

- **Why:** on a fresh clone the old `npm run check` failed at `tsc` because the sync server needed its own install (audit baseline). `apps/web` and `packages/shared` also need a home.
- **Scope:** `apps/mobile`, `apps/sync`, `apps/web` (empty), `packages/shared`, `packages/catalogue`, shared lint and tsconfig, one `pnpm check`, CI and the pre-commit hook on Turborepo.
- **Done when:** merged, CI green, README and CONTRIBUTING describe the layout (they already do on the branch).

### R-02 Roadmap, agent rules, GitHub workflow
`S` · in progress · this change

- **Why:** contributors and coding agents had no shared plan, no issue templates and no rules for the risky code (sync, migrations).
- **Scope:** this file, `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`, issue and pull request templates, labels, a project board guide, and the research in `docs/research/`.
- **Done when:** merged, and the owner has applied the labels and made the board from [docs/github-project.md](docs/github-project.md).

### R-03 Pairing hardening
`S` · planned · audit A-01, A-04, T-12

- **Why:** `hevier://pair?host=...&key=...` is a registered link. Opening it from a web page or QR code saves the pairing with no confirmation, and the next quiet sync sends the whole database and all photos to that host. A test shows an outside host is accepted. It is the highest security finding.
- **Scope:** remove the `pair` route (the in-app scanner already pairs) or add a confirm dialog that shows the host. Accept only private LAN, link-local, loopback and `.local` hosts. A new host needs a manual "Sync now" before any quiet sync. Catch bad percent escapes and reject ports above 65535.
- **Done when:** tests in `apps/mobile/lib/sync/pairing.test.ts` cover a hostile host, a bad escape and the port range.

### R-04 Restore and sync safety
`L` · planned · audit A-10, A-11, A-16, T-01

- **Why:** restore deletes the live database and photos before it copies the new ones in. Any failure in between leaves the phone with nothing, and a quiet sync running at the same time can delete the staged files. The only copy of a user's history is at stake.
- **Scope:** copy the staged files next to the target, check them (`PRAGMA integrity_check`, `user_version` not above the latest), swap by rename, keep the old data as a backup until the app reloaded fine. One busy flag so sync and restore never overlap, and separate cache folders. Timeouts on uploads and `/commit`. Fix the "your data was not changed" message so it is true.
- **Done when:** a test with a fake file system fails on the old code and passes on the new, for a missing staged file and for a sync that ends during a restore.

### R-05 Atomic migrations
`S` · planned · audit A-13, T-07

- **Why:** a migration and its version bump run as two statements, with no transaction. A crash halfway through the table rebuild in `009_warmup_sets.ts` leaves a stray table and the app can never open its database again.
- **Scope:** run each migration and its `PRAGMA user_version` inside one transaction, roll back on error.
- **Done when:** a test that fails halfway and runs again passes. It must land before the run recovery migrations (R-17).

### R-06 PC backup durability and validation
`M` · planned · audit A-12, A-03, A-17, P-05, T-05, T-06

- **Why:** a crash or a Windows file lock between the two renames in `apps/sync/store.ts` leaves no copy, and the next commit deletes the only good one. The "wiped phone" guard counts workouts, so deleting one workout makes every sync refuse. The server also has no body limit and compares the key without a timing-safe check.
- **Scope:** recover `old/` at start, timing-safe key compare, body size cap, validate every field, reject `.` and `..` path parts. Replace the workout count with a content signature. Stop polling `adb` once it is missing.
- **Note:** the signature change is a protocol change in `packages/shared`. Phone and PC must move together, so do it after R-03 and R-04.

### R-07 Android notification and widget fixes
`M` · planned · audit A-14, A-15, A-25, A-28, A-29

- **Why:** the notification service can stop without calling `startForeground`, which crashes the app on Android. Widget midnight alarms are lost on reboot or a date change, so widgets show the wrong day until the app opens.
- **Scope:** always start foreground with a placeholder and guard the call, re-book the redraw from `onUpdate` and on date, time zone and boot broadcasts, release audio focus on errors, private lock-screen visibility, decode pictures sampled and retry.
- **Done when:** checked on a device or emulator after `pnpm android`. These are Kotlin changes with no unit tests, so say what was run.

### R-08 Input and chart guards
`S` · planned · audit A-19, A-20, T-09, T-10

- **Why:** one `NaN` makes `barScale` loop forever and freezes the app. Set inputs accept `0x10`, `1e3` and negatives, so volume can go negative.
- **Scope:** filter non-finite values and cap the loop, validate set and clock input, clamp to zero, round reps and seconds.
- **Done when:** the two tests named in the audit exist and pass.

### R-09 Cleanup and dependency pass
`S` · planned · audit A-05, A-06, A-27, I-05

- **Why:** a debug probe ships in release builds, the app is dark only but `userInterfaceStyle` is `automatic`, two Expo packages are unused, and `expo-build-properties` is listed twice.
- **Scope:** gate `perfProbe` on `__DEV__`, set the style to `dark`, remove unused dependencies, merge the duplicate plugin entry, run `pnpm audit` and take the safe updates.
- **Note:** touches `apps/mobile/app.json` and `app/_layout.tsx`. Land before R-22 and R-35.

### R-10 Landing page v1
`M` · planned · market research section 5

- **Why:** `apps/web` is empty and the app has no public page. Competitors show static screenshots only, so a live demo is the strongest "show, don't tell" asset.
- **Scope:** one static page. Lead with "Train hard. Recover smart" (free recovery map, sources for every number). An interactive recovery-map demo. Honest hero: "Android today, iOS on the roadmap". A visible "unofficial, not affiliated with Hevy". Compare free limits with concrete numbers "at time of writing" and check them in the stores first. No trackers.
- **Rules:** no exercise stills (the openGym licence forbids it). Never say "Hevy alternative" in the title. Do not claim "no internet permission": sync uses the network. The web stack is not chosen yet, decide in the issue.

### R-11 Run recovery: science note and pure model
`M` · planned · [running.md](docs/research/running.md) phase 1

- **Why:** lifting and running data live in different apps, and nobody offers a free answer to "can I lift legs today, and how hard can I run tomorrow?" Hevier already has the leg recovery model, so runs can reuse it. Garmin was only surveying users about a muscle recovery map in April 2026.
- **Scope:** new files `docs/science/running.md`, and in `apps/mobile`: `constants/run.ts`, `types/run.ts`, `lib/training/run.ts`, `lib/training/runReadiness.ts`, plus tests 1 to 30 of the spec. No screens, no database.
- **Before you start:** re-check every `[m]` citation in the spec, and answer its open questions (one run slot time or one per weekday, imported Hevy runs). The worked examples in the spec came from a throwaway implementation, so the new code has to reproduce them.
- **Done when:** the model is pure, tested, and the science note lists its gaps the way `recovery.md` does.

## Next

### R-12 Warm-ups out of records
`M` · planned · audit A-18, T-08 · needs a product decision first

- **Why:** a heavy warm-up can fire the PR toast and raise the best that working sets must beat. Fixing it changes past PR counts, so the owner decides first (count warm-ups for records or not).
- **Scope:** skip warm-ups in record logic and in the bests query, carry the set type through the history types, add the warm-up test.

### R-13 Accessibility: shared components
`M` · planned · audit Y-01 (part)

- **Why:** 2 of 128 `.tsx` files set any accessibility prop, and about 100 `Pressable`s have no role or label. TalkBack says "unlabelled button", so logging a workout is not operable for a blind user.
- **Scope:** role, label and state on `components/ui/*` and `components/set-table/*` first, so every screen that uses them improves at once.

### R-14 Accessibility: screens
`L` · planned · audit Y-01, Y-02, Y-03, Y-04 · after R-13

- **Why:** icon-only controls (done check, set badge, play and stop, header buttons) still need labels, rows are under 48 dp, large system fonts can clip set rows, and recovery colours have no text alternative.
- **Scope:** split by screen, log workout first. 48 dp targets, a cap on font scale for dense rows, a text summary of recovery that a screen reader can reach.

### R-15 UI test layer
`M` · planned · not from the audit, from a gap in it

- **Why:** screens, components and hooks have no tests, and Sonar leaves them out of coverage (`sonar-project.properties`). UI regressions are only caught by hand, and a pull request's screenshots are the only proof.
- **Scope:** a one-day spike to pick a tool, then three flows: log a workout with one set, pair a PC with a link, restore from the PC (needs R-04). Candidates are Maestro for emulator flows and React Native Testing Library for components. Neither was evaluated in the research, so this is a proposal, not a decision. Flows must use demo data only.
- **Done when:** one command runs the flows locally. Running them in CI is optional because emulators are slow there.

### R-16 Store and hook tests, draft resilience
`M` · planned · audit A-24, T-02, T-03, T-04

- **Why:** the active workout store is at 59 percent and several stores and hooks at 0. A corrupt saved draft makes loading retry forever and the draft can never be reached.
- **Scope:** validate or move aside a bad draft, use the timer's end time as the rest base, and add tests for the set timer, begin while writes are pending, the failed-load retry, clock and widget refresh.

### R-17 Run recovery: Run exercise and log run
`M` · planned · running.md phases 2 and 3 · needs R-05 and R-11

- **Why:** the model needs runs in the database. A run is one built-in `Run` exercise with distance, time and effort (RPE 1 to 10), the way Football works. No new runs table.
- **Scope:** migration 011 (exercise), the 012 tables for check-ins and feedback, `distanceKm` in the stat sets, skip `Run` in the muscle recovery state, count it in Conditioning, an RPE picker on the log screen.

### R-18 Run recovery: today card and check-in
`M` · planned · running.md phases 4 and 5 · after R-17

- **Why:** the user-facing result: one word (Run quality, Run easy, Strength only, Rest), the reasons, tomorrow's provisional call, and a 10 second morning check-in (feel, sleep hours, pain or sick).
- **Scope:** the card on the Recovery view and its own screen, settings (slot time, on or off), the medical disclaimer on first open, a "How this works" page. Copy follows the spec: estimates are called estimates, never "you will get injured".

### R-19 FIT, GPX and TCX import for runs
`M` · planned · market opportunity 4 · after R-17

- **Why:** a file import needs no API and keeps the app local. Garmin's developer program is business-only and paused for new approvals, and Strava, Garmin and Apple all let a user export files.
- **Scope:** pick a parser (check its licence is compatible with AGPL), map to one run (time, distance, effort default of 4 with a visible note), no GPS track storage in v1.

### R-20 Backup to a folder and full export
`M` · planned · market opportunity 11

- **Why:** Hevier Sync needs a PC. A local-first app loses people when a phone dies, and a manual backup is FitNotes' main complaint. Checked in the code: the app has no export of any kind today.
- **Scope:** a scheduled backup to a folder the user picks (Android Storage Access Framework), one-tap restore, full JSON and CSV export.
- **Needs R-04 first:** restore must be safe before a second restore path exists.

### R-21 Plate and warm-up calculators, rest timer per set type
`M` · planned · market opportunity 6

- **Why:** Hevy and Strong put these behind a subscription, and Hevy users ask for separate warm-up rest timers. Checked in the code: there is no plate or warm-up calculator, and the rest timer is per exercise only (`restOf` in `db/workoutSettings.ts`).
- **Scope:** both calculators, free, and a rest time that depends on the set type.

### R-22 iOS spike and baseline
`M` · planned · [ios.md](docs/research/ios.md) PR 0 and 1 · audit I-01, I-02

- **Why:** the JS, SQLite, sync and routing already run on iOS. The research says the cheap first step is a one-day throwaway spike that decides the risky parts (App Groups on a free Apple account, whether a Live Activity button works after the app is killed, whether `@bacons/apple-targets` works with SDK 57).
- **Scope:** the spike (not merged), then the baseline: the `ios` block in `app.json`, the local-network `Info.plist` keys, hide "Sync over USB cable" on iOS, iOS shadow styles, a simulator seed script, README text.
- **Not in scope:** parity with the Android notification and widgets (R-32, R-33). Parity waits for evidence that iOS users exist. This Mac had no Simulator runtime or CocoaPods when the research ran.

### R-23 Health Connect import
`L` · planned · market opportunity 3

- **Why:** strength and endurance data live in different apps. Garmin, Samsung, Fitbit and Strava all write to Health Connect, so it closes the gap for most Android users.
- **Scope:** read-only first (runs, steps, heart rate, weight, sleep). Writing lifts back is a separate item. Decide between a community module and our own Kotlin.
- **Risks:** Google Play needs a Health Connect permissions declaration and reviews it. Heart rate from Wear OS was unreliable in Hevy per one report.

### R-24 F-Droid release
`M` · planned · market opportunity 12

- **Why:** an F-Droid release was among the top requests on the two open source siblings (12 and 10 thumbs up), and it fits an AGPL app.
- **Scope:** a reproducible build, a metadata file, signing story, and a check for anti-features in every dependency, including any Health Connect library from R-23.

### R-39 CSV import robustness
`M` · planned · audit A-21, T-11

- **Why:** "switch from Hevy in a minute" is a landing page claim. An imperial export throws with no row or column in the error, dates are read in the computer's time zone, and a distance-only exercise aborts the whole import.
- **Scope:** check headers up front with a clear error (or convert lb and mi), a `--tz` option that says which zone was assumed, infer distance exercises, row numbers in errors, keep same-title workouts apart.
- **Note:** confirm Hevy's imperial header names against a real export.

## Later

### R-25 Run recovery: week, calendar, what-if
`M` · planned · running.md phase 6 · after R-18

Weekly load bars, easy, moderate and hard minutes, a 14 day strip that marks legs, runs and football, and a what-if for adding a leg session. This shows the price of "legs tonight" before the user pays it.

### R-26 Run recovery: wearable inputs
`M` · planned · running.md phase 7 · after R-18 and R-23

Sleep, resting heart rate and HRV from Health Connect, read-only, and allowed only to lower a suggestion to easy. HRV and resting heart rate are weak, individual signals, so they never produce Rest. The app must look complete without a wearable.

### R-27 Combined lifting and running load view
`M` · planned · market opportunity 8 · after R-17

Hard sets and run effort minutes in one chart with a plain explanation. Descriptive only ("more than you usually do"). No risk score (see non-goals).

### R-28 Exercise history list
`M` · planned · audit A-22, P-02

Render the history in a virtualised list, compute set badges once per session, key by workout exercise so an exercise logged twice in a workout does not collide.

### R-29 Free program library
`L` · planned · market opportunity 7

About 15 plain JSON programs (5/3/1, GZCLP, push pull legs, linear) with simple auto-progression. No scripting language: Liftosaur's author calls its own scripting too complicated. Do not copy Boostcamp content.

### R-30 Translations
`L` · planned · market opportunity 13

UI strings and exercise names. The catalogue is one file per exercise, so the community can contribute names by pull request. Chinese names and i18n are asked for on both open source siblings.

### R-31 Strength score
`M` · planned · market opportunity 14

A free one-number progress metric from estimated 1RM and "reps left". Boostcamp sells a similar score in its Pro tier.

### R-32 iOS rest timer as a Live Activity
`L` · planned · ios.md PR 2 and 3 · after R-22

Lock screen and Dynamic Island countdown with Complete, Skip and plus or minus 15 second buttons, and a local notification for the end of rest. The hard part is a button tap when JavaScript is not running; the spike in R-22 decides the design.

### R-33 iOS widgets
`L` · planned · ios.md PR 4 to 6 · after R-22

Calendar, Volume, Cycle and Recovery in SwiftUI with a shared JSON file, matching the Android data contract. Recovery needs an SVG path parser for the body outline.

### R-34 Wear OS companion
`L` · planned · market opportunity 10

Log a set, start a rest timer, see the next set. Phone and watch sync bugs are a top complaint in other apps, so the notification buttons we already have stay the 80 percent answer until there is demand.

### R-35 Sync transport security
`L` · planned · audit A-02 · needs a design decision

Sync is plain HTTP on the LAN and the app allows cleartext. Options are a self-signed TLS certificate pinned by a fingerprint in the QR code, or an HMAC on each request. Documented in `apps/sync/README.md` as accepted for now, so this is hardening. After R-09.

### R-36 Performance and data model debt
`L` · planned · audit P-01, P-03, P-04, A-23, A-26 · measure first

Home, Profile and statistics load every set ever. Roughly 50k rows after ten years of training, not measured yet. Also: transactions are queued but plain writes are not, and the cycle finds the next routine by title. Each needs a measurement or a repro first.

### R-37 Export lifts as FIT
`M` · planned · market opportunity 5

Gives users an exit and lets intervals.icu or Strava ingest strength by file. A file the user sends themselves, not an integration.

### R-38 Local monthly report
`S` · planned · market opportunity 15

A static report of the month the user can share, rendered on the phone. Weak evidence, nice to have.

## Order and dependencies

- R-03, R-05 and R-04 first, in that order of effort. Then R-06, because it changes the protocol.
- R-05 before any migration in R-17.
- R-11 then R-17 then R-18, R-19 and R-25.
- R-23 before R-26. R-23 and R-24 share the Health Connect licence question.
- R-04 before R-15's restore flow and before R-20.
- R-09 before R-22 and R-35 (all touch `app.json`).
- R-13 before R-14.
- R-22 before R-32 and R-33.

## Non-goals

Firm. A pull request that adds one of these is not accepted unless it first changes this list.

1. **No cloud accounts.** No sign-in, no hosted backend, no Hevier servers. Data lives on the phone. Backups go to the user's own PC or folder (R-04, R-20). Liftosaur's optional account is the model we decline.
2. **No ACWR or injury-risk scores.** The research found the acute to chronic load ratio has real statistical problems and is not a validated injury predictor (Impellizzeri 2020 and 2021, Lolli 2019). The run recovery spec uses a 7 and 28 day ratio only as a hidden guard that can lower a suggestion to "easy". It never shows a risk number and never says someone will get hurt.
3. **No Strava dependency.** No Strava OAuth, API calls or uploads for any feature. Third-party Strava terms since November 2024 limit display and ban AI use, and the app is local-first. File import (R-19) and file export (R-37) cover the same need.

Not planned for now. Open an issue with evidence if you think one should move.

- A social feed or leaderboards. Hevy's moat is its network; Hevier is built for logging, not likes.
- An AI workout generator. It costs money to run, needs a server, and the apps that have one are criticised for repeating workouts.
- Ads, subscriptions or paywalls. Every feature stays free.
- Live GPS run tracking. Hevier logs and imports runs, it does not record them.
- The Garmin Connect API. Its developer program is business-only and paused for new approvals. Files are the path.
- Medical claims. Run and recovery guidance is a training estimate and says so.
- Hevy's code, images, icons, text or screenshots, and any redistribution of the licensed exercise pictures.

## How to propose a change

1. Search this file and the open issues first.
2. Open a **Feature** issue ([template](.github/ISSUE_TEMPLATE/feature.yml)). Say who it helps, what happens today, and give evidence: a link, a number, a repro. "I think users want it" is not evidence.
3. Check it against the non-goals.
4. If the maintainer accepts it, a pull request adds it here with the next free ID, a size and a horizon. Only then does it get a `roadmap` label and a spot on the project board.
5. To move, resize, split or drop an item, send a pull request that edits this file and say why in the description.
6. The pull request that finishes an item changes its status here, in the same pull request.

Rules for editing this file:

- Never renumber or reuse an ID. A dropped item stays in a "Dropped" list below with the reason.
- Shipped items move to "Shipped" with the pull request number.
- Keep the rationale tied to a source (an audit finding, a market note, a spec, or an issue). Remove items nobody will do.

### Dropped

Nothing yet.
