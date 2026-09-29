// Typography (layout helpers from pdoom-video, MIT; font registry rewritten for this film):
// Noto Sans TC (variable weight 100–900) for all Chinese and display text, IBM Plex Mono for
// labels, codes and numbers. Both OFL, self-hosted in public/fonts (no Google Fonts link).
// No serif, no outlines: emphasis is weight within the same family.

export interface FontSpec { family: string; weight: number }

const SANS = 'Noto Sans TC';
const MONO = 'Plex Mono';

type FontDef = { family: string; file: string; weight: string };
const DEFS: FontDef[] = [
  { family: SANS, file: 'NotoSansTC.woff2', weight: '100 900' },
  { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
  { family: MONO, file: 'IBMPlexMono-Medium.woff2', weight: '500' },
  { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
];

export const F = {
  /** Noto Sans TC at any weight 100..900 (variable axis). */
  sans(weight = 400): FontSpec { return { family: SANS, weight: Math.round(Math.min(900, Math.max(100, weight))) }; },
  /** IBM Plex Mono 400/500/600; CJK glyphs in a mono run fall back to Noto Sans TC. */
  mono(weight = 400): FontSpec { return { family: MONO, weight: nearest([400, 500, 600], weight) }; },
};

function nearest(list: number[], v: number) {
  let best = list[0]!;
  for (const x of list) if (Math.abs(x - v) < Math.abs(best - v)) best = x;
  return best;
}

/** CSS font string for Canvas2D (mono runs fall back to Noto Sans TC for CJK). */
export const font = (f: FontSpec, sizePx: number) =>
  `${f.weight} ${sizePx}px "${f.family}"${f.family === SANS ? '' : `, "${SANS}"`}`;

export async function loadFonts(): Promise<void> {
  await Promise.all(
    DEFS.map(async (d) => {
      const r = await fetch(`fonts/${d.file}`);
      if (!r.ok) throw new Error(`fonts/${d.file}: HTTP ${r.status}`);
      const ff = new FontFace(d.family, await r.arrayBuffer(), { weight: d.weight });
      await ff.load();
      document.fonts.add(ff);
    }),
  );
  await document.fonts.ready;
}

let measureCtx: CanvasRenderingContext2D | null = null;
function mctx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')!;
  return measureCtx;
}

/** Advance width of `text` in px (tracking = extra letter spacing in px). */
export function measure(text: string, f: FontSpec, size: number, tracking = 0) {
  const c = mctx();
  c.font = font(f, size);
  return c.measureText(text).width + Math.max(0, Array.from(text).length - 1) * tracking;
}

/** Largest font size (<= max) at which text fits in maxWidth. */
export function fitSize(text: string, f: FontSpec, maxWidth: number, max = 400) {
  const w = measure(text, f, 100);
  return Math.min(max, (100 * maxWidth) / Math.max(1, w));
}
