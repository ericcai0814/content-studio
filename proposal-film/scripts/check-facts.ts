#!/usr/bin/env bun
// Fact check: everything the film says must be traceable to the proposal's source of truth,
// dept-brain.md (read-only here).
//
//   bun scripts/check-facts.ts [--doc path/to/dept-brain.md]
//
// For every text cue in data/cues.json:
//   VERBATIM  the text itself occurs in dept-brain.md (after normalisation, see norm()), or
//   ANCHORED  it does not (a condensed line), but it lists `source` excerpts that each occur in
//             dept-brain.md, and every number in the text also occurs in one of its sources;
//   FAIL      anything else: no source, a source not found, or a number found nowhere in the doc.
// Every number shown must occur in dept-brain.md; a number found in the doc but not in the cue's own
// source is reported as a warning (it is not backed by that line's anchor).
// Scene modules must not hard-code display text: any string literal in app/src/scenes/*.ts that
// contains CJK must itself occur verbatim in dept-brain.md.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const argv = process.argv.slice(2);
const opt = (k: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const DOC = opt('doc') ?? process.env.DEPT_BRAIN ?? path.join(process.env.HOME ?? '', 'obsidian-brain/workspace/20-contexts/software-department/dept-brain.md');

/** Drop whitespace, Markdown marks and punctuation (full- and half-width), and ignore Latin case, so layout, emphasis and a set-in-caps label do not matter. */
const norm = (s: string) => s.toLowerCase().replace(/[\s*`|#>，。、「」『』（）()：:；;！!？?“”"'‘’—–\-/…｜·,.\[\]→＝=]/g, '');
/** Numbers as written (7,416 -> 7416; 4.5 stays 4.5; 1:1 -> 1, 1). */
const numbers = (s: string) => (s.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/,/g, ''));
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
/** Does `src` state number n (as digits, or as a Chinese numeral for 0..10)? */
const states = (src: string, n: string) => numbers(src).includes(n) || (+n <= 10 && Number.isInteger(+n) && src.includes(CN[+n]!));

const doc = readFileSync(DOC, 'utf8');
const docN = norm(doc);
const cues = JSON.parse(readFileSync(path.join(ROOT, 'data/cues.json'), 'utf8')) as { texts: { id: string; text: string; source?: string[] }[] };

let fails = 0, warns = 0, verbatim = 0, anchored = 0;
const out: string[] = [];
for (const c of cues.texts) {
  const problems: string[] = [];
  const isVerbatim = docN.includes(norm(c.text));
  const srcs = c.source ?? [];
  for (const s of srcs) if (!docN.includes(norm(s))) problems.push(`source not in doc: "${s}"`);
  if (!isVerbatim && srcs.length === 0) problems.push('not verbatim and no source');
  for (const n of new Set(numbers(c.text))) {
    if (!states(doc, n)) { problems.push(`number ${n} not in doc`); continue; }
    if (!isVerbatim && !srcs.some((s) => states(s, n))) { warns++; out.push(`  WARN  ${c.id}: number ${n} is in the doc but not in this cue's source`); }
  }
  if (problems.length) { fails++; out.push(`  FAIL  ${c.id} "${c.text}": ${problems.join('; ')}`); }
  else if (isVerbatim) verbatim++;
  else { anchored++; out.push(`  ANCHORED  ${c.id} "${c.text}"  <=  ${srcs.map((s) => `"${s}"`).join(' + ')}`); }
}

// scene modules: CJK string literals (comments stripped first)
const sceneDir = path.join(ROOT, 'app/src/scenes');
let literals = 0;
for (const f of readdirSync(sceneDir).filter((f) => f.endsWith('.ts'))) {
  const code = readFileSync(path.join(sceneDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  for (const m of code.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)) {
    const s = m[1] ?? m[2] ?? m[3] ?? '';
    if (!/\p{Script=Han}/u.test(s)) continue;
    literals++;
    if (!docN.includes(norm(s))) { fails++; out.push(`  FAIL  scenes/${f}: literal "${s}" not in doc`); }
    for (const n of numbers(s)) if (!states(doc, n)) { fails++; out.push(`  FAIL  scenes/${f}: number ${n} in "${s}" not in doc`); }
  }
}

console.log(`doc: ${DOC}`);
console.log(out.join('\n'));
console.log(`texts ${cues.texts.length}: verbatim ${verbatim}, anchored ${anchored}, failed ${cues.texts.length - verbatim - anchored}; scene CJK literals ${literals}`);
console.log(`number warnings ${warns}`);
console.log(`missing: ${fails}`);
process.exit(fails ? 1 : 0);
