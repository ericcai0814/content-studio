#!/usr/bin/env bun
// Readability and timing check for data/cues.json.
//
//   bun scripts/check-readability.ts
//
// 1. Every text stays readable at least  units / 5 + 1  seconds (Chinese reads at about 5 characters
//    a second, plus a second to find the line). units = CJK characters + Latin/number tokens
//    ("Project", "AI", "7,416", "4.5", "1:1" count one each); punctuation and spaces count zero.
//    The text is readable from `start` to `end`.
// 2. Every text lives inside its plate, and either its exit (EXIT s after `end`) finishes before the
//    cut, or `end` is the cut itself (the text leaves with the hard cut, no fade).
// 3. Plates tile the film without gaps, every cut sits on a downbeat of the virtual grid, and every
//    sound-effect cue sits on a beat.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
/** Matches ENTER/EXIT in app/src/scenes/_motifs.ts. */
const EXIT = 0.45;
const EPS = 1e-6;

type Plate = { id: string; start: number; end: number };
type Text = { id: string; plate: string; text: string; start: number; end: number };
const d = JSON.parse(readFileSync(path.join(ROOT, 'data/cues.json'), 'utf8')) as {
  bpm: number; offset: number; beatsPerBar: number; duration: number; plates: Plate[]; texts: Text[]; sfx: { t: number; kind: string }[];
};

export const units = (s: string) => (s.match(/\p{Script=Han}/gu) ?? []).length + (s.match(/[A-Za-z0-9]+(?:[.,:\-][A-Za-z0-9]+)*/g) ?? []).length;

const errs: string[] = [];
const rows: string[] = [];
let readability = 0;
for (const c of d.texts) {
  const u = units(c.text), need = u / 5 + 1, dwell = c.end - c.start;
  const ok = dwell >= need - EPS;
  if (!ok) { readability++; errs.push(`READABILITY ${c.id} "${c.text}": ${dwell.toFixed(2)}s < ${need.toFixed(2)}s (${u} units)`); }
  rows.push(`${ok ? 'ok ' : 'BAD'}  ${c.id.padEnd(16)} ${dwell.toFixed(2).padStart(6)}s >= ${need.toFixed(2).padStart(5)}s  (${String(u).padStart(2)})  ${c.text}`);
  const p = d.plates.find((x) => x.id === c.plate);
  if (!p) errs.push(`TIMING ${c.id}: unknown plate ${c.plate}`);
  else if (c.start < p.start - EPS || (c.end + EXIT > p.end + EPS && Math.abs(c.end - p.end) > EPS))
    errs.push(`TIMING ${c.id}: ${c.start}–${c.end}(+${EXIT}) outside plate ${p.id} ${p.start}–${p.end}`);
}

const beat = 60 / d.bpm, bar = beat * d.beatsPerBar;
const onGrid = (t: number, step: number) => Math.abs((t - d.offset) / step - Math.round((t - d.offset) / step)) < 1e-6;
d.plates.forEach((p, i) => {
  const prevEnd = i === 0 ? 0 : d.plates[i - 1]!.end;
  if (Math.abs(p.start - prevEnd) > EPS) errs.push(`GRID plate ${p.id} starts at ${p.start}, previous ends at ${prevEnd}`);
  if (!onGrid(p.start, bar)) errs.push(`GRID plate ${p.id} cut at ${p.start} is not on a downbeat (bar ${bar}s)`);
});
const last = d.plates[d.plates.length - 1]!;
if (Math.abs(last.end - d.duration) > EPS) errs.push(`GRID last plate ends at ${last.end}, duration is ${d.duration}`);
for (const s of d.sfx) if (!onGrid(s.t, beat)) errs.push(`GRID sfx ${s.kind} at ${s.t} is not on a beat (${beat}s)`);

console.log(rows.join('\n'));
console.log(errs.length ? errs.join('\n') : '');
console.log(`texts ${d.texts.length}, readability violations: ${readability}, other timing/grid errors: ${errs.length - readability}`);
process.exit(errs.length ? 1 : 0);
