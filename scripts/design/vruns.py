#!/usr/bin/env python3
"""Vertical colour runs down one column: where cards/buttons start and end.

    python3 scripts/design/vruns.py SCREEN.png X Y0 Y1

Prints each run of background/surface/blue/white with its pixel range and dp
(2.625 px per dp on the reference phone)."""
import sys
from PIL import Image
K=2.625
im=Image.open(sys.argv[1]).convert('RGB'); px=im.load(); W,H=im.size
x=int(sys.argv[2]); y0=int(sys.argv[3]); y1=int(sys.argv[4])
def cls(c):
  if all(abs(a-b)<=6 for a,b in zip(c,(28,28,30))): return 'surface'
  if sum(c)<25: return 'black'
  if c[2]>200 and c[0]<60: return 'blue'
  if sum(c)>600: return 'white'
  return 'other'
cur=None;start=y0
for y in range(y0,y1):
  k=cls(px[x,y])
  if k!=cur:
    if cur is not None and y-start>=2: print(f'{cur:8s} y {start}-{y-1}  ({y-start}px = {(y-start)/K:.1f}dp)  start {start/K:.1f}dp')
    cur=k;start=y
print(f'{cur:8s} y {start}-{y1-1}  ({y1-start}px)')
