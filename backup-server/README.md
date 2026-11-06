# Hevier Sync (backup server)

A small program for your PC that keeps one copy of the Hevier app's data: the
workout database, the photos and videos added to workouts, and the profile
photo. The phone sends it from Profile → Settings → Sync with PC, and can get it
back from there (Restore) after a reset or on a new phone.

## Run it

Node.js 22 or newer (as the app). This folder is its own package, so install it once:

```bash
cd backup-server
npm install
npm start
```

The window shows a QR code. On the phone, scan it from Sync with PC to pair;
after that, "Sync now" sends a copy whenever this window is open. Close the
window when you're done.

The phone and the PC must be on the same Wi-Fi, or use the USB cable: with
[adb](https://developer.android.com/tools/adb) installed and USB debugging on,
a phone plugged in can use "Sync over USB cable" (the window maps the phone's
port to the PC's with `adb reverse`), Wi-Fi or not.

`npm test` runs its tests. The messages the phone and the PC send each other are
in `../shared/` (both sides import them).

## Settings

All optional, as environment variables:

| Variable | Default | What |
|---|---|---|
| `HEVIER_BACKUP_DIR` | `~/HevierBackup` | where the copy is kept |
| `PORT` | `4873` | the port it listens on |
| `ANDROID_HOME` | `~/Android/Sdk` | where to find `adb` for the USB cable (else `adb` on the PATH) |

## What it keeps

In `HEVIER_BACKUP_DIR`:

- `key.txt`: a random secret made on the first run (readable by you only).
  It's in the QR code; the phone sends it with every request.
- `current/`: the one copy (`hevier.db`, `media/`, `profile/`, `manifest.json`).
- `incoming/`: a copy being received. It replaces `current/` only once every
  file has arrived, so a sync cut short leaves the old copy whole. Files the PC
  already has (same name and size) aren't sent again.

There is one copy, not a history: copy the folder elsewhere if you want more.

## Safety

- **Who can talk to it:** only a phone that sends the key from `key.txt`;
  anything else gets "wrong key". Delete `key.txt` to make a new one (the phone
  then has to pair again).
- **Which files:** only `hevier.db` and files straight inside `media/` or
  `profile/` can be written or read, so no request can reach outside the copy.
- **No accidental overwrite:** a copy from another phone, or one with fewer
  workouts than the copy on the PC (a wiped phone), is refused unless you
  confirm it on the phone.
- **Not encrypted:** it is plain HTTP on your local network. Anyone on the same
  Wi-Fi who can watch the traffic could read the key and the data. Use it on a
  network you trust, or over the USB cable.
