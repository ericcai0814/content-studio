// Plate 5 · converge (0:52.5–1:14.5). Five translucent rule slabs, one per project, slide along teal
// lines into one core, dept-brain. Projects then only grow small tags (their exceptions), and a thread
// runs from a closing project back into the core: the loop closes. (M1: flat slabs; glass in M3.)
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { lerp } from '../engine/util';
import { Plate, drawCue, inn, move, bezier, pathLen, threadHead, threadLine, sig } from './_motifs';

const START = [360, 660, 960, 1260, 1560].map((x) => ({ x, y: 300 }));
const CORE = { x: 960, y: 420 };
const NODES = [{ x: 420, y: 640 }, { x: 690, y: 690 }, { x: 960, y: 705 }, { x: 1230, y: 690 }, { x: 1500, y: 640 }];
const SW = 210, SH = 110, CW = 300, CH = 150;
const MERGE0 = 55.625, MERGE1 = 57.5;

export default class Converge extends Plate {
  /** A rule slab: sharp corners, like every other shape in the film (one corner system: none). */
  private slab(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number, edge: string) {
    c.save();
    c.globalAlpha = a;
    c.fillStyle = rgba('ink2', 0.85);
    c.strokeStyle = edge; c.lineWidth = 1.5;
    c.beginPath(); c.rect(x - w / 2, y - h / 2, w, h); c.fill(); c.stroke();
    c.restore();
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const m = move(t, MERGE0, MERGE1);
    const core = this.cue('converge.core');
    const t2 = this.cue('converge.t2'), t3 = this.cue('converge.t3');

    // the paths the slabs will travel, drawn just before they move, gone once they have merged
    const pathK = move(t, 54.375, MERGE0);
    const pathA = 1 - m * 0.4 - 0.6 * inn(t, MERGE1, 0.6);
    for (const s of START) threadLine(this.glow, [s, CORE], pathK * Math.hypot(CORE.x - s.x, CORE.y - s.y), 1.4, sig(1.4), pathA);

    // project nodes and their exception tags (after the merge)
    const nk = inn(t, t2.start - 0.625);
    NODES.forEach((n, i) => {
      if (nk <= 0) return;
      c.strokeStyle = rgba('graphite', 0.8 * nk); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(CORE.x, CORE.y + CH / 2); c.lineTo(n.x, n.y); c.stroke();
      c.fillStyle = rgba('ink2', nk); c.strokeStyle = rgba('ash', nk);
      c.beginPath(); c.arc(n.x, n.y, 16, 0, Math.PI * 2); c.fill(); c.stroke();
      const tag = inn(t, t2.start + 0.125 * i, 0.5);
      if (tag > 0) this.glow.seg2(n.x + 22, n.y - 18, n.x + 22 + 26 * tag, n.y - 18, 8, sig(1.3), 1);
    });

    // slabs slide into the core; after the merge only the core remains
    START.forEach((s, i) => {
      const k = move(t, MERGE0 + i * 0.1, MERGE1 - (4 - i) * 0.1);
      const x = lerp(s.x, CORE.x, k), y = lerp(s.y, CORE.y, k);
      this.slab(c, x, y, lerp(SW, CW, k), lerp(SH, CH, k), 1 - inn(t, MERGE1, 0.4) * (i === 2 ? 0 : 1), rgba('ash', 0.8));
      drawCue(c, this.cue(`converge.p${i + 1}`), t, x, y + 11, { color: this.dim, align: 'center' });
    });
    const lit = inn(t, MERGE1, 0.6);
    if (lit > 0) {
      const x0 = CORE.x - CW / 2, x1 = CORE.x + CW / 2, y0 = CORE.y - CH / 2, y1 = CORE.y + CH / 2;
      const r = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }];
      threadLine(this.glow, r, lit * 2 * (CW + CH), 2, sig(2.4));
    }
    drawCue(c, core, t, CORE.x, CORE.y + 12, { color: this.fg, align: 'center', size: 36 });

    // the loop: from the last project's close, back into the core
    const loop = bezier(NODES[4]!, { x: 1760, y: 620 }, { x: 1700, y: 400 }, { x: CORE.x + CW / 2, y: CORE.y });
    const lk = move(t, t3.start + 0.625, t3.start + 2.5);
    const h = threadLine(this.glow, loop, lk * pathLen(loop), 2, sig(2.2));
    if (lk > 0) threadHead(this.glow, h.x, h.y, 1);

    drawCue(c, this.cue('converge.t1'), t, 160, 820, { color: this.fg, size: 56 });
    drawCue(c, t2, t, 160, 895, { color: this.fg, size: 56 });
    drawCue(c, t3, t, 160, 970, { color: this.fg, size: 56 });
  }
}
