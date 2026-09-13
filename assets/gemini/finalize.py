from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
TARGET_W = 1080

def resize(im):
    w, h = im.size
    if w <= TARGET_W:
        return im
    new_h = round(h * TARGET_W / w)
    return im.resize((TARGET_W, new_h), Image.LANCZOS)

# 1) frame background: crop the small checkerboard sliver off the top, flatten to JPEG
bg = Image.open(root / "door-frame-bg.png.jpg").convert("RGB")
bg = bg.crop((0, 235, bg.width, bg.height))
bg = resize(bg)
bg.save(root / "door-frame-bg.jpg", "JPEG", quality=85, optimize=True)
print("door-frame-bg.jpg", bg.size)

# 2) closed-door hero scene (flat, opaque) -> JPEG
scene = Image.open(root / "door-scene.png.jpg").convert("RGB")
scene = resize(scene)
scene.save(root / "door-scene.jpg", "JPEG", quality=85, optimize=True)
print("door-scene.jpg", scene.size)

# 3) venue reveal (flat, opaque) -> JPEG
venue = Image.open(root / "venue-reveal.png.jpg").convert("RGB")
venue = resize(venue)
venue.save(root / "venue-reveal.jpg", "JPEG", quality=85, optimize=True)
print("venue-reveal.jpg", venue.size)

# 4) door leaves (transparent) -> WebP, keep alpha, resize proportionally
for name in ["door-left", "door-right"]:
    im = Image.open(root / f"{name}.png").convert("RGBA")
    im = resize(im)
    im.save(root / f"{name}.webp", "WEBP", quality=85, method=6)
    print(f"{name}.webp", im.size)

print("done")
