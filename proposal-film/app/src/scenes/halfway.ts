// Plate 4 · halfway (0:37.5–0:52.5). Wireframe. Five projects' six-part skeletons, each drawn as a
// stack of six folder bars, start apart and slide into exact register; where they coincide the
// additive lines add up, and at the hash match they turn teal. TSMC's numbers in the right column.
// (M1: 2D wireframe; the engraved 3D version is M2.)
import type { Frame } from '../engine/scene';
import { LIN } from '../engine/palette';
import { hash, lerp } from '../engine/util';
import { Plate, drawCue, inn, move, threadHead, threadLine, sig } from './_motifs';

const SX = 160, SY = 200, BW = 600, BH = 40, GAP = 58, ROWS = 6;
const MATCH = 42.5;

export default class Halfway extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const lit = inn(t, MATCH, 0.6);
    for (let p = 0; p < 5; p++) {
      // each project's copy starts offset and slides into register (staggered)
      const k = move(t, 38.75 + p * 0.5, 41.25 + p * 0.25);
      const ox = lerp((hash(p, 1) - 0.5) * 220, 0, k), oy = lerp((hash(p, 2) - 0.5) * 120, 0, k);
      const skew = lerp((hash(p, 3) - 0.5) * 0.25, 0, k);
      // grey wire (0.22 each, so five in register read brighter) turning teal on the match
      const rgb: [number, number, number] = [
        lerp(LIN.ash[0] * 0.22, LIN.signal[0] * 0.75, lit),
        lerp(LIN.ash[1] * 0.22, LIN.signal[1] * 0.75, lit),
        lerp(LIN.ash[2] * 0.22, LIN.signal[2] * 0.75, lit),
      ];
      for (let r = 0; r < ROWS; r++) {
        const y = SY + r * GAP + oy, x = SX + ox + r * 26 * skew * 4 + r * 18;
        const w = BW - r * 36;
        const q = [{ x, y }, { x: x + w, y }, { x: x + w, y: y + BH }, { x, y: y + BH }, { x, y }];
        for (let i = 1; i < q.length; i++) this.glow.seg2(q[i - 1]!.x, q[i - 1]!.y, q[i]!.x, q[i]!.y, 1.5, rgb, 1);
      }
    }
    // the hash mark: a lead from the matched stack to its label
    const md5 = this.cue('halfway.md5');
    const lead = inn(t, md5.start, 0.6);
    const ly = SY + 2 * GAP + BH / 2;
    const h = threadLine(this.glow, [{ x: SX + BW - 36 * 2 + 18 * 2, y: ly }, { x: 820, y: ly }], lead * 120, 2, sig(2));
    if (lead > 0) threadHead(this.glow, h.x, h.y, 0.8 * lead);
    drawCue(c, md5, t, 845, ly + 11, { color: this.fg });

    drawCue(c, this.cue('halfway.five'), t, SX, 610, { color: this.dim });
    drawCue(c, this.cue('halfway.tsmc'), t, 1240, 300, { color: this.dim });
    drawCue(c, this.cue('halfway.n1'), t, 1240, 375, { color: this.fg });
    drawCue(c, this.cue('halfway.n2'), t, 1240, 440, { color: this.fg });
    drawCue(c, this.cue('halfway.n3'), t, 1240, 505, { color: this.fg });
    drawCue(c, this.cue('halfway.main'), t, SX, 830, { color: this.fg });
    drawCue(c, this.cue('halfway.main2'), t, SX, 915, { color: this.fg });
  }
}
