// Plate 2 · copies (0:10–0:25). Bone paper. One rules document is stamped into five copies that drift
// apart; red correction marks surface one by one; the counters roll; the line: the same rules, written
// five times. The thread hops through the copies as they are stamped. (M1: simplified sheets.)
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { clamp, lerp, hash } from '../engine/util';
import { Plate, drawCue, inn, cueVis, rollNumber, threadHeadInk, threadLine, sig } from './_motifs';

const SW = 250, SH = 330, X0 = 170, STEP = 205, Y0 = 190;
/** Sheet i is stamped at this time (sheet 0 is the original, on screen from the cut). */
const stampT = (i: number) => 10.625 + 0.625 * i;

export default class Copies extends Plate {
  /** Where sheet i sits at time t (x, y of its top-left, rotation). */
  private sheet(i: number, t: number) {
    const land = inn(t, stampT(i), 0.6);
    // after landing each copy drifts on its own, slowly and linearly (no loop)
    const since = Math.max(0, t - stampT(i) - 0.6);
    const dx = (hash(i, 3) - 0.3) * 5 * since * (i > 0 ? 1 : 0);
    const dy = (hash(i, 5) - 0.5) * 3 * since * (i > 0 ? 1 : 0);
    const rot = (hash(i, 7) - 0.5) * 0.05 * land * (i > 0 ? 1 : 0) + (hash(i, 11) - 0.5) * 0.004 * since;
    return { x: lerp(X0, X0 + STEP * i, land) + dx, y: Y0 + dy, rot, a: i === 0 ? 1 : clamp(land * 3) };
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const ink = rgba('ink', 0.7), hair = rgba('graphite', 0.55), red = rgba('redline', 1);
    const doc = this.cue('copies.doc');
    const notes = [this.cue('copies.note1'), this.cue('copies.note2'), this.cue('copies.note3')];

    // sheets, back to front (copies slide out from under the original)
    for (let i = 4; i >= 0; i--) {
      const s = this.sheet(i, t);
      if (s.a <= 0) continue;
      c.save();
      c.globalAlpha = s.a;
      c.translate(s.x + SW / 2, s.y + SH / 2);
      c.rotate(s.rot);
      c.translate(-SW / 2, -SH / 2);
      c.fillStyle = rgba('bone', 1);
      c.fillRect(0, 0, SW, SH);
      c.strokeStyle = ink; c.lineWidth = 1.5;
      c.strokeRect(0, 0, SW, SH);
      // header block and body lines stand in for the document's text (identical on every copy)
      c.fillStyle = rgba('ink', 0.75);
      c.fillRect(24, 28, SW * 0.55, 10);
      c.fillStyle = hair;
      for (let k = 0; k < 11; k++) c.fillRect(24, 70 + k * 22, (SW - 48) * (0.55 + 0.45 * hash(k, 1)), 3);
      // correction mark on the copy that note k points at (copies 1..3)
      const n = notes[i - 1];
      if (n) {
        const m = inn(t, n.start, 0.5);
        c.strokeStyle = red; c.lineWidth = 3;
        c.beginPath(); c.rect(18, 20, (SW * 0.55 + 12) * m, 26); c.stroke();
      }
      c.restore();
    }

    // the thread: enters from the left edge onto the original, then hops to each copy as it is stamped
    const pts = [{ x: 96, y: Y0 + 33 }];
    for (let i = 0; i < 5; i++) {
      const s = this.sheet(i, t);
      if (i > 0 && t < stampT(i)) break;
      pts.push({ x: s.x + 24, y: s.y + 33 });
    }
    const head = threadLine(this.ink, pts, 1e5, 2, sig(1));
    threadHeadInk(this.ink, head.x, head.y, 1);

    drawCue(c, doc, t, X0, 150, { color: this.dim });
    notes.forEach((n, k) => {
      const y = 640 + k * 72;
      const a = cueVis(t, n);
      c.fillStyle = rgba('redline', a);
      c.fillRect(X0, y - 30, 6, 34);
      drawCue(c, n, t, X0 + 26, y, { color: red });
    });
    const c1 = this.cue('copies.count1'), c2 = this.cue('copies.count2');
    drawCue(c, c1, t, 1340, 660, { color: this.fg, text: rollNumber(c1.text, inn(t, c1.start, 0.625)) });
    drawCue(c, c2, t, 1340, 730, { color: this.fg, text: rollNumber(c2.text, inn(t, c2.start, 0.625)) });
    drawCue(c, this.cue('copies.main'), t, X0, 930, { color: this.fg });
    return { paper: 1 };
  }
}
