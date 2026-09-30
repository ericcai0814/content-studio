#!/usr/bin/env bun
// Check for docs/STORYBOARD-v3.md, the 20-bar storyboard of the 40 s cut.
//
//   bun scripts/check-storyboard.ts [--doc path/to/dept-brain.md]
//
// The storyboard table has one row per bar (| 小節 | 時間 | 畫面 | 文字 | 剪接 | 音效 |). Every on-screen
// text is written in the 文字 cell as 「text」 start→end (film seconds). The check:
//   ROWS     bars 1..20, one row each, in order.
//   SOURCE   every text is either a text of data/cues.json, character for character (cues.json is itself
//            verified by check-facts.ts), or occurs in dept-brain.md after the same normalisation as
//            check-facts.ts; every number in it occurs in dept-brain.md.
//   DWELL    every text stays readable at least units / 5 + 1 seconds (same rule and units as
//            check-readability.ts).
//   TIME     each row's 時間 cell is exactly bar (n-1)..n of the recommended track's measured bar
//            (data/music-analysis.json, the `selected` track's bar_s, rounded to 0.01 s); texts start inside the
//            film, start before they end, and end by the film's end.
//   CUT      a 剪接 cell either starts with 不剪 or with 第 k 拍（t.tt; k is 1 or 3 (a strong beat) and
//            t is that beat of the row's bar; shots between cuts (and the film's ends) last 2..4 s.
//   EXIT     a text either ends on a cut (leaves with it) or its EXIT s fade-out ends by the next cut.
//   FORMAT   a 文字 cell is 無 or only 「text」 start→end items separated by ；, so no text escapes
//            the checks by being written in another shape.
//   DASH     the file has no em dash or en dash anywhere.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const argv = process.argv.slice(2);
const opt = (k: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const DOC = opt('doc') ?? process.env.DEPT_BRAIN ?? path.join(process.env.HOME ?? '', 'obsidian-brain/workspace/20-contexts/software-department/dept-brain.md');
const BOARD = path.join(ROOT, 'docs/STORYBOARD-v3.md');
const BARS = 20;
const EPS = 1e-6;
/** Matches ENTER/EXIT in app/src/scenes/_motifs.ts and check-readability.ts. */
const EXIT = 0.45;
const SHOT_MIN = 2, SHOT_MAX = 4;
const analysis = JSON.parse(readFileSync(path.join(ROOT, 'data/music-analysis.json'), 'utf8')) as { selected: string; tracks: { id: string; bar_s: number }[] };
const track = analysis.tracks.find((x) => x.id === analysis.selected);
if (!track) throw new Error(`music-analysis.json: selected track ${analysis.selected} not found`);
const BAR = track.bar_s;
const DUR = BARS * BAR;
const t2 = (x: number) => (Math.round(x * 100) / 100).toFixed(2);
const near = (a: number, b: number) => Math.abs(a - b) < 0.011;
/** Film seconds are written with exactly two decimals ("3.00"); anything else (".", "1.2.3") is not a time. */
const SEC = String.raw`\d+\.\d{2}`;
/** A cut cell opens with its beat and time, e.g. 第 3 拍（3.00，...; anchored so a later parenthesis cannot stand in. */
const CUT_AT = new RegExp(`^第 ([1-4]) 拍（(${SEC})[，）]`);
const TEXT_ITEM = new RegExp(`^「[^」]+」\\s*${SEC}→${SEC}$`);
const TEXT_ITEMS = new RegExp(`「([^」]+)」\\s*(${SEC})→(${SEC})`, 'g');

/** Same as check-facts.ts. */
const norm = (s: string) => s.toLowerCase().replace(/[\s*`|#>，。、「」『』（）()：:；;！!？?“”"'‘’—–\-/…｜·,.\[\]→＝=]/g, '');
const numbers = (s: string) => (s.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/,/g, ''));
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const states = (src: string, n: string) => numbers(src).includes(n) || (+n <= 10 && Number.isInteger(+n) && src.includes(CN[+n]!));
/** Same as check-readability.ts. */
const units = (s: string) => (s.match(/\p{Script=Han}/gu) ?? []).length + (s.match(/[A-Za-z0-9]+(?:[.,:\-][A-Za-z0-9]+)*/g) ?? []).length;

const doc = readFileSync(DOC, 'utf8');
const docN = norm(doc);
const cueTexts = new Set((JSON.parse(readFileSync(path.join(ROOT, 'data/cues.json'), 'utf8')) as { texts: { text: string }[] }).texts.map((t) => t.text));
const board = readFileSync(BOARD, 'utf8');

const errs: string[] = [];
const out: string[] = [];

board.split('\n').forEach((l, i) => { if (/[—–]/.test(l)) errs.push(`DASH line ${i + 1}: ${l.trim().slice(0, 60)}`); });

const rows = board.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const bars = rows.map((r) => Number(r[0]));
if (bars.length !== BARS || bars.some((b, i) => b !== i + 1)) errs.push(`ROWS expected bars 1..${BARS}, got [${bars.join(', ')}]`);

let texts = 0, fromCues = 0, fromDoc = 0;
const spans: { bar: string; text: string; a: number; b: number }[] = [];
const cuts: number[] = [];
for (const r of rows) {
  if (r.length !== 6) { errs.push(`ROWS bar ${r[0]}: ${r.length} cells, expected 6`); continue; }
  const [barCell, timeCell, , textCell, cutCell] = r as [string, string, string, string, string, string];
  const n = Number(barCell);
  const want = `${t2((n - 1) * BAR)}→${t2(n * BAR)}`;
  if (timeCell !== want) errs.push(`TIME bar ${n}: 時間 "${timeCell}", expected "${want}"`);

  if (!cutCell.startsWith('不剪')) {
    const m = cutCell.match(CUT_AT);
    if (!m) errs.push(`CUT bar ${n}: 剪接 cell must start with 不剪 or 第 k 拍（t.tt`);
    else {
      const beatNo = Number(m[1]), t = Number(m[2]), rel = t - (n - 1) * BAR;
      if (beatNo !== 1 && beatNo !== 3) errs.push(`CUT bar ${n}: cut on beat ${beatNo}, not beat 1 or 3`);
      if (!near(rel, (beatNo - 1) * BAR / 4)) errs.push(`CUT bar ${n}: cut ${m[2]} is not beat ${beatNo} of the bar (${t2((n - 1) * BAR + (beatNo - 1) * BAR / 4)})`);
      cuts.push(t);
    }
  }

  if (textCell !== '無') {
    const items = textCell.split('；').map((x) => x.trim());
    for (const it of items) if (!TEXT_ITEM.test(it)) errs.push(`FORMAT bar ${n}: "${it}" is not 「text」 start→end`);
  }
  for (const m of textCell.matchAll(TEXT_ITEMS)) {
    texts++;
    const [, text, a, b] = m as unknown as [string, string, string, string];
    const inCues = cueTexts.has(text);
    const inDoc = docN.includes(norm(text));
    if (inCues) fromCues++; else if (inDoc) fromDoc++;
    else errs.push(`SOURCE bar ${n} "${text}": not a cues.json text and not in dept-brain.md`);
    for (const x of new Set(numbers(text))) if (!states(doc, x)) errs.push(`SOURCE bar ${n} "${text}": number ${x} not in dept-brain.md`);
    const u = units(text), need = u / 5 + 1, dwell = Number(b) - Number(a);
    if (dwell < need - EPS) errs.push(`DWELL bar ${n} "${text}": ${dwell.toFixed(2)}s < ${need.toFixed(2)}s (${u} units)`);
    if (Number(a) < -EPS || Number(a) >= Number(b) || Number(b) > DUR + 0.011) errs.push(`TIME bar ${n} "${text}": ${a}→${b} is not inside 0→${t2(DUR)}`);
    spans.push({ bar: String(n), text, a: Number(a), b: Number(b) });
    out.push(`  bar ${String(n).padStart(2)}  ${inCues ? 'cues' : inDoc ? 'doc ' : '??? '}  ${dwell.toFixed(2).padStart(5)}s >= ${need.toFixed(2)}s  ${text}`);
  }
}

// shots: from 0 through every cut to the film's end
const bounds = [0, ...cuts, DUR];
for (let i = 1; i < bounds.length; i++) {
  const len = bounds[i]! - bounds[i - 1]!;
  if (len < SHOT_MIN - 0.011 || len > SHOT_MAX + 0.011) errs.push(`CUT shot ${t2(bounds[i - 1]!)}→${t2(bounds[i]!)} lasts ${len.toFixed(2)}s, not ${SHOT_MIN}..${SHOT_MAX}s`);
}
for (const s of spans) {
  const next = bounds.find((c) => c > s.a + EPS) ?? DUR;
  if (!near(s.b, next) && s.b + EXIT > next + EPS) errs.push(`EXIT bar ${s.bar} "${s.text}": ends ${t2(s.b)}, its ${EXIT}s exit runs past the cut at ${t2(next)}`);
}

console.log(`doc: ${DOC}`);
console.log(out.join('\n'));
if (errs.length) console.log(errs.map((e) => `  FAIL  ${e}`).join('\n'));
console.log(`bar ${BAR}s (${track.id}); cuts ${cuts.length}, shots ${bounds.length - 1}`);
console.log(`rows ${rows.length}/${BARS}; texts ${texts}: from cues.json ${fromCues}, from dept-brain.md ${fromDoc}`);
console.log(`failed: ${errs.length}`);
process.exit(errs.length ? 1 : 0);
