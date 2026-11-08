# Performance

How to measure Hevier's smoothness on a phone, what was found on a real 120 hz
phone, and what was changed. Numbers marked "laptop" were measured with vitest
on a development machine.

## What was changed (issue #28)

| Change | Where | Why |
|---|---|---|
| Last 7 days strip skips old sets | `lib/stats/stats.ts` (`lastSevenDays`) | It built a `Date` for every set ever logged. Now it compares milliseconds first. |

## What a real 120 hz phone showed

The owner tested the first version of this change on a Galaxy S23 FE (release
build). It asked Android for the display's fastest refresh rate (a config plugin
that set the window's `preferredRefreshRate`), moved the set-row swipe to a
reanimated worklet, and set the iOS ProMotion key. Findings:

- **Refresh rate.** With the phone on Adaptive motion smoothness, Samsung already
  runs Hevier at 120 hz while scrolling and drops to 60 hz when the screen is
  idle, without any request from the app. With the plugin the app stayed at
  120 hz while idle, which costs battery for nothing. On Standard the plugin does
  nothing. So the request was dropped: an app cannot do better than the phone's
  own setting here, and Adaptive already gives 120 hz where it matters.
- **Swipe to delete.** A swipe that starts on the KG or REPS box did not move the
  row, and neither did swiping an open row closed from the boxes. The boxes cover
  almost half of the row, so most swipes in a workout failed. The old
  `PanResponder` handles both. The worklet version was removed.
- **iOS keys.** The bundle id and `CADisableMinimumFrameDurationOnPhone` do
  nothing until the iOS build works (#14), so they belong with that work.

A second try at moving the swipe to the UI thread needs a gesture that can start
on top of the text inputs (not just a pan on the row), and a test on a real
phone before it is merged.

### What is not covered

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
3. Do the same gesture for the same time (for example: open Log
   Workout with 5 exercises and swipe set rows for 10 seconds), `reset` before,
   read after. Repeat 3 times and keep the median.
4. Compare: janky frames percentage, 95th and 99th percentile frame time,
   `jsSlowFrames`, and the refresh rate from `--latency`.

## Known, not verified

- The laptop numbers are for `lastSevenDays` only. No frame times were measured
  for this change.
- The swipe gesture is the old `PanResponder` again, so it behaves as before.
  `ReorderList` and the set rows still do their drag work on the JS thread.
- iOS does not fully run yet (issue #14): nothing here was checked on an iPhone.
