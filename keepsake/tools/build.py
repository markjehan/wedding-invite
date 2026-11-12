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
seal, sc, date, venue, agenda, closing = en['seal'], en['scroll'], en['date'], en['venue'], en['agenda'], en['closing']
# (piece, dissolve into it in seconds; 0 = a straight continuation)
pieces = [
    (seg('mk', 'mk', 0, count('mk') / FPS), 0),
    (seg('e1', 'en', seal - 1.0, seal + 5.2), .6),                 # the seal, the doors, walking in
    (seg('e2', 'en', seal + 5.2, sc - .2, 2.0), 0),                # the monogram and their names, written
    (seg('e3', 'en', sc + .6, sc + 11.5, 2.0), .4),                # the quotation and their portrait, drawn
    (seg('e4', 'en', sc + 11.9, sc + 15.3, 1.4), .4),              # the letter
    (seg('e5', 'en', sc + 17.3, sc + 22.4, 1.5), .4),              # the photographs
    (seg('e6', 'en', date + 2.3, date + 8.0, 1.5), .4),            # the gold foil, scratched
    (seg('e7', 'en', venue + 1.6, venue + 8.6, 1.8), .4),          # the venue, drawn
    (seg('e8', 'en', agenda + 2.6, agenda + 6.9, 1.4), .4),        # the programme
    (seg('e9', 'en', closing + .8, en['end'] - .1, 1.5), .4),      # the closing
    (seg('s1', 'si', si['seal'] + 8.6, si['scroll'] - .3, 2.5, tag=True), .5),   # Sinhala: the names
    (seg('s2', 'si', si['scroll'] + 11.9, si['scroll'] + 15.3, 1.6, tag=True), .4),  # Sinhala: the letter
    (seg('cl', 'cl', 0, count('cl') / FPS), .6),
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
fc.append(f'[{last}]fade=t=in:d=0.6,fade=t=out:st={total - 1.4:.3f}:d=1.4,format=yuv420p[vout]')
k = len(pieces); cmd += ['-i', music]
fc.append(f'[{k}:a]atrim=0:{total:.3f},volume=10dB,alimiter=limit=0.9,afade=t=in:d=1,afade=t=out:st={total - 3:.3f}:d=3[aout]')
cmd += ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-r', str(FPS),
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-metadata', 'title=Naveen & Dulanjani: how your wedding invitation came to life', out]
run(cmd)
print('total', round(total, 2), 'seconds')
