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
for (const r of rows) {
  if (r.length < 6) { errs.push(`ROWS bar ${r[0]}: ${r.length} cells, expected 6`); continue; }
  for (const m of r[3]!.matchAll(/「([^」]+)」\s*([\d.]+)→([\d.]+)/g)) {
    texts++;
    const [, text, a, b] = m as unknown as [string, string, string, string];
    const inCues = cueTexts.has(text);
    const inDoc = docN.includes(norm(text));
    if (inCues) fromCues++; else if (inDoc) fromDoc++;
    else errs.push(`SOURCE bar ${r[0]} "${text}": not a cues.json text and not in dept-brain.md`);
    for (const n of new Set(numbers(text))) if (!states(doc, n)) errs.push(`SOURCE bar ${r[0]} "${text}": number ${n} not in dept-brain.md`);
    const u = units(text), need = u / 5 + 1, dwell = Number(b) - Number(a);
    if (dwell < need - EPS) errs.push(`DWELL bar ${r[0]} "${text}": ${dwell.toFixed(2)}s < ${need.toFixed(2)}s (${u} units)`);
    out.push(`  bar ${r[0]!.padStart(2)}  ${inCues ? 'cues' : inDoc ? 'doc ' : '??? '}  ${dwell.toFixed(2).padStart(5)}s >= ${need.toFixed(2)}s  ${text}`);
  }
}

console.log(`doc: ${DOC}`);
console.log(out.join('\n'));
if (errs.length) console.log(errs.map((e) => `  FAIL  ${e}`).join('\n'));
console.log(`rows ${rows.length}/${BARS}; texts ${texts}: from cues.json ${fromCues}, from dept-brain.md ${fromDoc}`);
console.log(`failed: ${errs.length}`);
process.exit(errs.length ? 1 : 0);
