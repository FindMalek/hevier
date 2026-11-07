import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// What a personal record feels like: the toast (PrToast), a short "success"
// buzz and our chime (assets/sounds/pr.wav, made by scripts/design/make-pr-chime.py).
// Music already playing is lowered for the chime, not stopped.

let player: AudioPlayer | null = null;

function chime(): AudioPlayer {
  if (!player) {
    setAudioModeAsync({ interruptionMode: 'duckOthers', playsInSilentMode: false }).catch(() => {});
    player = createAudioPlayer(require('@/assets/sounds/pr.wav'));
  }
  return player;
}

export function celebratePr() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  playChime().catch((e) => console.warn('[pr] chime failed', e));
}

// The Clock sheet's timer reaching zero (lib/clock.ts): the same chime,
// with a stronger buzz so it's felt with the phone in a pocket.
export function alertTimerDone() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  playChime().catch((e) => console.warn('[clock] chime failed', e));
}

async function playChime() {
  const p = chime();
  // After the first time the player sits at the end: rewind first, and wait
  // for it, or play() is ignored and later records are silent.
  await p.seekTo(0);
  p.play();
}
