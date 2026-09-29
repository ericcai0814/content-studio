// Shared plate kit and the film's one motif, so every plate draws them identically:
//  - Plate: the base class (bone or ink ground, one Canvas2D layer, two line batches)
//  - the THREAD: a teal line dragged by a point of light. On ink it glows (HDR, additive);
//    on bone paper it is plain teal ink. No flicker, no particles.
//  - text from cues.json: one motion language (enter: outExpo rise + fade; exit: inOutCubic fade),
//    with a title-safe and minimum-size guard that the render script reports.
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { Layer2D, W, H, clearRT } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN, rgba } from '../engine/palette';
import { F, font, measure, type FontSpec } from '../engine/type';
import type { TextCue } from '../engine/cues';
import { clamp, ease, pointAtLength, polylineLengths, prog, type V2 } from '../engine/util';

// ------------------------------------------------------------------ motion language
/** Entrance: 0.8 s, outExpo (fast arrival, long settle). */
export const ENTER = 0.8;
/** Exit: 0.45 s, inOutCubic, finishing at the cue's end + EXIT (the cue is readable until `end`). */
export const EXIT = 0.45;
export const inn = (t: number, t0: number, dur = ENTER) => prog(t, t0, t0 + dur, ease.outExpo);
export const move = (t: number, t0: number, t1: number) => prog(t, t0, t1, ease.inOutCubic);
/** 0..1 visibility of a cue: rises from `start`, holds, fades after `end`. */
export const cueVis = (t: number, c: TextCue) => Math.min(inn(t, c.start), 1 - prog(t, c.end, c.end + EXIT, ease.inOutCubic));

// ------------------------------------------------------------------ layout guard
/** Title-safe margin (px from every edge) and the smallest text size allowed on screen. */
export const SAFE = 96;
export const MIN_PX = 30;
/** Warnings collected while drawing (text outside title-safe, text too small); read by render.ts. */
export const layoutWarnings: string[] = [];
const warned = new Set<string>();
function warn(key: string, msg: string) {
  if (warned.has(key)) return;
  warned.add(key);
  layoutWarnings.push(msg);
}

// ------------------------------------------------------------------ type styles
export interface TextStyle { f: FontSpec; size: number; tracking?: number }
export const STYLE: Record<string, TextStyle> = {
  display: { f: F.sans(700), size: 84 },
  headline: { f: F.sans(600), size: 60 },
  body: { f: F.sans(500), size: 44 },
  annotation: { f: F.sans(500), size: 40 },
  stamp: { f: F.sans(700), size: 40 },
  note: { f: F.mono(500), size: 40 },
  label: { f: F.mono(500), size: 32, tracking: 1 },
};

export interface DrawTextOpts {
  color: string;
  align?: 'left' | 'center' | 'right';
  /** Override the role's style / size. */
  style?: TextStyle;
  size?: number;
  /** Draw this string instead of the cue text (a counter rolling up to the cue's number). */
  text?: string;
  /** Reveal only left of this x (the thread writing the text). */
  clipX?: number;
  /** Written by the thread: each glyph fades and settles in as `x` passes it, over `feather` px (left-aligned text only). */
  reveal?: { x: number; feather: number };
  /** Rotation in radians about the anchor (stamps). */
  rot?: number;
  /** Extra alpha multiplier. */
  alpha?: number;
}

/**
 * Draw a text cue at (x, baseline y) with the film's entrance/exit, and check it against title-safe.
 * Returns the text box (in unrotated layout px) so plates can hang lines off it.
 */
export function drawCue(c: CanvasRenderingContext2D, cue: TextCue, t: number, x: number, y: number, o: DrawTextOpts) {
  const st = o.style ?? STYLE[cue.role] ?? STYLE.body!;
  const size = o.size ?? st.size;
  const text = o.text ?? cue.text;
  const tr = st.tracking ?? 0;
  const w = measure(cue.text, st.f, size, tr);
  const align = o.align ?? 'left';
  const x0 = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  const box = { x: x0, y: y - size * 0.9, w, h: size * 1.15 };
  if (size < MIN_PX) warn(`${cue.id}:size`, `${cue.id}: ${size}px < ${MIN_PX}px minimum`);
  if (!o.rot && (box.x < SAFE - 0.5 || box.x + box.w > W - SAFE + 0.5 || box.y < SAFE - 0.5 || box.y + box.h > H - SAFE + 0.5))
    warn(`${cue.id}:safe`, `${cue.id}: box ${box.x.toFixed(0)},${box.y.toFixed(0)} ${box.w.toFixed(0)}x${box.h.toFixed(0)} leaves title-safe (${SAFE}px)`);
  const a = cueVis(t, cue) * (o.alpha ?? 1);
  if (a <= 0.002) return box;
  const dy = (1 - inn(t, cue.start)) * 18;
  c.save();
  c.globalAlpha = a;
  if (o.clipX !== undefined) { c.beginPath(); c.rect(0, 0, o.clipX, H); c.clip(); }
  c.translate(x, y + dy);
  if (o.rot) c.rotate(o.rot);
  c.font = font(st.f, size);
  c.letterSpacing = `${tr}px`;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillStyle = o.color;
  if (o.reveal && align === 'left') {
    let prefix = '';
    for (const ch of Array.from(text)) {
      const gx = c.measureText(prefix).width; // (includes ctx.letterSpacing)
      prefix += ch;
      const k = clamp((o.reveal.x - (x + gx)) / o.reveal.feather);
      if (k <= 0) break;
      c.globalAlpha = a * ease.outExpo(k);
      c.fillText(ch, gx, (1 - ease.outExpo(k)) * 10);
    }
  } else c.fillText(text, 0, 0);
  c.restore();
  return box;
}

