import type { ProfilerOnRenderCallback } from 'react';
import * as Linking from 'expo-linking';

// A smoothness meter for performance checks. Off unless a link
// carries ?perf=<seconds> (e.g. hevier://statistics?perf=8): then, for that
// long, it counts how much time React spends redrawing (the <Profiler> in
// app/_layout.tsx) and how often the JS thread is stuck (gaps between frames),
// and logs one "[perf]" line to logcat.

let until = 0;
let label = '';
let renders = 0;
let renderMs = 0;
let maxRenderMs = 0; // the biggest single redraw
let frames = 0;
let slowFrames = 0; // more than 2 frames late (> 50 ms)
let longest = 0;
let last = 0;

function tick(time: number) {
  if (last) {
    const gap = time - last;
    if (gap > 50) slowFrames++;
    longest = Math.max(longest, gap);
  }
  last = time;
  frames++;
  if (Date.now() < until) requestAnimationFrame(tick);
  else report();
}

function report() {
  console.log(
    `[perf] ${label} renders=${renders} renderMs=${Math.round(renderMs)} maxRenderMs=${Math.round(maxRenderMs)} jsFrames=${frames} ` +
      `jsSlowFrames=${slowFrames} jsLongestMs=${Math.round(longest)}`
  );
}

function start(url: string | null) {
  const match = url?.match(/[?&]perf=(\d+)/);
  if (!match) return;
  label = url!.replace(/^[a-z]+:\/\//, '').replace(/[?&]perf=\d+/, '') || 'home';
  renders = renderMs = maxRenderMs = frames = slowFrames = longest = last = 0;
  until = Date.now() + Number(match[1]) * 1000;
  requestAnimationFrame(tick);
}

export const onPerfRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
  if (Date.now() >= until) return;
  renders++;
  renderMs += actualDuration;
  maxRenderMs = Math.max(maxRenderMs, actualDuration);
};

Linking.getInitialURL().then(start);
Linking.addEventListener('url', ({ url }) => start(url));
