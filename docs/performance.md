# Performance

How Hevier asks for the display's full refresh rate, what was changed for
smoothness, and how to measure it on a phone. Numbers marked "laptop" were
measured with vitest on a development machine. Nothing here was measured on a
phone yet: there was no device with a 90 or 120 hz display.

## What was changed (issue #28)

| Change | Where | Why |
|---|---|---|
| Android asks for the highest refresh rate | `plugins/withHevierRefreshRate.js` | Many phones keep an app at 60 hz unless its window asks for more. React Native does not ask. |
| iPhone ProMotion above 60 hz | `app.json`: `ios.infoPlist.CADisableMinimumFrameDurationOnPhone` | iPhones with ProMotion cap an app at 60 hz without this key. |
| iOS bundle id | `app.json`: `ios.bundleIdentifier` (`com.hevier.app`, same as Android) | iOS builds need one. |
| Set rows swipe on the UI thread | `components/ui/SwipeToDelete.tsx`, `lib/swipeToDelete.ts` | Every set row in Log Workout had a `PanResponder`: each touch move went through the JS thread. Now the row follows the finger in a reanimated worklet and JS runs only when the row is deleted. |
| Last 7 days strip skips old sets | `lib/stats/stats.ts` (`lastSevenDays`) | It built a `Date` for every set ever logged. Now it compares milliseconds first. |

### Android refresh rate, in detail

The config plugin adds a block to the generated `MainActivity.kt`, right after
`super.onCreate`. It reads the display's supported modes, keeps the ones with
the current resolution, and sets the window's `preferredRefreshRate` to the
fastest of them.

- Android's frame rate guide says to use `WindowManager.LayoutParams.preferredRefreshRate`
  when an app only wants a refresh rate. `Surface.setFrameRate` is aimed at
  video surfaces (and API 30+), `preferredDisplayModeId` forces one display
  mode (for resolution changes or heavy mode switches) and is more rigid.
- Same resolution only, so the screen never changes size.
- The block is tagged (`hevier-refresh-rate`) and replaced, not repeated, so
  running prebuild again is safe. `android/` is generated: never edit it by hand.
- Rebuild the app after pulling this change: `npx expo run:android`.

The system may still choose a lower rate: battery saver, thermal limits, a
phone setting that caps the rate, or OEM per-app rules (some Samsung and Xiaomi
phones have their own switch). The app does not retry or fight it.

### What is not covered

