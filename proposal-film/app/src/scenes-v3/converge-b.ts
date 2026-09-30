// v3 shot 6 · converge B (bars 10-11). A rack focus: at the cut the four other slabs, behind and to the
// right, are sharp and the dept-brain core is soft; in half a second the focus moves to the core and
// the slabs fall out of focus (at most 8 px). The core's edge lights teal. On bar 11 the write-back loop
// runs once around the core and closes; that ring is the W0 seal the schedule cuts to (RING, CORE).
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { ease, prog } from '../engine/util';
import { drawCue, inn, move, threadHead, threadLine, sig } from '../scenes/_motifs';
import { Shot, Y, focusBlur } from './_v3';

/** The core's centre and the write-back ring's radius; schedule-a.ts puts the W0 seal exactly here. */
export const CORE = { x: 560, y: Y };
export const RING = 150;
const CW = 236, CH = 88;
const BACK = [{ x: 900, y: 430 }, { x: 1160, y: 500 }, { x: 1420, y: 440 }, { x: 1300, y: 640 }];

export default class ConvergeB extends Shot {
  private slab(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number) {
    c.fillStyle = rgba('ink2', 0.9 * a);
    c.fillRect(x - w / 2, y - h / 2, w, h);
    // converge A's glass: a teal rim and a grey edge
    c.strokeStyle = rgba('signal', 0.55 * a); c.lineWidth = 3;
    c.strokeRect(x - w / 2, y - h / 2, w, h);
    c.strokeStyle = rgba('ash', 0.8 * a); c.lineWidth = 1.5;
    c.strokeRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6);
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const focus = prog(t, this.t0, this.t0 + 0.45, ease.inOutCubic);

    // the slabs behind: sharp at the cut, out of focus after the pull
    c.save();
    c.filter = focusBlur(focus);
    for (const b of BACK) this.slab(c, b.x, b.y, 210, 104, 0.8);
    c.restore();

    // the core: soft at the cut, sharp after the pull
    c.save();
    c.filter = focusBlur(1 - focus);
    this.slab(c, CORE.x, CORE.y, CW, CH, 1);
    drawCue(c, this.cue('converge.core'), t, CORE.x, CORE.y + 11, { color: this.fg, align: 'center', size: 34 });
    c.restore();
    const lit = inn(t, this.t0 + 0.3, 0.6);
    const x0 = CORE.x - CW / 2, x1 = CORE.x + CW / 2, y0 = CORE.y - CH / 2, y1 = CORE.y + CH / 2;
    threadLine(this.glow, [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }], lit * 2 * (CW + CH), 1.5, sig(2));

    // the write-back loop: once around the core on bar 11, closing just before the cut
    const k = move(t, this.at(11), this.t1 - 0.3);
    const ring = Array.from({ length: 97 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 96) * Math.PI * 2;
      return { x: CORE.x + RING * Math.cos(a), y: CORE.y + RING * Math.sin(a) };
    });
    const h = threadLine(this.glow, ring, k * 2 * Math.PI * RING, 2, sig(2.2));
    if (k > 0 && k < 1) threadHead(this.glow, h.x, h.y, 1);

    drawCue(c, this.cue('converge.t1'), t, 240, 930, { color: this.fg });
  }
}
