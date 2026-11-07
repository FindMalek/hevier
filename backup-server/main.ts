import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import QRCode from 'qrcode';
import { pairLink, pickLanAddress } from './address';
import { DEFAULT_PORT } from '../shared/sync-protocol';
import type { Manifest } from '../shared/sync-types';
import { createServer, type SyncEvent } from './server';
import { createStore } from './store';
import { watchUsb } from './usb';

// The Hevier Sync window: open it, sync from the phone, close it.

const dir = process.env.HEVIER_BACKUP_DIR ?? path.join(os.homedir(), 'HevierBackup');
const port = Number(process.env.PORT ?? DEFAULT_PORT);

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '');
const describe = (m: Manifest) => `${when(m.date)}, ${m.workouts} workouts`;
const time = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function quitAfterEnter(message: string): void {
  console.log(`\n${message}\n\nPress Enter to close.`);
  readline.createInterface({ input: process.stdin }).once('line', () => process.exit(1));
}

function line(e: SyncEvent): string {
  switch (e.type) {
    case 'received':
      return `Backup received: ${describe(e.manifest)}`;
    case 'refused':
      if (e.reason === 'fewer') return `Refused: fewer workouts (${e.phoneWorkouts} vs ${e.pcWorkouts})`;
      if (e.reason === 'older') return 'Refused: older data than the copy here';
      return 'Refused: another phone';
    case 'restore':
      return 'Restore sent to phone';
  }
}

async function main() {
  process.stdout.write('\x1b]0;Hevier Sync\x07'); // the window's title
  // No network: the USB cable still works, there's just no QR to pair with.
  const host = pickLanAddress(os.networkInterfaces());

  const store = createStore(dir);
  const server = createServer(store, (e) => console.log(`${time()}  ${line(e)}`));
  server.once('error', (err: NodeJS.ErrnoException) =>
    quitAfterEnter(err.code === 'EADDRINUSE' ? 'Hevier Sync is already open.' : `Could not start: ${err.message}`)
  );
  server.listen(port, async () => {
    // Fits a new terminal window (24 lines) with the QR whole.
    if (host) process.stdout.write(await QRCode.toString(pairLink(host, port, store.key()), { type: 'terminal', small: true }));
    const held = store.current();
    console.log(`PC ${host ?? 'no network (USB cable only)'}  ·  ${held ? `Copy: ${describe(held)}` : 'No backup yet'}`);
    console.log('Waiting for phone…');
    watchUsb(port, (serial) => console.log(`${time()}  Phone on USB cable (${serial}): Sync over USB cable is ready`));
  });
}

main();