- The rate is requested once, in `onCreate`. Moving the app between displays
  (a foldable's two screens) does not ask again.
- `ReorderList` (Reorder Folders, Reorder Exercises, Cycle) still uses
  `PanResponder` with a JS-driven drag. The lists are short; moving it to the UI
  thread would need the order change to wait for the drop, which is a bigger
  change.
- Other lists (Home, Profile, calendar, exercise picker) already have windowing
  settings in `constants/limits.ts` and memoized rows. They were read, not
  changed.

## Measured on the laptop

Synthetic sets, 25 sets per workout, median of 31 runs after one warm-up run.
These are JS costs on a fast machine; a phone is several times slower.

`lastSevenDays` (Statistics screen, runs on every load):

| Sets in history | Before | After |
|---|---|---|
| 5,000 | 0.63 ms | 0.09 ms |
| 25,000 | 3.29 ms | 0.27 ms |
| 50,000 | 6.55 ms | 0.41 ms |

For comparison, the other statistics maths at 50,000 sets (same laptop, median
of 15 runs): `hardSets` over all time 12 ms, `mainExercises` 5.8 ms,
`muscleSplit` 5.4 ms, `monthReport` 1.6 ms, `recovery` 1.1 ms, `conditioning`
1.1 ms, the rest under 1.5 ms. At 5,000 sets all of them are under 1.4 ms. These
are not hot paths, so they were left alone.

Swipe-to-delete has no number: moving the follow off the JS thread means the
JS thread is no longer called per touch move (it is called once, on delete).
That is by construction, not a frame rate measurement.

## How to measure on a phone

Use a release build (`npx expo run:android --variant release`) or at least a
build without the dev menu overlay: debug builds are much slower and say little
about smoothness.

### Check the refresh rate itself

1. Android: Settings, Developer options, "Show refresh rate" (on phones that
   have it), or
   `adb shell dumpsys display | grep -i -E "mActiveModeId|renderFrameRate|refreshRate"`
   while the app is in front. Turn off battery saver and any "smooth display"
   cap first.
2. iPhone with ProMotion: Settings, Accessibility, Motion, Limit Frame Rate
   must be off, and Low Power Mode off. Instruments below shows the real rate.

### Frame times and jank (Android)

```bash
adb shell dumpsys gfxinfo com.hevier.app reset
# scroll / swipe / drag for ~10 seconds
adb shell dumpsys gfxinfo com.hevier.app
adb shell dumpsys gfxinfo com.hevier.app framestats
```

The first dump prints "Total frames rendered", "Janky frames" and the 50th,
90th, 95th and 99th percentile frame time. `framestats` prints one line per
frame (timestamps in ns) to chart.

```bash
adb shell dumpsys SurfaceFlinger --list            # find the app's layer name
adb shell dumpsys SurfaceFlinger --latency "<layer name>"
```

`--latency` prints per-frame present times: the gap between rows shows the
rate the screen really ran at (8.3 ms is 120 hz, 16.7 ms is 60 hz).

### Traces

- Perfetto: record with "frame timeline" and "sched" on (ui.perfetto.dev, or
  `adb shell perfetto`). Look at the app's `Actual Timeline` track for late
  frames and at the UI thread and `mqt_js` thread for what ran.
- Android Studio Profiler (CPU) for a method-level view of the JS engine and
  native work.
- iOS: Xcode, Product, Profile, "Animation Hitches" in Instruments. With
  ProMotion a frame budget is 8.3 ms.

### React Native and the app's own meter

- Dev menu, "Show Perf Monitor": UI and JS frames per second (dev builds).
- `lib/perfProbe.ts` counts React render time and JS-thread stalls for a few
  seconds and logs one line:

  ```bash
  adb shell am start -a android.intent.action.VIEW -d "hevier://statistics?perf=8"
  adb logcat -s ReactNativeJS | grep "\[perf\]"
  ```

  Scroll or swipe during those 8 seconds. Fields: `renders`, `renderMs`,
  `maxRenderMs`, `jsFrames`, `jsSlowFrames` (gaps over 50 ms), `jsLongestMs`.

## Comparing before and after

1. Build the commit before the change and the commit after, both release.
2. Same phone, same data (`scripts/load-device.sh` copies a history in; it needs a build made with `HEVIER_DEBUGGABLE=1`, see `plugins/withHevierRelease.js`), same
   battery and display settings, screen at the same brightness, app killed
   before each run.
3. Do the same gesture for the same time (for the swipe change: open Log
   Workout with 5 exercises and swipe set rows for 10 seconds), `reset` before,
   read after. Repeat 3 times and keep the median.
4. Compare: janky frames percentage, 95th and 99th percentile frame time,
   `jsSlowFrames`, and the refresh rate from `--latency`.

## Known, not verified

- No run on a real 90 or 120 hz Android phone or on an iPhone. The refresh
  rate request is checked only by the generated `MainActivity.kt` text and by a
  successful prebuild; the Kotlin was not compiled here (no Android SDK).
- The swipe-to-delete gesture feel (when it starts, how it settles, how it
  shares a touch with the page scroll and the text inputs in the row) was not
  tried on a device. Tune `SWIPE_TO_DELETE_SIZES` in `constants/sizes.ts` if
  it starts too late or too early.
- iOS does not fully run yet (issue #14): the prebuild output was checked, an
  iOS build was not.
