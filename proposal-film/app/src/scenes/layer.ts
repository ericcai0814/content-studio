// Plate 7 · layer (1:30–1:40). The company AI platform as a stack of five isometric slabs (ACROSS);
// the third from the bottom, 03 data & knowledge, slides out of the stack and lights teal.
// (M1: flat isometric outlines; three.js slabs in M3.)
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { Plate, drawCue, inn, move, threadLine, sig } from './_motifs';

const CX = 1300, BASE_Y = 660, GAP = 88, HW = 330, HH = 92, THICK = 18;
const KNOW = 2; // 03, counted from the bottom

export default class Layer extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const label = this.cue('layer.label');
    const lift = move(t, 91.25, 92.5);
    // bottom to top, so upper slabs overlap lower ones; all on screen from the cut, settling in
    for (let i = 0; i < 5; i++) {
      const up = inn(t, 90 + i * 0.125, 0.6);
      const isK = i === KNOW;
      const x = CX - (isK ? lift * 170 : 0);
      const y = BASE_Y - i * GAP - (isK ? lift * 10 : 0) + (1 - up) * 30;
      const top = [{ x, y: y - HH }, { x: x + HW, y }, { x, y: y + HH }, { x: x - HW, y }];
      c.save();
      // side faces (thickness), then the top face
      c.fillStyle = rgba('ink2', 1);
      c.beginPath();
      c.moveTo(top[3]!.x, top[3]!.y); c.lineTo(top[2]!.x, top[2]!.y); c.lineTo(top[1]!.x, top[1]!.y);
      c.lineTo(top[1]!.x, top[1]!.y + THICK); c.lineTo(top[2]!.x, top[2]!.y + THICK); c.lineTo(top[3]!.x, top[3]!.y + THICK);
      c.closePath(); c.fill();
      c.strokeStyle = rgba('graphite', 1); c.lineWidth = 1.2; c.stroke();
      c.beginPath();
      top.forEach((p, k) => (k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      c.closePath();
      c.fillStyle = rgba('ink2', 1); c.fill();
      c.strokeStyle = rgba('ash', 0.7); c.stroke();
      c.restore();
      if (isK) {
        const ring = [...top, top[0]!];
        threadLine(this.glow, ring, lift * 4 * Math.hypot(HW, HH), 2, sig(2.4));
      }
    }
    // a lead from the lifted slab's left corner to its label
    const lx = CX - 170 - HW, ly = BASE_Y - KNOW * GAP - 10;
    const lk = inn(t, label.start - 0.3, 0.6);
    threadLine(this.glow, [{ x: lx, y: ly }, { x: lx - 60, y: ly }], lk * 60, 1.6, sig(1.8));
    drawCue(c, label, t, lx - 76, ly + 13, { color: this.fg, align: 'right', size: 36 });
    drawCue(c, this.cue('layer.main'), t, 160, 900, { color: this.fg });
  }
}
