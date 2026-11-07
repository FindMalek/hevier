"""Black out the exercise-thumbnail column of an emulator screenshot.

The openGym stills are licensed with a notice that forbids feeding them to AI,
so every screenshot Claude reads goes through this first. It paints the whole
x 40-170 column (where ExerciseThumb renders) below the status bar, on every
screen, dimmed or not, rather than trying to detect the pictures, plus the
PR toast's picture (x 40-250 down to y 520).

With --above Y (px) only the part above Y is painted: use it when a sheet
covers the screen from Y down, so nothing below Y can be a thumbnail.

--box x0,y0,x1,y1 (px, repeatable) paints extra areas, e.g. the exercise
page's clip (app/exercises/[id].tsx), which spans the full width.

Usage: python3 scripts/design/mask-thumbs.py in.png [out.png] [--above Y] [--box x0,y0,x1,y1 ...]
"""
import sys

from PIL import Image, ImageDraw

args = sys.argv[1:]
above = None
if "--above" in args:
    i = args.index("--above")
    above = int(args[i + 1])
    del args[i : i + 2]
boxes = []
while "--box" in args:
    i = args.index("--box")
    boxes.append([int(v) for v in args[i + 1].split(",")])
    del args[i : i + 2]
src = args[0]
dst = args[1] if len(args) > 1 else src
img = Image.open(src).convert("RGB")
bottom = img.height if above is None else min(img.height, above)
draw = ImageDraw.Draw(img)
draw.rectangle([40, 100, 170, bottom], fill=(255, 0, 255))
# The PR toast's picture sits further right, near the top (components/workout/PrToast.tsx).
draw.rectangle([40, 100, 250, min(bottom, 520)], fill=(255, 0, 255))
for box in boxes:
    draw.rectangle(box, fill=(255, 0, 255))
img.save(dst)
