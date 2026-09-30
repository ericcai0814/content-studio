// v3 shot 3 · meanings (bars 4-5). Blueprint: the drafting grid opens up and down from the paper's rule
// row (mask reveal) behind a traceability-table header that is there from the cut; its status column lights, and a trunk drops out of it
// and splits into four leads (one meaning per project, no labels). The four leads land on one line: the
// edge the drop cuts on (halfway.ts matchEdge(), drawn where the push-in will show it there). From the
// headline's exit everything fades but that line: the frame is empty for the half beat before the drop.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { W, H } from '../engine/gl';
import { ease, lerp, prog, type V2 } from '../engine/util';
import { drawCue, inn, move, threadHead, threadLine, sig, EXIT } from '../scenes/_motifs';
import { Shot, Y, PUSH, unzoomed } from './_v3';
import { matchEdge } from './halfway';

const TX0 = 240, TX1 = 1680, COLS = 6, COL = 2;
const FRACS = [0.1, 0.37, 0.63, 0.9];

export default class Meanings extends Shot {
  /** The matched edge as drawn here: at the end of this shot the push-in shows it where halfway starts it. */
  edge = matchEdge().map((p) => unzoomed(p, 1 + PUSH)) as [V2, V2];

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const main = this.cue('meanings.main');
    const [e0, e1] = this.edge;
    const on = (k: number): V2 => ({ x: lerp(e0.x, e1.x, k), y: lerp(e0.y, e1.y, k) });
    // everything but the edge fades with the headline's exit
    const keep = 1 - prog(t, main.end, main.end + EXIT, ease.inOutCubic);

    // the grid, opening up and down from the rule's row (the paper's rule as a blueprint hairline at the cut)
    const open = inn(t, this.t0, 0.6);
    c.fillStyle = rgba('bone', 0.45 * (1 - open) * keep);
    c.fillRect(0, Y - 1, W, 2);
    c.save();
    c.globalAlpha = keep;
    c.beginPath(); c.rect(0, Y - Y * open, W, 2 * Y * open); c.clip();
    c.fillStyle = rgba('graphite', 0.09);
    for (let x = 0; x < W; x += 30) c.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 30) c.fillRect(0, y, W, 1);
    c.fillStyle = rgba('graphite', 0.22);
    for (let x = 0; x < W; x += 150) c.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 150) c.fillRect(0, y, W, 1);
    c.restore();

    // the table header, above the edge: on screen from the cut (the grid opens behind it)
    c.save();
    c.globalAlpha = keep;
    const ty0 = Math.max(150, Math.min(e0.y, e1.y) - 260), ty1 = ty0 + 70;
    const cw = (TX1 - TX0) / COLS;
    c.strokeStyle = rgba('bone', 0.4); c.lineWidth = 1.5;
    for (let i = 0; i < COLS; i++) c.strokeRect(TX0 + i * cw, ty0, cw, ty1 - ty0);
    c.fillStyle = rgba('ash', 0.35);
    for (let i = 0; i < COLS; i++) if (i !== COL) c.fillRect(TX0 + i * cw + 28, (ty0 + ty1) / 2 - 3, cw * 0.45, 6);
    const lit = inn(t, this.t0 + this.beat, 0.6);
    const cx0 = TX0 + COL * cw, cx1 = cx0 + cw;
    if (lit > 0) {
      c.save();
      c.beginPath(); c.rect(cx0, ty0, cw, ty1 - ty0); c.clip();
      c.strokeStyle = rgba('signal', 0.28 * lit); c.lineWidth = 1.5;
      c.beginPath();
      for (let x = cx0 - (ty1 - ty0); x < cx1; x += 12) { c.moveTo(x, ty1); c.lineTo(x + (ty1 - ty0), ty0); }
      c.stroke();
      c.restore();
    }
    c.restore();
    const box = [{ x: cx0, y: ty0 }, { x: cx1, y: ty0 }, { x: cx1, y: ty1 }, { x: cx0, y: ty1 }, { x: cx0, y: ty0 }];
    threadLine(this.glow, box, lit * 2 * (cw + ty1 - ty0), 2, sig(2), keep);

    // trunk, then four leads, one a beat through bar 4, landing on the edge
    const mx = (cx0 + cx1) / 2, split = ty1 + 60;
    const trunk = move(t, this.t0 + this.beat, this.t0 + 2 * this.beat);
    threadLine(this.glow, [{ x: mx, y: ty1 }, { x: mx, y: split }], trunk * (split - ty1), 2, sig(2), keep);
    FRACS.forEach((fr, i) => {
      const p = on(fr);
      const k = move(t, this.at(4, 3) + i * this.beat * 0.5, this.at(5) + i * this.beat * 0.5);
      const pts = [{ x: mx, y: split }, { x: p.x, y: split + 40 }, { x: p.x, y: p.y }];
      const len = Math.hypot(p.x - mx, 40) + Math.abs(p.y - split - 40);
      const h = threadLine(this.glow, pts, k * len, 1.6, sig(1.8), keep);
      if (k > 0 && k < 1) threadHead(this.glow, h.x, h.y, 0.6 * keep);
    });

    // the edge: drawn out from its middle once the leads have landed; it stays through the empty frame
    const ek = move(t, this.at(5, 2), this.at(5, 4));
    const mid = on(0.5);
    const ea = on(0.5 - 0.5 * ek), eb = on(0.5 + 0.5 * ek);
    if (ek > 0) {
      threadLine(this.glow, [mid, ea], 1e5, 2, sig(2.2));
      threadLine(this.glow, [mid, eb], 1e5, 2, sig(2.2));
    }

    drawCue(c, main, t, TX0, 930, { color: this.fg });
  }
}
