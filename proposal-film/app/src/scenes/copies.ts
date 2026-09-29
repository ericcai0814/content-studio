// Plate 2 · copies (0:10–0:25). Bone paper. The rules document lies on the desk from the cut; on the
// beat it is stamped, and four more copies are stamped down beside it, one a beat, each pressed in
// (drops, shadow tightens, one impression ring) and then drifting on its own. Red correction marks
// circle a line on three copies and red leaders run from them to their notes. The counters roll; the
// line: the same rules, written five times. The thread hops through the copies as they are stamped.
import type { Frame } from '../engine/scene';
import { LIN, rgba } from '../engine/palette';
import { clamp, lerp, hash, prog, ease } from '../engine/util';
import { Plate, drawCue, inn, cueVis, rollNumber, threadHeadInk, threadLine, sig, STYLE } from './_motifs';
import { measure } from '../engine/type';

const SW = 250, SH = 330, X0 = 170, STEP = 205, Y0 = 190;
/** Sheet i is stamped at this time (sheet 0, the original, is on screen from the cut). */
const stampT = (i: number) => 10.625 + 0.625 * i;
/** The correction mark on a sheet, in sheet space. */
const MARK = { x: 18, y: 20, w: SW * 0.55 + 12, h: 26 };
const NOTE_X = X0, NOTE_Y = 640, NOTE_DY = 72;

export default class Copies extends Plate {
  /** Where sheet i sits at time t: top-left, rotation, press progress, visibility. */
  private sheet(i: number, t: number) {
    const st = stampT(i);
    const press = inn(t, st, 0.35);
    // after the press each copy drifts on its own, slowly and linearly (no loop); the original stays
    const since = Math.max(0, t - st - 0.35);
    const drift = i > 0 ? 1 : 0;
    const dx = (hash(i, 3) - 0.3) * 5 * since * drift;
    const dy = (hash(i, 5) - 0.5) * 3 * since * drift;
    const rot = ((hash(i, 7) - 0.5) * 0.05 + (hash(i, 11) - 0.5) * 0.004 * since) * drift;
    const a = i === 0 ? 1 : clamp((t - st) / 0.08);
    return { x: X0 + STEP * i + dx, y: Y0 + dy, rot, press, a };
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const ink = rgba('ink', 0.7), hair = rgba('graphite', 0.55), red = rgba('redline', 1);
    const doc = this.cue('copies.doc');
    const notes = [this.cue('copies.note1'), this.cue('copies.note2'), this.cue('copies.note3')];

    // sheets, back to front
    for (let i = 4; i >= 0; i--) {
      const s = this.sheet(i, t);
      if (s.a <= 0) continue;
      const pressing = t >= stampT(i) ? 1 - s.press : 0; // 1 at the moment of the stamp, 0 once pressed
      const sc = 1 + 0.07 * pressing;
      c.save();
      c.globalAlpha = s.a;
      c.translate(s.x + SW / 2, s.y + SH / 2);
      c.rotate(s.rot);
      // shadow: lifted while it comes down, tight once it is on the paper
      const sh = lerp(3, 16, pressing);
      c.fillStyle = rgba('ink', 0.08);
      c.fillRect(-SW / 2 + sh * 0.4, -SH / 2 + sh, SW, SH);
      c.scale(sc, sc);
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
      // correction mark on the copy that note i-1 points at (copies 1..3), drawn around as its note lands
      const n = notes[i - 1];
      if (n) {
        const m = inn(t, n.start, 0.5);
        c.strokeStyle = red; c.lineWidth = 3;
        c.beginPath(); c.rect(MARK.x, MARK.y, MARK.w * m, MARK.h); c.stroke();
      }
      c.restore();
      // one impression ring at the stamp
      const ring = prog(t, stampT(i), stampT(i) + 0.45);
      if (ring > 0 && ring < 1) {
        const g = lerp(0, 18, ease.outExpo(ring));
        c.strokeStyle = rgba('ink', 0.35 * (1 - ring)); c.lineWidth = 2;
        c.strokeRect(s.x - g, s.y - g, SW + 2 * g, SH + 2 * g);
      }
    }

    // the thread: enters from the left edge onto the original, then hops to each copy as it is stamped
    const pts = [{ x: 96, y: Y0 + 33 }];
    for (let i = 0; i < 5; i++) {
      if (i > 0 && t < stampT(i)) break;
      const s = this.sheet(i, t);
      pts.push({ x: s.x + 24, y: s.y + 33 });
    }
    const head = threadLine(this.ink, pts, 1e5, 2, sig(1));
    threadHeadInk(this.ink, head.x, head.y, 1);

    drawCue(c, doc, t, X0, 150, { color: this.dim });
    notes.forEach((n, k) => {
      const y = NOTE_Y + k * NOTE_DY;
      const a = cueVis(t, n);
      drawCue(c, n, t, NOTE_X, y, { color: red });
      // red leader: from the note's end, across, then up to the bottom of its mark on sheet k+1
      const s = this.sheet(k + 1, t);
      const sx = NOTE_X + measure(n.text, STYLE.annotation!.f, STYLE.annotation!.size) + 18, sy = y - 14;
      const mx = s.x + MARK.x + MARK.w * 0.5, my = s.y + MARK.y + MARK.h;
      const vx = Math.max(mx, sx + 24);
      const lead = [{ x: sx, y: sy }, { x: vx, y: sy }, { x: vx, y: my }];
      const len = (vx - sx) + (sy - my);
      threadLine(this.ink, lead, prog(t, n.start + 0.2, n.start + 0.9, ease.inOutCubic) * len, 1, LIN.redline, a);
    });
    const c1 = this.cue('copies.count1'), c2 = this.cue('copies.count2');
    drawCue(c, c1, t, 1340, 660, { color: this.fg, text: rollNumber(c1.text, inn(t, c1.start, 0.625)) });
    drawCue(c, c2, t, 1340, 730, { color: this.fg, text: rollNumber(c2.text, inn(t, c2.start, 0.625)) });
    drawCue(c, this.cue('copies.main'), t, X0, 930, { color: this.fg });
    return { paper: 1 };
  }
}
