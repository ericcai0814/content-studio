#!/usr/bin/env python3
# Beat analysis for the v3 (40 s) cut: tempo, beat grid, per-bar energy and drop for each candidate
# track, plus the peak offset of every v3 sound effect.
#
#   .venv/bin/python scripts/analyze-music.py
#
# Writes data/music-analysis.json and one energy plot per track in out/music-energy-<id>.png.
# Needs librosa + matplotlib (uv venv .venv && uv pip install -p .venv librosa matplotlib).
#
# Method
#   tempo      one fixed period and phase fitted to the whole onset envelope (fit_grid). How well it
#              fits is reported inside the film window: the median offset of each beat's strongest onset
#              from its grid point, and how many beats have that onset within 30 ms.
#              If the kick (< 150 Hz flux) is stronger half a beat later, the fit sat on the off-beat
#              and the grid is shifted by half a beat.
#   drop       the beat with the largest rise of mean energy (full band + < 150 Hz, in dB) from the 16
#              beats before it to the 16 after, restricted to drops that leave room for a 20-bar window
#              with the drop in bar 6 (5 bars before it, about 10 s at 120 BPM).
#   downbeat   a four-on-the-floor kick is equally strong on every beat, so the kick cannot tell beat 1;
#              sections change on a downbeat, so the drop beat fixes the bar phase.
#   bar energy mean STFT magnitude per bar in dB relative to the loudest bar (full band and < 150 Hz).
#   window     the 20 bars used by the film: they start 5 bars before the drop, so film time 0 is a
#              downbeat and the drop lands on the downbeat of bar 6.
#   peaks      the strongest onset within a quarter beat of each beat in the window (film time), for
#              placing sound effects on what the music actually hits.
import json
import pathlib
import warnings

import librosa
import numpy as np

warnings.filterwarnings('ignore')
import matplotlib  # noqa: E402

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 22050
BARS = 20
PRE_DROP_BARS = 5

TRACKS = [
    {'id': 'mixkit-634', 'title': 'Your Breath', 'artist': 'Eugenio Mininni', 'file': 'audio/music/mixkit-634-your-breath.mp3'},
    {'id': 'mixkit-623', 'title': 'Deep Urban', 'artist': 'Eugenio Mininni', 'file': 'audio/music/mixkit-623-deep-urban.mp3'},
    {'id': 'mixkit-720', 'title': 'New Bass 01', 'artist': 'Lily J', 'file': 'audio/music/mixkit-720-new-bass-01.mp3'},
]
# Eric's pick (2026-10-01); docs/STORYBOARD-v3.md and data/cues-v3.json are timed on this track
SELECTED = 'mixkit-720'
SFX = ['mixkit-1489', 'mixkit-1530', 'mixkit-1125', 'mixkit-3109', 'mixkit-166']


def r(x, n=3):
    return round(float(x), n)


def fit_grid(oenv, ot, beats):
    """A fixed-tempo grid that best explains the whole track: scan the period (0.1 ms steps around the
    tracker's median beat interval) and the phase, and keep the pair whose grid points sit on the most
    onset strength. Stock library tracks are produced to a click, so one period fits end to end; a
    tracker that slips half a beat somewhere does not move this fit."""
    hop = ot[1] - ot[0]
    med = float(np.median(np.diff(beats)))
    best = (-1.0, med, 0.0)
    for period in np.arange(med * 0.97, med * 1.03, 0.0001):
        n = int((ot[-1] - period) / period)
        for phase in np.arange(0, period, hop):
            idx = np.rint((phase + period * np.arange(n)) / hop).astype(int)
            score = oenv[idx].mean()
            if score > best[0]:
                best = (score, period, phase)
    return float(best[1]), float(best[2])


