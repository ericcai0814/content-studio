// v3 shot 10 · dogfood B (bars 17-18). A rack focus on the same layout as dogfood A (drawn pushed in by
// A's 3 %, so the cut does not jump): the department (boundary, closed loop, relit projects, core) goes
// soft, and far off to the upper right a product outline, soft at the cut, comes into focus and lights;
// a dashed teal link reaches it from the core. The horizon thread stays sharp: the outro retracts it.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { ease, prog, type V2 } from '../engine/util';
import { drawCue, inn, move, pathLen, threadLine, sig } from '../scenes/_motifs';
import { Shot, Y, PUSH, zoomed, focusBlur } from './_v3';
import { CORE, CW, CH, DEPT, LINE_X0, LOOP, NODES } from './dogfood-a';

const Z = 1 + PUSH;
const P = (p: V2) => zoomed(p, Z);
const PROD = { x: 1560, y: 215, w: 92, h: 46, d: 40 };

export default class DogfoodB extends Shot {
  /** An isometric box outline centred at (x, y). */
  private box(): V2[] {
    const { x, y, w, h, d } = PROD;
    const top = [{ x, y: y - h }, { x: x + w, y }, { x, y: y + h }, { x: x - w, y }];
    return [top[3]!, top[0]!, top[1]!, { x: x + w, y: y + d }, { x, y: y + h + d }, { x: x - w, y: y + d }, top[3]!, top[2]!, top[1]!, top[2]!, { x, y: y + h + d }];
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const focus = prog(t, this.t0, this.t0 + 0.45, ease.inOutCubic);
    const core = P(CORE), cw = CW * Z, ch = CH * Z;

    // the department, going soft (drawn in 2D so it can blur; the teal is flat ink here, not glow)
    c.save();
    c.filter = focusBlur(focus);
    c.globalAlpha = 1 - 0.35 * focus;
    c.setLineDash([10, 8]);
    const d0 = P({ x: DEPT.x0, y: DEPT.y0 }), d1 = P({ x: DEPT.x1, y: DEPT.y1 });
    c.strokeStyle = rgba('ash', 0.35); c.lineWidth = 1.5;
    c.strokeRect(d0.x, d0.y, d1.x - d0.x, d1.y - d0.y);
    c.setLineDash([]);
    c.strokeStyle = rgba('signal', 0.9); c.lineWidth = 4;
    c.beginPath(); LOOP.map(P).forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.fillStyle = rgba('ink2', 1); c.strokeStyle = rgba('ash', 0.7); c.lineWidth = 1.5;
    c.fillRect(core.x - cw / 2, core.y - ch / 2, cw, ch);
    c.strokeRect(core.x - cw / 2, core.y - ch / 2, cw, ch);
    for (const n of NODES.map(P)) {
      c.fillStyle = rgba('signal', 0.5); c.strokeStyle = rgba('ash', 0.9);
      c.beginPath(); c.arc(n.x, n.y, 16 * Z, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    c.restore();

    // the horizon thread stays sharp
    threadLine(this.glow, [P({ x: LINE_X0, y: Y }), { x: core.x - cw / 2, y: Y }], 1e5, 2, sig(2.2));

    // the product: soft at the cut, sharp after the pull; it lights and the link reaches it
    const box = this.box();
    c.save();
    c.filter = focusBlur(1 - focus);
    c.setLineDash([6, 6]);
    c.strokeStyle = rgba('graphite', 0.8); c.lineWidth = 1.5;
    c.beginPath(); box.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.restore();
    const pk = inn(t, this.t0 + 0.45, 0.8);
    if (pk > 0) threadLine(this.glow, box, pk * pathLen(box), 1.5, sig(2));
    const lk = move(t, this.t0 + 0.6, this.at(18));
    const a = { x: core.x, y: core.y - ch / 2 }, b = { x: PROD.x - PROD.w * 0.5, y: PROD.y + PROD.h + PROD.d * 0.5 };
    if (lk > 0) {
      c.save();
      c.setLineDash([10, 8]);
      c.strokeStyle = rgba('signal', 0.9); c.lineWidth = 3;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(a.x + (b.x - a.x) * lk, a.y + (b.y - a.y) * lk); c.stroke();
      c.restore();
    }

    drawCue(c, this.cue('dogfood.tag'), t, 240, 930, { color: rgba('signal', 1) });
  }
}
