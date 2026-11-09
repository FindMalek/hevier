"""Synthesise the personal-record chime (assets/sounds/pr.wav).

Our own sound, made from sine waves, so there is nothing to license: a quick
rising E major arpeggio (E6 G#6 B6 E7), each note a soft bell (a few
harmonics, fast attack, exponential fade). Standard library only.

Usage: python3 scripts/design/make-pr-chime.py [out.wav]
"""
import math
import struct
import sys
import wave

RATE = 44100
NOTES = [1318.5, 1661.2, 1975.5, 2637.0]  # Hz
STEP = 0.075  # seconds between notes
LENGTH = 1.0  # seconds
PEAK = 0.45  # of full scale, leaves headroom and is not too loud

# (multiple of the note, loudness, how fast it fades)
HARMONICS = [(1.0, 1.0, 5.0), (2.0, 0.35, 9.0), (3.01, 0.12, 14.0)]

out = sys.argv[1] if len(sys.argv) > 1 else "assets/sounds/pr.wav"
samples = [0.0] * int(RATE * LENGTH)
for n, freq in enumerate(NOTES):
    start = int(n * STEP * RATE)
    # The last note rings a little longer.
    sustain = 0.7 if n == len(NOTES) - 1 else 1.0
    for i in range(start, len(samples)):
        t = (i - start) / RATE
        attack = min(1.0, t / 0.004)
        v = 0.0
        for mult, amp, decay in HARMONICS:
            v += amp * math.exp(-decay * sustain * t) * math.sin(2 * math.pi * freq * mult * t)
        samples[i] += attack * v

# Fade the tail to silence and normalise.
fade = int(0.15 * RATE)
for k in range(fade):
    samples[-fade + k] *= 1 - k / fade
top = max(abs(s) for s in samples)
frames = b"".join(struct.pack("<h", int(s / top * PEAK * 32767)) for s in samples)

with wave.open(out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(RATE)
    w.writeframes(frames)
print(out, f"{len(samples) / RATE:.2f}s")
