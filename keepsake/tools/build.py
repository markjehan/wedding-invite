# Joins the keepsake film: the title and desk story, a 30-second showing of the English invitation
# cut from the full filmed walk-through, a glimpse of the Sinhala one, then the ending and the card,
# with the invitation's own music underneath.
import json, os, subprocess, sys
FPS = 30
S = os.path.dirname(os.path.abspath(__file__))
out, music = sys.argv[1], sys.argv[2]
tmp = os.path.join(S, 'segs'); os.makedirs(tmp, exist_ok=True)
run = lambda cmd: subprocess.run(cmd, check=True)
count = lambda d: len([f for f in os.listdir(os.path.join(S, d)) if f.startswith('f') and f.endswith('.jpg')])
def length(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip())

def seg(name, d, start, end, speed=1.0, tag=False):
    """A stretch of filmed frames, from `start` to `end` seconds, played at `speed`."""
    path = os.path.join(tmp, name + '.mp4')
    first = max(0, round(start * FPS)); n = min(count(d) - first, round((end - start) * FPS))
    cmd = ['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-start_number', str(first), '-i', os.path.join(S, d, 'f%05d.jpg')]
    vf = f'setpts=PTS/{speed},fps={FPS},scale=in_range=pc:out_range=tv,format=yuv420p'
    if tag:
        cmd += ['-loop', '1', '-i', os.path.join(S, 'tag.png')]
        cmd += ['-filter_complex', f'[0:v]trim=end_frame={n},{vf}[v];[1:v]format=rgba,fade=t=in:st=0.15:d=0.5:alpha=1[t];[v][t]overlay=shortest=1[o]', '-map', '[o]']
    else:
        cmd += ['-frames:v', str(n), '-vf', vf] if speed == 1 else ['-filter_complex', f'[0:v]trim=end_frame={n},{vf}[o]', '-map', '[o]']
    run(cmd + ['-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-r', str(FPS), path])
    return path

en = json.load(open(os.path.join(S, 'en', 'marks.json'))); si = json.load(open(os.path.join(S, 'si', 'marks.json')))
# (piece, dissolve into it in seconds; 0 = a straight continuation)
pieces = [
    (seg('mk', 'mk', 0, count('mk') / FPS), 0),
    # the English invitation: one unbroken take; scrolls at true speed, still moments faster
    *[(seg(f'e{i}', 'en', f0 / FPS, f1 / FPS, 4 if sp == 3 else sp), .6 if i == 0 else 0) for i, (f0, f1, sp) in enumerate(en['segs'])],
    (seg('s1', 'si', si['scroll'] - 8.5, si['scroll'] - .2, 2.5, tag=True), .6),   # Sinhala: the names
    (seg('cl', 'cl', 0, count('cl') / FPS - 2.2), .6),
]
cmd = ['ffmpeg', '-y', '-v', 'error']; fc = []
for p, _ in pieces: cmd += ['-i', p]
for i in range(len(pieces)): fc.append(f'[{i}:v]fps={FPS},settb=AVTB,setpts=PTS-STARTPTS[n{i}]')
last = 'n0'; acc = length(pieces[0][0])
for i in range(1, len(pieces)):
    p, x = pieces[i]; d = length(p)
    if x: fc.append(f'[{last}][n{i}]xfade=transition=fade:duration={x}:offset={acc - x:.4f}[x{i}]'); acc += d - x
    else: fc.append(f'[{last}][n{i}]concat=n=2:v=1:a=0,fps={FPS},settb=AVTB[x{i}]'); acc += d
    last = f'x{i}'
total = acc
fc.append(f'[{last}]fade=t=in:d=0.6,fade=t=out:st={total - 2:.3f}:d=2,format=yuv420p[vout]')
k = len(pieces); cmd += ['-i', music, '-stream_loop', '-1', '-ss', '60', '-t', '38.4', '-i', music]
fc.append(f'[{k}:a]atrim=0:98.4,asetpts=PTS-STARTPTS[a0];[{k + 1}:a]atrim=0:{max(1, total - 98.4 + 1):.2f},asetpts=PTS-STARTPTS[a1];[a0][a1]concat=n=2:v=0:a=1,atrim=0:{total:.3f},volume=10dB,alimiter=limit=0.9,afade=t=in:d=1,afade=t=out:st={total - 3.5:.3f}:d=3.5[aout]')
cmd += ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-r', str(FPS),
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-metadata', 'title=Naveen & Dulanjani: how your wedding invitation came to life', out]
run(cmd)
print('total', round(total, 2), 'seconds')
