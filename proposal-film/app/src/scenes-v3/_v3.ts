// Shared kit for the 38 s cut (docs/STORYBOARD-v3.md). Every shot is a Plate from the 105 s film's kit
// (same ground, text motion and thread) plus the cut's own rules:
//  - one camera language: a slow linear push-in, zoom 1.00 -> 1.03 across each shot (post zoom about
//    the frame centre), nothing else moves the camera;
//  - no chromatic aberration (RGB separation is banned in this cut);
//  - shots are timed on the music's bar grid (cues-v3.json bpm), never in raw seconds;
//  - match cuts line up on THE HORIZON: the thread lies on y = 540 in every shot that cuts on it,
//    and y = 540 is the zoom centre's row, so the push-in never moves it.
import type * as THREE from 'three';
import type { Frame, PostOverrides } from '../engine/scene';
import { W, H } from '../engine/gl';
import { clamp, type V2 } from '../engine/util';
import { Plate } from '../scenes/_motifs';

/** The horizon: the thread's row in every shot that matches on it. */
export const Y = 540;
/** The open's line runs from LX0 to LX1 (title-safe left edge + 144, mirrored). */
export const LX0 = 240, LX1 = 1680;
/** Push-in per shot. */
export const PUSH = 0.03;

/** Where a layout point is seen after the post zoom z about the frame centre. */
export const zoomed = (p: V2, z: number): V2 => ({ x: W / 2 + (p.x - W / 2) * z, y: H / 2 + (p.y - H / 2) * z });
/** The layout point that the post zoom z shows at p (draw here to be seen at p). */
export const unzoomed = (p: V2, z: number): V2 => ({ x: W / 2 + (p.x - W / 2) / z, y: H / 2 + (p.y - H / 2) / z });

export abstract class Shot extends Plate {
  get t0() { return this.ctx.start; }
  get t1() { return this.ctx.end; }
  /** Film time of beat `beat` (1..4) of bar `bar` (1-based) on the music's grid. */
  at(bar: number, beat = 1) {
    const c = this.ctx.cues;
    return c.timeOfBeat((bar - 1) * c.data.beatsPerBar + beat - 1);
  }
  get beat() { return this.ctx.cues.beatLen; }
  /** The push-in at t: 1 at the shot's first frame, 1 + PUSH at its last. */
  zoom(t: number) { return 1 + PUSH * clamp((t - this.t0) / (this.t1 - this.t0)); }

  override render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const ov = super.render(f, out) ?? {};
    return { ca: 0, zoom: this.zoom(f.t), ...ov };
  }
}

/**
 * Draw `fn` mirrored about the floor at y = floorY (a reflection on a dark gloss floor): `alpha` at
 * the floor line, fading to nothing `depth` px below it.
 */
export function reflect(c: CanvasRenderingContext2D, floorY: number, alpha: number, depth: number, fn: (r: CanvasRenderingContext2D) => void) {
  if (alpha <= 0.002) return;
  const r = mirrorCtx();
  r.setTransform(1, 0, 0, 1, 0, 0);
  r.globalCompositeOperation = 'source-over';
  r.globalAlpha = 1;
  r.filter = 'none';
  r.clearRect(0, 0, W, H);
  r.save();
  r.translate(0, 2 * floorY);
  r.scale(1, -1);
  fn(r);
  r.restore();
  // keep only the band under the floor, fading from `alpha` at the floor to 0 at `depth`
  const g = r.createLinearGradient(0, floorY, 0, floorY + depth);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  r.globalCompositeOperation = 'destination-in';
  r.fillStyle = g;
  r.fillRect(0, 0, W, H);
  r.globalCompositeOperation = 'source-over';
  c.drawImage(r.canvas, 0, 0, W, H);
}

let mirror: CanvasRenderingContext2D | null = null;
/** One shared 1920x1080 buffer for reflections (a reflection is soft, it needs no extra resolution). */
function mirrorCtx() {
  if (!mirror) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    mirror = cv.getContext('2d')!;
  }
  return mirror;
}

/** Restrained blur for a rack focus: at most 8 px (storyboard rule). */
export const focusBlur = (k: number) => `blur(${(8 * clamp(k)).toFixed(2)}px)`;
