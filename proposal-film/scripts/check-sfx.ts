#!/usr/bin/env bun
// Sound-effect alignment: does each sfx cue in data/cues.json actually start where it is cued, in
// the rendered file? Decodes the audio (a .wav, or the audio stream of a .mp4), then for every cue
// finds the onset: the first 5 ms window within [t - 50 ms, t + 250 ms] whose RMS rises above both
// -45 dBFS and twice the loudest window of the 100 ms before the cue (so an earlier sound's tail does
// not count). Reports the offset per cue; fails if an onset is missing or more than 30 ms off.
//
//   bun scripts/check-sfx.ts out/m2.mp4 [--cuts]      --cuts: only the cues that sit on a plate cut
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const argv = process.argv.slice(2);
const file = path.resolve(argv.find((a) => !a.startsWith('--')) ?? path.join(ROOT, 'out/sfx.wav'));
const SR = 48000, WIN = Math.round(SR * 0.005), TOL = 0.03;

const d = JSON.parse(readFileSync(path.join(ROOT, 'data/cues.json'), 'utf8')) as {
  plates: { id: string; start: number }[]; sfx: { t: number; kind: string; plate: string }[];
};
const cuts = new Set(d.plates.map((p) => p.start));
const cues = argv.includes('--cuts') ? d.sfx.filter((s) => cuts.has(s.t)) : d.sfx;

const ff = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-']);
if (ff.exitCode !== 0) throw new Error(`ffmpeg: ${ff.stderr.toString()}`);
const pcm = new Float32Array(ff.stdout.buffer, ff.stdout.byteOffset, ff.stdout.byteLength / 4);
const rms = (i0: number) => {
  let s = 0;
  for (let i = Math.max(0, i0); i < Math.min(pcm.length, i0 + WIN); i++) s += pcm[i]! * pcm[i]!;
  return Math.sqrt(s / WIN);
};
const floor = 10 ** (-45 / 20);

let bad = 0;
for (const c of cues) {
  const t0 = Math.round(c.t * SR);
  let base = 0;
  for (let i = t0 - Math.round(0.12 * SR); i < t0 - Math.round(0.02 * SR); i += WIN) base = Math.max(base, rms(i));
  let onset: number | null = null;
  for (let i = t0 - Math.round(0.05 * SR); i < t0 + Math.round(0.25 * SR); i += Math.round(WIN / 5)) {
    if (rms(i) > Math.max(floor, base * 2)) { onset = i / SR; break; }
  }
  const off = onset === null ? null : onset - c.t;
  const ok = off !== null && Math.abs(off) <= TOL;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'BAD'}  ${c.t.toFixed(3).padStart(8)}s  ${c.kind.padEnd(7)} ${c.plate.padEnd(9)} ${cuts.has(c.t) ? 'cut ' : '    '} onset ${off === null ? 'none' : `${(off * 1000).toFixed(1)} ms`}`);
}
console.log(`${file}\ncues ${cues.length}, misaligned: ${bad} (tolerance ${TOL * 1000} ms)`);
process.exit(bad ? 1 : 0);
