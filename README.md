# Hevier

A personal workout tracker for Android, built with Expo and React Native.
Everything lives on the phone (SQLite), with an optional backup to your own PC
over Wi-Fi. No accounts, no cloud, no ads.

> **Unofficial.** Hevier is a hobby project inspired by the Hevy app. It is not
> affiliated with, endorsed by or connected to Hevy or its makers. "Hevy" is
> their trademark. Hevier contains no Hevy code or assets.

## Features

- Log workouts: sets, warm-up / failure sets, rest timer, clock (timer and
  stopwatch), live PR medals, "reps left" after the last set
- Routines and folders, drag to reorder, and a **Cycle** that suggests the next
  routine
- Workout history, calendar, and a page for each workout with its muscle split
- Statistics: body heat map, muscle distribution, push/pull balance, recovery
  estimate, main exercises, monthly report
- Exercise library of 5,600+ exercises (from [openGym](#credits))
- Ongoing-workout notification with rest controls, home-screen widgets
- Import your history from a Hevy CSV export
- **Hevier Sync**: a small PC program that keeps a backup of the phone and can
  restore it

## Getting started

You need Node.js 22+, the Android SDK, and an emulator or an Android phone with
USB debugging on. The app has its own native modules, so it doesn't run in
Expo Go: build it once with

```bash
npm install
npx expo run:android
```

After that, `npx expo start` serves code changes to the installed app.

Checks (types, lint, tests):

```bash
npm run check
```

They also run before every commit: `npm install` turns on the git hook in
`.githooks/pre-commit`.

### Import your Hevy history (optional)

In Hevy, export your workouts as CSV, then with the device connected:

```bash
scripts/load-device.sh path/to/workouts.csv
```

This **replaces** the app's data on the device. Hevy's export has workouts
only, so make your routines in the app.

### Exercise pictures

The exercise stills and clips are licensed by Gym visual to openGym only, so
they are **not** in this repository. Without them the app shows a placeholder.
If you have your own licensed copy, put it in `catalogue/media/` and
`scripts/load-device.sh` copies it onto the device.

### Hevier Sync (PC backup)

```bash
cd backup-server
npm install
npm start
```

Scan the QR code it shows from the app (Profile → Settings → Sync with PC).
Backups go to `~/HevierBackup`. Settings, what it keeps and its safety model:
[backup-server/README.md](backup-server/README.md).

### Release build on your phone

```bash
npx expo prebuild --platform android
(cd android && ./gradlew assembleRelease)
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

`install -r` installs over the old app and keeps its data. The build is signed
with the key described in `~/.config/hevier/keystore.properties` (`storeFile`,
`storePassword`, `keyAlias`, `keyPassword`), or with the debug key if that file
doesn't exist. Keep your key safe: an update signed with another key can't be
installed over the old app, and uninstalling wipes its data.

A release build isn't debuggable unless you prebuild with `HEVIER_DEBUGGABLE=1`.
`scripts/load-device.sh` needs that to copy data in, but it also lets anyone
with the phone on USB read the app's data.

## Project layout

```
app/           screens (Expo Router)
components/    screen pieces, by feature; shared ones in components/ui/
lib/           plain logic: formatting, stats, training maths
db/            database access by topic, and migrations
constants/     colours, sizes, labels, training numbers
types/         every type and interface
hooks/ stores/ React hooks and shared state
modules/       native Kotlin: workout notification, home-screen widgets
backup-server/ Hevier Sync, the PC backup program
shared/        code used by both the app and backup-server
scripts/       import, device loading, design tools
```

## Contributing

Pull requests are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) has the code
rules and the checks to run first.

## Licence

Hevier is free software under the [GNU AGPL v3.0](LICENSE). The bundled exercise
catalogue comes from openGym, which is AGPL too.

## Credits

See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the full list:

- Exercise catalogue: [openGym](https://github.com/DuarteSantos8/openGym) (AGPL-3.0),
  partly from ExerciseDB via hasaneyldrm/exercises-dataset (MIT)
- Body map: [MuscleMap](https://github.com/Jsplice/MuscleMap) (MIT)
- Figtree font (SIL Open Font License), Phosphor icons (MIT), Lucide icon (ISC)
