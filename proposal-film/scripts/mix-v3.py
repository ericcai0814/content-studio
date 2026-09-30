#!/usr/bin/env python3
# Sound for the 38 s cut: the licensed music plus the licensed sound effects, from data/cues-v3.json.
#
#   .venv/bin/python scripts/mix-v3.py [--out out/v3-mix.wav]
#
# 1. Music: `music.file` from `music.trackStart` for the film's duration, with its fade in and out.
# 2. Each sfx cue: `file` placed so that its own peak (`peak` s into the file) lands on the music's
#    measured peak `hit`; its level is set so that its RMS over 50 ms around that peak sits `gainDb`
#    below (negative) the music's RMS over 300 ms around `hit`. So every effect is under the music by
#    construction, and the script prints the level it actually got.
# 3. Loudness: two-pass ffmpeg loudnorm of the sum to -14 LUFS integrated, -1 dBTP (one linear gain,
#    as audio/sfx.sh does for the 105 s film).
import argparse
import json
import pathlib
import subprocess
import tempfile

import librosa
import numpy as np
import soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
LUFS, TP = -14, -1


def load(path, offset=0.0, duration=None):
    y, _ = librosa.load(ROOT / path, sr=SR, mono=False, offset=offset, duration=duration)
    return np.atleast_2d(y) if y.ndim == 2 else np.vstack([y, y])


def rms(x, c, half):
    a, b = max(0, int((c - half) * SR)), int((c + half) * SR)
    seg = x[:, a:b]
    return float(np.sqrt(np.mean(seg ** 2))) if seg.size else 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='out/v3-mix.wav')
    args = ap.parse_args()
    d = json.loads((ROOT / 'data/cues-v3.json').read_text())
    m, dur = d['music'], d['duration']
    n = int(round(dur * SR))

    music = load(m['file'], m['trackStart'], dur)[:, :n]
    music = np.pad(music, ((0, 0), (0, n - music.shape[1])))
    t = np.arange(n) / SR
    env = np.clip(t / m['fadeIn'], 0, 1) * np.clip(1 - (t - m['fadeOutStart']) / m['fadeOut'], 0, 1)
    music *= env

    mix = music.copy()
    print('sfx: film time of its peak, level vs music (target)')
    for s in d['sfx']:
        fx = load(s['file'])
        g_target = 10 ** (s['gainDb'] / 20)
        mus = rms(music, s['hit'], 0.15)
        own = rms(fx, s['peak'], 0.025)
        gain = g_target * mus / own if own > 0 else 0.0
        start = int(round((s['hit'] - s['peak']) * SR))
        a, b = max(0, start), min(n, start + fx.shape[1])
        mix[:, a:b] += gain * fx[:, a - start:b - start]
        got = 20 * np.log10(rms(gain * fx, s['peak'], 0.025) / mus)
        print(f"  {s['kind']:<12} {s['hit']:7.3f}s  {got:+6.1f} dB  ({s['gainDb']:+d} dB)  {s.get('note', '')}")

    out = ROOT / args.out
    out.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        dry = pathlib.Path(tmp) / 'dry.wav'
        sf.write(dry, mix.T, SR, subtype='FLOAT')
        ln = f'loudnorm=I={LUFS}:TP={TP}:LRA=11'
        r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', dry, '-af', ln + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
        js = r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1]
        v = json.loads(js)
        af = (f"{ln}:measured_I={v['input_i']}:measured_TP={v['input_tp']}:measured_LRA={v['input_lra']}"
              f":measured_thresh={v['input_thresh']}:offset={v['target_offset']}:linear=true,aresample={SR}")
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', dry, '-af', af, '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    summary = r.stderr[r.stderr.rindex('Summary:'):]
    lufs = [l.strip() for l in summary.splitlines() if l.strip().startswith(('I:', 'Peak:'))]
    print(f"wrote {out.relative_to(ROOT)}  {dur:.2f}s  " + '  '.join(lufs))


if __name__ == '__main__':
    main()
