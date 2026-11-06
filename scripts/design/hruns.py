#!/usr/bin/env python3
"""Horizontal colour runs along rows: left/right edges and gaps.

    python3 scripts/design/hruns.py SCREEN.png Y [Y ...]
"""
import sys
from PIL import Image
K=2.625
im=Image.open(sys.argv[1]).convert('RGB'); px=im.load(); W,H=im.size
def cls(c):
  if all(abs(a-b)<=6 for a,b in zip(c,(28,28,30))): return 'surface'
  if sum(c)<25: return 'black'
  if c[2]>200 and c[0]<60: return 'blue'
  if sum(c)>600: return 'white'
  return 'other'
for y in map(int,sys.argv[2:]):
  out=[];cur=None;start=0
  for x in range(W+1):
    k=cls(px[x,y]) if x<W else None
    if k!=cur:
      if cur is not None and x-start>=3: out.append(f'{cur}[{start}-{x-1}]')
      cur=k;start=x
  print(f'y={y}:',' '.join(out))
