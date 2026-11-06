import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Sync over the USB cable (the phone's "Sync over USB cable" button): while
// this window is open, every phone plugged in with USB debugging on gets its
// port mapped to ours (adb reverse), so the app reaches this PC through the
// cable at 127.0.0.1, Wi-Fi or not. Without adb on this PC it does nothing.

const CHECK_MS = 3000;

// Serials of the real phones adb sees ready (not emulators, not "unauthorized").
export function parsePhones(devicesOutput: string): string[] {
  return devicesOutput
    .split('\n')
    .slice(1)
    .map((l) => l.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state === 'device' && !serial.startsWith('emulator-'))
    .map(([serial]) => serial);
}

function adbPath(): string {
  const sdk = process.env.ANDROID_HOME ?? path.join(os.homedir(), 'Android', 'Sdk');
  const inSdk = path.join(sdk, 'platform-tools', 'adb');
  return fs.existsSync(inSdk) ? inSdk : 'adb';
}

function run(adb: string, args: string[]): Promise<string | null> {
  return new Promise((resolve) => execFile(adb, args, (err, stdout) => resolve(err ? null : stdout)));
}

// Checked every few seconds against adb itself, not remembered: the link is
// dropped whenever the phone reconnects (unplugged, app reinstalled, phone
// restarted), and then made again.
export function watchUsb(port: number, onReady: (serial: string) => void): void {
  const adb = adbPath();
  const check = async () => {
    const out = await run(adb, ['devices']);
    if (out === null) return; // no adb here: cable sync just isn't offered
    for (const serial of parsePhones(out)) {
      const links = await run(adb, ['-s', serial, 'reverse', '--list']);
      if (links === null || links.includes(`tcp:${port} tcp:${port}`)) continue;
      if ((await run(adb, ['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`])) !== null) onReady(serial);
    }
  };
  check();
  setInterval(check, CHECK_MS).unref();
}
