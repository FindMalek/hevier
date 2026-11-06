#!/usr/bin/env python3
"""Side-by-side + overlay comparison of a Hevy reference screenshot and a
Hevier emulator screenshot, for matching Hevy's design pixel by pixel.

    python3 scripts/design/compare-screens.py HEVY.jpg HEVIER.png OUT.png \
        --region top:0:330 --region bottom:260 [--top-shift 46]

Regions:
  top:Y0:Y1     rows Y0..Y1 measured from the top of the Hevy screenshot; the
                Hevier crop is shifted by --top-shift (status bar height
                difference: phone 109px, emulator 63px -> 46).
  bottom:H      the last H rows of both screenshots (tab bar), aligned at the
                bottom edge.

Each output row is: Hevy | Hevier | overlay (Hevy red, Hevier cyan, match white).
"""
import argparse
from PIL import Image, ImageChops, ImageDraw, ImageFont


def crops(hevy, ours, spec, shift):
    kind, *nums = spec.split(':')
    if kind == 'top':
        y0, y1 = map(int, nums)
        return hevy.crop((0, y0, hevy.width, y1)), ours.crop((0, y0 - shift, ours.width, y1 - shift))
    if kind == 'bottom':
        (h,) = map(int, nums)
        return hevy.crop((0, hevy.height - h, hevy.width, hevy.height)), ours.crop((0, ours.height - h, ours.width, ours.height))
    raise SystemExit(f'bad region {spec}')


def overlay(a, b):
    la, lb = a.convert('L'), b.convert('L')
    return Image.merge('RGB', (la, lb, lb))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('hevy')
    p.add_argument('hevier')
    p.add_argument('out')
    p.add_argument('--region', action='append', required=True)
    p.add_argument('--top-shift', type=int, default=46)
    args = p.parse_args()

    hevy = Image.open(args.hevy).convert('RGB')
    ours = Image.open(args.hevier).convert('RGB')
    rows = [crops(hevy, ours, r, args.top_shift) for r in args.region]

    gap, label_h = 12, 30
    width = hevy.width * 3 + gap * 2
    height = sum(a.height + label_h + gap for a, _ in rows)
    out = Image.new('RGB', (width, height), (60, 0, 60))
    draw = ImageDraw.Draw(out)
    font = ImageFont.load_default(size=24)
    y = 0
    for a, b in rows:
        for i, (img, name) in enumerate([(a, 'HEVY'), (b, 'HEVIER'), (overlay(a, b), 'OVERLAY  red=Hevy  cyan=Hevier  white=match')]):
            x = i * (hevy.width + gap)
            draw.text((x + 8, y + 3), name, fill='yellow', font=font)
            out.paste(img, (x, y + label_h))
        y += a.height + label_h + gap
    out.save(args.out)
    diff = [ImageChops.difference(a.convert('L'), b.convert('L')).point(lambda v: 255 if v > 60 else 0) for a, b in rows]
    for spec, d in zip(args.region, diff):
        print(f'{spec}: {d.histogram()[255] / (d.width * d.height):.2%} of pixels differ')


if __name__ == '__main__':
    main()