def analyze(track):
    y, sr = librosa.load(ROOT / track['file'], sr=SR, mono=True)
    duration = len(y) / sr

    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
    ot = librosa.times_like(oenv, sr=sr, hop_length=256)
    _, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=256, units='time', start_bpm=120)
    beat, icpt = fit_grid(oenv, ot, beats)
    # the onset fit can lock onto the off-beat (hi-hat); the kick (< 150 Hz flux) decides which half is the beat
    Sl = np.abs(librosa.stft(y, n_fft=2048, hop_length=256))[librosa.fft_frequencies(sr=sr, n_fft=2048) < 150]
    kick = np.concatenate([[0], np.maximum(0, np.diff(np.log1p(Sl), axis=1)).sum(0)])[:len(oenv)]
    kick_at = lambda p: kick[np.clip(np.rint((p + beat * np.arange(int(ot[-1] / beat) - 1)) / (ot[1] - ot[0])).astype(int) + np.arange(4)[:, None], 0, len(kick) - 1)].max(0).mean()  # noqa: E731
    offbeat_fixed = kick_at(icpt + beat / 2) > kick_at(icpt)
    if offbeat_fixed:
        icpt += beat / 2
    bar = 4 * beat

    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    tt = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=512)
    full, low = S.sum(0), S[freqs < 150].sum(0)

    grid = icpt + beat * np.arange(-4, int(duration / beat) + 4)
    grid = grid[(grid >= 0) & (grid < duration - beat)]

    def beat_db(env):
        return 20 * np.log10(np.array([env[(tt >= a) & (tt < a + beat)].mean() for a in grid]) + 1e-12)

    # drop: the beat with the largest rise from the 16 beats before to the 16 after (full band and kick
    # averaged), leaving room for the window; sections change on a downbeat, so it also fixes the bar phase
    bf, bl = beat_db(full), beat_db(low)
    pre, post = PRE_DROP_BARS * 4, (BARS - PRE_DROP_BARS) * 4
    rise = lambda e, j: e[j:j + 16].mean() - e[j - 16:j].mean()  # noqa: E731
    drop_beat = max(range(max(16, pre), len(grid) - post), key=lambda j: rise(bf, j) + rise(bl, j))
    # a pickup beat just before the drop also rises; the drop is where the kick lands: the beat whose
    # < 150 Hz energy stands furthest above the 4 beats before it
    drop_beat = max(range(drop_beat - 2, drop_beat + 3), key=lambda j: bl[j] - bl[j - 4:j].mean())
    first_downbeat = grid[drop_beat % 4]
    edges = np.arange(first_downbeat, duration - bar, bar)

    def band_db(env):
        e = np.array([env[(tt >= a) & (tt < a + bar)].mean() for a in edges])
        db = 20 * np.log10(e + 1e-12)
        return db - db.max()

    e_full, e_low = band_db(full), band_db(low)

    drop_bar = drop_beat // 4
    jump = e_full[drop_bar:drop_bar + 4].mean() - e_full[drop_bar - 4:drop_bar].mean()
    start_bar = drop_bar - PRE_DROP_BARS
    cut_start = edges[start_bar]
    drop_track = edges[drop_bar]

    win_beats = cut_start + beat * np.arange(BARS * 4)
    peaks = []
    for i, b in enumerate(win_beats):
        m = (ot >= b - beat / 4) & (ot < b + beat / 4)
        j = np.argmax(oenv[m])
        peaks.append({'bar': i // 4 + 1, 'beat': i % 4 + 1, 'grid': r(b - cut_start), 'peak': r(ot[m][j] - cut_start), 'strength': r(oenv[m][j] / oenv.max(), 2)})

    film_bars = []
    for i in range(BARS):
        b = start_bar + i
        film_bars.append({'bar': i + 1, 'start': r(i * bar), 'track_start': r(edges[b]), 'energy_db': r(e_full[b], 1), 'low_db': r(e_low[b], 1)})

    # plot
    fig, ax = plt.subplots(figsize=(12, 3.6), dpi=120)
    x = edges - edges[0] + first_downbeat
    ax.step(x, e_full, where='post', color='#1a1a1a', lw=1.4, label='full band')
    ax.step(x, e_low, where='post', color='#00979C', lw=1.2, label='< 150 Hz')
    ax.axvspan(cut_start, cut_start + BARS * bar, color='#00979C', alpha=0.08, label='20-bar window')
    ax.axvline(drop_track, color='#B0382B', lw=1, ls='--', label=f'drop {drop_track:.2f}s (film {drop_track - cut_start:.2f}s)')
    ax.set_xlabel('track time (s)')
    ax.set_ylabel('bar energy (dB rel. max)')
    ax.set_ylim(-45, 3)
    ax.set_title(f"{track['title']} ({track['artist']}, {track['id']}): {60 / beat:.2f} BPM", loc='left', fontsize=10)
    ax.legend(loc='lower right', fontsize=8, frameon=False)
    for s in ('top', 'right'):
        ax.spines[s].set_visible(False)
    fig.tight_layout()
    out = ROOT / 'out' / f"music-energy-{track['id']}.png"
    out.parent.mkdir(exist_ok=True)
    fig.savefig(out)
    plt.close(fig)

    return {
        **track,
        'duration': r(duration, 2),
        'bpm': r(60 / beat, 2),
        'beat_s': r(beat, 4),
        'bar_s': r(bar, 4),
        'beat_grid': {'first_beat': r(grid[0]), 'first_downbeat': r(first_downbeat), 'offbeat_fixed': bool(offbeat_fixed),
                      'window_onset_offset_ms_median': r(1000 * np.median([p['peak'] - p['grid'] for p in peaks]), 1),
                      'window_beats_onset_within_30ms': f"{sum(abs(p['peak'] - p['grid']) < 0.03 for p in peaks)}/{len(peaks)}"},
        'track_bars': [{'bar': i, 'start': r(a), 'energy_db': r(e_full[i], 1), 'low_db': r(e_low[i], 1)} for i, a in enumerate(edges)],
        'drop': {'track_s': r(drop_track), 'film_s': r(drop_track - cut_start), 'track_bar': int(drop_bar), 'film_bar': PRE_DROP_BARS + 1,
                 'rise_db': r(jump, 1), 'low_rise_db': r(e_low[drop_bar:drop_bar + 4].mean() - e_low[drop_bar - 4:drop_bar].mean(), 1)},
        'window': {'track_start': r(cut_start), 'track_end': r(cut_start + BARS * bar), 'length_s': r(BARS * bar, 2), 'bars': film_bars},
        'onset_peaks': peaks,
        'plot': str(out.relative_to(ROOT)),
    }


def sfx_peak(sid):
    f = ROOT / 'audio' / 'sfx-v3' / f'{sid}.wav'
    y, sr = librosa.load(f, sr=SR, mono=True)
    env = librosa.feature.rms(y=y, frame_length=512, hop_length=64)[0]
    t = librosa.times_like(env, sr=sr, hop_length=64)
    above = np.nonzero(env > env.max() * 0.1)[0]
    return {'id': sid, 'file': str(f.relative_to(ROOT)), 'duration': r(len(y) / sr), 'onset_s': r(t[above[0]]), 'peak_s': r(t[np.argmax(env)]),
            'peak_dbfs': r(20 * np.log10(np.abs(y).max() + 1e-12), 1)}


def main():
    tracks = [analyze(t) for t in TRACKS]
    doc = {
        'generated_by': 'scripts/analyze-music.py',
        'method': 'librosa %s; see the header of the script' % librosa.__version__,
        'bars': BARS,
        'selected': SELECTED,
        'tracks': tracks,
        'sfx': [sfx_peak(s) for s in SFX],
    }
    out = ROOT / 'data' / 'music-analysis.json'
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    for t in tracks:
        d = t['drop']
        print(f"{t['id']:<11} {t['bpm']:>7} BPM  onset offset {t['beat_grid']['window_onset_offset_ms_median']} ms ({t['beat_grid']['window_beats_onset_within_30ms']} within 30 ms)  window {t['window']['track_start']}-{t['window']['track_end']}s"
              f"  drop track {d['track_s']}s film {d['film_s']}s  rise {d['rise_db']} dB (low {d['low_rise_db']} dB)")
    for s in doc['sfx']:
        print(f"{s['id']:<11} onset {s['onset_s']}s peak {s['peak_s']}s {s['peak_dbfs']} dBFS")
    print(f'wrote {out.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
