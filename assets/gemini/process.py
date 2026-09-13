"""Turn the Gemini exports into proper web-ready, transparent assets."""
from pathlib import Path
from rembg import remove, new_session
from PIL import Image

root = Path(__file__).resolve().parent
session = new_session("isnet-general-use")


def cutout(src_name, dst_name):
    src = root / src_name
    img = Image.open(src).convert("RGB")
    out = remove(img, session=session)
    out.save(root / dst_name)
    print(f"{dst_name}: {out.size}, mode={out.mode}")
    return out


# 1) Full door + frame -> clean cutout, then split into two leaves
full = cutout("door-full-transparent.png.jpg", "door-full-cut.png")

w, h = full.size
mid = w // 2
left = full.crop((0, 0, mid, h))
right = full.crop((mid, 0, w, h))
left.save(root / "door-left.png")
right.save(root / "door-right.png")
print("door-left.png:", left.size)
print("door-right.png:", right.size)

# 2) Frame/foliage backdrop -> clean cutout (removes the checkerboard strip)
cutout("door-frame-bg.png.jpg", "door-frame-bg-cut.png")

print("done")
