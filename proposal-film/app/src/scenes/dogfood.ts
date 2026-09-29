// Plate 7 · dogfood (1:30–1:40). Black line drawing. The department as a dashed boundary holding the
// dept-brain core and its five project nodes. The teal thread leaves the core, runs around the
// department and comes back into it: first used on ourselves. The five nodes relight one by one (our
// own pain points solved). Far off to the right a product outline sits dark; it lights, and a dashed
// link reaches it, only on the last line: validated first, then a product.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { lerp } from '../engine/util';
import { Plate, drawCue, inn, move, bezier, pathLen, threadHead, threadLine, sig, STYLE } from './_motifs';
import { measure } from '../engine/type';

const DEPT = { x0: 200, y0: 190, x1: 1180, y1: 740 };
const CORE = { x: 690, y: 330, w: 300, h: 120 };
const NODES = [330, 510, 690, 870, 1050].map((x) => ({ x, y: 620 }));
const PROD = { x: 1560, y: 400, w: 150, h: 70 };

export default class Dogfood extends Plate {
  /** An isometric box outline centred at (x, y): top face half-width w, half-height h, depth d. */
  private box(x: number, y: number, w: number, h: number, d: number) {
    const top = [{ x, y: y - h }, { x: x + w, y }, { x, y: y + h }, { x: x - w, y }];
    return [top[3]!, top[0]!, top[1]!, { x: x + w, y: y + d }, { x, y: y + h + d }, { x: x - w, y: y + d }, top[3]!, top[2]!, top[1]!, top[2]!, { x, y: y + h + d }];
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const t1 = this.cue('dogfood.t1'), t2 = this.cue('dogfood.t2'), t3 = this.cue('dogfood.t3');

    // the department: a dashed boundary, on screen from the cut
    c.save();
    c.setLineDash([10, 8]);
    c.strokeStyle = rgba('ash', 0.4); c.lineWidth = 1.5;
    c.strokeRect(DEPT.x0, DEPT.y0, DEPT.x1 - DEPT.x0, DEPT.y1 - DEPT.y0);
    c.restore();

    // core and its hairlines to the projects
    c.strokeStyle = rgba('graphite', 0.9); c.lineWidth = 1.2;
    c.beginPath();
    for (const n of NODES) { c.moveTo(CORE.x, CORE.y + CORE.h / 2); c.lineTo(n.x, n.y); }
    c.stroke();
    c.fillStyle = rgba('ink2', 1); c.strokeStyle = rgba('ash', 0.7); c.lineWidth = 1.5;
    c.fillRect(CORE.x - CORE.w / 2, CORE.y - CORE.h / 2, CORE.w, CORE.h);
    c.strokeRect(CORE.x - CORE.w / 2, CORE.y - CORE.h / 2, CORE.w, CORE.h);
    drawCue(c, this.cue('dogfood.core'), t, CORE.x, CORE.y + 12, { color: this.fg, align: 'center', size: 36 });

    // the thread leaves the core, goes around the department and comes back into it
    const R = CORE.x + CORE.w / 2, L = CORE.x - CORE.w / 2;
    const loop = [
      ...bezier({ x: R, y: CORE.y }, { x: 1080, y: CORE.y }, { x: 1130, y: 560 }, { x: 1080, y: 700 }),
      ...bezier({ x: 1080, y: 700 }, { x: 900, y: 720 }, { x: 480, y: 720 }, { x: 300, y: 700 }),
      ...bezier({ x: 300, y: 700 }, { x: 250, y: 560 }, { x: 300, y: CORE.y }, { x: L, y: CORE.y }),
    ];
    const lk = move(t, t1.start, t1.start + 2.25);
    const h = threadLine(this.glow, loop, lk * pathLen(loop), 2, sig(2.2));
    if (lk > 0) threadHead(this.glow, h.x, h.y, 1);

    // the projects: dark, then relit one by one on the second line
    NODES.forEach((n, i) => {
      const k = inn(t, t2.start + 0.125 * i, 0.5);
      c.fillStyle = rgba('ink2', 1); c.strokeStyle = rgba('ash', lerp(0.5, 0.9, k)); c.lineWidth = 1.5;
      c.beginPath(); c.arc(n.x, n.y, 16, 0, Math.PI * 2); c.fill(); c.stroke();
      if (k > 0) threadHead(this.glow, n.x, n.y, 0.75 * k);
    });

    // the product, far off and dark until the last line
    const pk = inn(t, t3.start, 0.8);
    const prod = this.box(PROD.x, PROD.y, PROD.w, PROD.h, 60);
    c.save();
    c.setLineDash([6, 6]);
    c.strokeStyle = rgba('graphite', 0.7); c.lineWidth = 1.5;
    c.beginPath(); prod.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.restore();
    if (pk > 0) {
      threadLine(this.glow, prod, pk * pathLen(prod), 1.5, sig(2));
      const link = [{ x: DEPT.x1, y: PROD.y }, { x: PROD.x - PROD.w, y: PROD.y }];
      c.save();
      c.setLineDash([10, 8]);
      c.strokeStyle = rgba('signal', 0.9 * pk); c.lineWidth = 3;
      c.beginPath(); c.moveTo(link[0]!.x, link[0]!.y); c.lineTo(lerp(link[0]!.x, link[1]!.x, pk), link[1]!.y); c.stroke();
      c.restore();
    }

    const size = 56;
    drawCue(c, t1, t, 160, 820, { color: this.fg, size });
    const tagX = 160 + measure(t1.text, STYLE.headline!.f, size) + 28;
    drawCue(c, this.cue('dogfood.tag'), t, tagX, 816, { color: rgba('signal', 1) });
    drawCue(c, t2, t, 160, 895, { color: this.fg, size });
    drawCue(c, t3, t, 160, 970, { color: this.fg, size });
  }
}
