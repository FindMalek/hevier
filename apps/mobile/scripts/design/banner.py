# Draws the README banner (docs/images/banner.png) at 2x and saves it at 1x.
#   python3 scripts/design/banner.py
# Needs Pillow and the app's fonts (npm install).
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')  # apps/mobile
REPO = os.path.join(ROOT, '..', '..')
F = os.path.join(ROOT, 'node_modules/@expo-google-fonts/figtree/')
def font(w, size): return ImageFont.truetype(f'{F}{w}/Figtree_{w}.ttf', size)
K = 2
W, H = 1320 * K, 380 * K
BLUE = (0, 140, 255)
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))

# Card: vertical gradient #141416 -> #0A0A0B, rounded, thin border.
grad = Image.new('RGBA', (W, H))
gd = ImageDraw.Draw(grad)
for y in range(H):
    t = y / H
    c = tuple(int(a + (b - a) * t) for a, b in zip((22, 22, 25), (10, 10, 11)))
    gd.line([(0, y), (W, y)], fill=c + (255,))
mask = Image.new('L', (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], radius=36 * K, fill=255)
img.paste(grad, (0, 0), mask)

# Soft blue glow behind the logo.
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([60 * K, 40 * K, 460 * K, 340 * K], fill=BLUE + (70,))
glow = glow.filter(ImageFilter.GaussianBlur(70 * K))
img = Image.alpha_composite(img, Image.composite(glow, Image.new('RGBA', (W, H)), mask))

d = ImageDraw.Draw(img)
d.rounded_rectangle([1, 1, W - 2, H - 2], radius=36 * K, outline=(44, 44, 46, 255), width=3 * K)

# Logo mark: the white dumbbell from icon.png, recoloured blue.
icon = Image.open(os.path.join(ROOT, 'assets/images/icon.png')).convert('L')
markA = icon.crop((225, 265, 800, 565))  # the mark, without the word
mw = 340 * K
mh = int(markA.height * mw / markA.width)
markA = markA.resize((mw, mh), Image.LANCZOS)
mark = Image.new('RGBA', (mw, mh), (240, 242, 245, 255))
mark.putalpha(markA)
img.alpha_composite(mark, (80 * K, (H - mh) // 2))

# Text.
x = 480 * K
d.text((x, 62 * K), 'Hevier', font=font('800ExtraBold', 128 * K), fill=(240, 242, 245))
d.text((x, 214 * K), 'Workout tracker for Android', font=font('700Bold', 40 * K), fill=(142, 150, 166))
d.text((x, 278 * K), 'no paywall · no account · recovery map · cardio-aware · PC backup',
       font=font('500Medium', 27 * K), fill=(104, 110, 124))

img.resize((W // K, H // K), Image.LANCZOS).save(os.path.join(REPO, 'docs/images/banner.png'), optimize=True)
