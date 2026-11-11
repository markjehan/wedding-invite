# Joins the filmed pieces into the keepsake film and lays the invitation's own music under it.
import json, subprocess, sys, os
FPS = 30; BEAT = 0.6; BAR = 2.4
S = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]
def n(d): return len([f for f in os.listdir(os.path.join(S, d)) if f.startswith('f') and f.endswith('.jpg')])
XF = 0.6  # every join is a one-beat dissolve
# Each walk-through is trimmed at its start so that its seal press lands on a bar of the music.
parts = [['mk', 0, n('mk') / FPS]]
t = parts[0][2] - XF
plan = []
for d, nxt in (('en', 'sc'), ('si', 'cl')):
    m = json.load(open(os.path.join(S, d, 'marks.json')))
    press = m['seal'] - 8 / FPS          # the frame the seal is actually pressed
    target = -(-(t + press) // BAR) * BAR  # the next bar line
    wait = target - (t + press); start = 0   # the scene before is held until then
    parts[-1][2] += wait; t += wait
    dur = n(d) / FPS - start
    parts.append([d, start, dur]); t += dur - XF
    parts.append([nxt, 0, n(nxt) / FPS]); t += parts[-1][2] - XF
total = t + XF
print('parts', parts, 'total', round(total, 2))
cmd = ['ffmpeg', '-y', '-v', 'error']
for d, start, dur in parts:
    have = n(d) / FPS
    cmd += ['-framerate', str(FPS), '-start_number', str(round(start * FPS)), '-i', os.path.join(S, d, 'f%05d.jpg')]
fc = []; 
for i, (d, start, dur) in enumerate(parts):
    have = n(d) / FPS - start
    pad = max(0, dur - have)
    fc.append(f'[{i}:v]tpad=stop_mode=clone:stop_duration={pad + 0.2:.3f},trim=duration={dur:.4f},setpts=PTS-STARTPTS,scale=in_range=pc:out_range=tv,format=yuv420p,settb=AVTB,fps={FPS}[v{i}]')
last = 'v0'; acc = parts[0][2]
for i in range(1, len(parts)):
    fc.append(f'[{last}][v{i}]xfade=transition=fade:duration={XF}:offset={acc - XF:.4f}[x{i}]')
    last = f'x{i}'; acc += parts[i][2] - XF
fc.append(f'[{last}]fade=t=in:d=0.8,fade=t=out:st={total - 1.6:.3f}:d=1.6[vout]')
# Music: the recording from its start, then round and round its sixteen-bar loop (60 s to 98.4 s).
music = os.path.join(S, '..', 'music.mp3') if False else sys.argv[2]
k = len(parts)
cmd += ['-i', music, '-stream_loop', '-1', '-ss', '60', '-t', '38.4', '-i', music]
loops = int(max(0, total - 98.4) // 38.4) + 1
fc.append(f'[{k}:a]atrim=0:98.4,asetpts=PTS-STARTPTS[a0]')
fc.append(f'[{k+1}:a]atrim=0:{loops * 38.4:.2f},asetpts=PTS-STARTPTS[a1]')
fc.append(f'[a0][a1]concat=n=2:v=0:a=1,atrim=0:{total:.3f},volume=10dB,alimiter=limit=0.9,afade=t=in:d=1.2,afade=t=out:st={total - 3.2:.3f}:d=3.2[aout]')
cmd += ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-r', str(FPS),
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-metadata', 'title=Naveen & Dulanjani — the making of your wedding invitation', out]
subprocess.run(cmd, check=True)
