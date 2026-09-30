// v3 shot 9 · dogfood A (bar 15 beat 3 to bar 16). Black line drawing. At the cut the schedule's route
// is the teal thread on the horizon, running into the dept-brain core where the W8 seal was. The thread
// leaves the core, runs down and back along the department's five projects (each relights as it
// passes) and returns to where it started: first used on ourselves. The layout (A-space) is shared with
// dogfood B, which draws it pushed in by the same 3 % so the rack focus cut does not jump.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { clamp, polylineLengths, type V2 } from '../engine/util';
import { bezier, drawCue, inn, move, pathLen, threadHead, threadLine, sig } from '../scenes/_motifs';
import { Shot, Y, PUSH, zoomed } from './_v3';
import { W8, ROUTE_X0 } from './schedule-b';

export const CORE = zoomed(W8, 1 + PUSH);
export const CW = 236, CH = 88;
/** The horizon thread's left end: where the schedule's route was last seen. */
export const LINE_X0 = zoomed({ x: ROUTE_X0, y: Y }, 1 + PUSH).x;
export const NODES: V2[] = [460, 660, 860, 1060, 1260].map((x) => ({ x, y: 720 }));
export const DEPT = { x0: 180, y0: 380, x1: 1740, y1: 800 };
/** The loop: out of the core's bottom, down and left along the projects, up and back onto the horizon. */
export const LOOP: V2[] = [
  ...bezier({ x: CORE.x, y: Y + CH / 2 }, { x: CORE.x, y: 700 }, { x: 1320, y: 720 }, { x: 1260, y: 720 }, 24),
  { x: 460, y: 720 },
  ...bezier({ x: 460, y: 720 }, { x: 330, y: 720 }, { x: LINE_X0 + 20, y: 640 }, { x: LINE_X0 + 40, y: Y }, 24),
];

/** Arc length along LOOP at which the loop passes project node i. */
export function nodeAt(i: number) {
  const L = polylineLengths(LOOP);
  let best = 0, bd = Infinity;
  LOOP.forEach((p, j) => { const d = Math.hypot(p.x - NODES[i]!.x, p.y - NODES[i]!.y); if (d < bd) { bd = d; best = L[j]!; } });
  return best;
}

export default class DogfoodA extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    c.save();
    c.setLineDash([10, 8]);
    c.strokeStyle = rgba('ash', 0.35); c.lineWidth = 1.5;
    c.strokeRect(DEPT.x0, DEPT.y0, DEPT.x1 - DEPT.x0, DEPT.y1 - DEPT.y0);
    c.restore();

    // the horizon thread, from the cut, into the core
    threadLine(this.glow, [{ x: LINE_X0, y: Y }, { x: CORE.x - CW / 2, y: Y }], 1e5, 2, sig(2.2));
    c.fillStyle = rgba('ink2', 1); c.strokeStyle = rgba('ash', 0.7); c.lineWidth = 1.5;
    c.fillRect(CORE.x - CW / 2, CORE.y - CH / 2, CW, CH);
    c.strokeRect(CORE.x - CW / 2, CORE.y - CH / 2, CW, CH);

    // the loop, bar 16; each project relights as the head passes it
    const k = move(t, this.at(16), this.t1 - 0.15);
    const total = pathLen(LOOP), s = k * total;
    const h = threadLine(this.glow, LOOP, s, 2, sig(2.2));
    if (k > 0 && k < 1) threadHead(this.glow, h.x, h.y, 1);
    NODES.forEach((n, i) => {
      const lit = clamp((s - nodeAt(i)) / 60);
      c.fillStyle = rgba('ink2', 1); c.strokeStyle = rgba('ash', 0.5 + 0.4 * lit); c.lineWidth = 1.5;
      c.beginPath(); c.arc(n.x, n.y, 16, 0, Math.PI * 2); c.fill(); c.stroke();
      if (lit > 0) threadHead(this.glow, n.x, n.y, 0.7 * lit);
    });

    drawCue(c, this.cue('dogfood.t1'), t, 240, 930, { color: this.fg });
  }
}