/** The cue text with its first number replaced by that number times k (counters), keeping its format. */
export function rollNumber(text: string, k: number) {
  return text.replace(/\d[\d,]*(\.\d+)?/, (m) => {
    const n = parseFloat(m.replace(/,/g, ''));
    const v = Math.round(n * clamp(k));
    return m.includes(',') ? v.toLocaleString('en-US') : String(v);
  });
}

// ------------------------------------------------------------------ the thread
type RGB = [number, number, number];
export const sig = (k: number): RGB => [LIN.signal[0] * k, LIN.signal[1] * k, LIN.signal[2] * k];

/** Length of a polyline in px. */
export function pathLen(pts: V2[]) { const L = polylineLengths(pts); return L[L.length - 1] ?? 0; }

/**
 * Thread weight: every thread and lead is drawn this many times the width a plate asks for, so the
 * motif still reads when the film is watched full-width on a phone held upright (about 1/5 scale).
 */
export const THREAD_WEIGHT = 2;

/** Draw the first `len` px of a polyline and return the point there (the head) with the full length. */
export function threadLine(lb: LineBatch, pts: V2[], len: number, width: number, rgb: RGB, alpha = 1) {
  width *= THREAD_WEIGHT;
  const L = polylineLengths(pts);
  const total = L[L.length - 1] ?? 0;
  const s = clamp(len, 0, total);
  for (let i = 1; i < pts.length; i++) {
    if (L[i - 1]! >= s) break;
    const a = pts[i - 1]!, b = pts[i]!;
    const e = L[i]! <= s ? b : pointAtLength(pts, L, s);
    lb.seg2(a.x, a.y, e.x, e.y, width, rgb, alpha);
  }
  const h = pointAtLength(pts, L, s);
  return { x: h.x, y: h.y, total };
}

/** The point of light at the head of the thread, on ink (additive batch, blooms). */
export function threadHead(lb: LineBatch, x: number, y: number, k = 1) {
  if (k <= 0.001) return;
  lb.seg2(x, y, x + 0.01, y, 44, sig(0.45 * k), 0.45);
  lb.seg2(x, y, x + 0.01, y, 17, sig(3.2 * k), 0.9);
  lb.seg2(x, y, x + 0.01, y, 6, [1.6 * k, 3.0 * k, 3.0 * k], 1);
}

/** The head on bone paper (normal batch): a solid teal dot with a pale ring, no glow. */
export function threadHeadInk(lb: LineBatch, x: number, y: number, k = 1) {
  if (k <= 0.001) return;
  lb.seg2(x, y, x + 0.01, y, 32, LIN.signal, 0.18 * k);
  lb.seg2(x, y, x + 0.01, y, 15, LIN.signal, k);
}

/** Sample a cubic Bezier into a polyline. */
export function bezier(p0: V2, p1: V2, p2: V2, p3: V2, n = 48): V2[] {
  const out: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    out.push({
      x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x,
      y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y,
    });
  }
  return out;
}

// ------------------------------------------------------------------ plate base
/**
 * A plate: clears to bone (paper) or ink, then draws, in order: `under()` (optional GL), the Canvas2D `layer`, `ink` lines
 * (normal blend) and `glow` lines (additive HDR, the only bloom). Lines sit over the drawing.
 */
export abstract class Plate extends Scene {
  layer = new Layer2D();
  glow = new LineBatch(12000, { blend: 'add' });
  ink = new LineBatch(12000, { blend: 'normal' });

  get paper() { return !!this.ctx.params.paper; }
  cue(id: string) { return this.ctx.cues.get(id); }
  /** Text and hairline colours for this plate's ground. */
  get fg() { return this.paper ? rgba('ink', 0.92) : rgba('bone', 0.94); }
  get dim() { return this.paper ? rgba('graphite', 1) : rgba('ash', 1); }

  abstract draw(f: Frame, c: CanvasRenderingContext2D): PostOverrides | void;
  /** GL drawing under the 2D layer (shader grounds, 3D wireframes), after the ground is cleared. */
  under(_f: Frame, _out: THREE.WebGLRenderTarget): void {}

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    clearRT(renderer, out, this.paper ? LIN.bone : LIN.ink);
    this.layer.clear();
    this.glow.clear();
    this.ink.clear();
    const ov = this.draw(f, this.layer.ctx);
    this.under(f, out);
    comp.draw(renderer, this.layer.upload(), out);
    this.ink.render(renderer, out);
    this.glow.render(renderer, out);
    return ov;
  }
}
