// Plate 6 · schedule (1:15–1:30). Bone paper roadmap. The point travels the W0–W8 route and stamps
// the four dates as it passes (the same press as the copies plate); the travelled route turns teal.
// Two side notes: no budget, no headcount, ~16 h a week; stop unless more than half the criteria pass.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { clamp, ease, lerp, prog } from '../engine/util';
import { Plate, drawCue, guardBox, inn, move, threadHeadInk, sig, STYLE, EXIT } from './_motifs';
import { measure } from '../engine/type';

const RX0 = 200, RX1 = 1720, RY = 450;
const wx = (w: number) => lerp(RX0, RX1, w / 8);
/** Stamp i: where on the route (in weeks), above (-1) or below (+1) the route, and its alignment. */
const STAMPS = [
  { id: 'schedule.s1', w: 2, side: -1, align: 'center' as const },
  { id: 'schedule.s2', w: 4, side: 1, align: 'center' as const },
  { id: 'schedule.s3', w: 5.5, side: -1, align: 'center' as const },
  { id: 'schedule.s4', w: 8, side: 1, align: 'right' as const },
];

export default class Schedule extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const cues = STAMPS.map((s) => this.cue(s.id));

    // where the point is along the route (in weeks): W0 at the first label, then each stamp on its cue
    let w = 0;
    let prevT = 76.25, prevW = 0;
    for (let i = 0; i < STAMPS.length; i++) {
      const k = move(t, prevT, cues[i]!.start);
      w = lerp(prevW, STAMPS[i]!.w, k);
      if (t < cues[i]!.start) break;
      prevT = cues[i]!.start + 0.3; prevW = STAMPS[i]!.w;
    }
    const hx = wx(w);

    // the route, whole from the cut; the travelled part in teal
    c.fillStyle = rgba('ink', 0.55);
    c.fillRect(RX0, RY - 1, RX1 - RX0, 2);
    for (let i = 0; i <= 8; i++) {
      c.fillRect(wx(i) - 1, RY - 10, 2, 20);
      drawCue(c, this.cue(`schedule.w${i}`), t, wx(i), RY + 58, { color: this.dim, align: 'center', size: 30 });
    }
    this.ink.seg2(RX0, RY, hx, RY, 4, sig(1));
    threadHeadInk(this.ink, hx, RY, inn(t, 75.625));

    // stamps, in the copies plate's language: pressed down on the beat (drops from 107%, outExpo),
    // one impression ring; the type is part of the stamp, so it scales and turns with the frame
    STAMPS.forEach((s, i) => {
      const cue = cues[i]!;
      if (t < cue.start) return;
      const st = STYLE.stamp!;
      const tw = measure(cue.text, st.f, st.size), pad = 20;
      const x = wx(s.w), bw = tw + pad * 2, bh = st.size + pad * 2;
      const cy = RY + s.side * (s.side < 0 ? 130 : 190);
      const cx = s.align === 'center' ? x : x - bw / 2;
      const rot = -0.03 + 0.012 * i;
      const press = inn(t, cue.start, 0.35);
      const a = clamp((t - cue.start) / 0.08) * (1 - prog(t, cue.end, cue.end + EXIT, ease.inOutCubic));
      guardBox(cue.id, { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh });
      c.save();
      c.globalAlpha = a;
      c.translate(cx, cy);
      c.rotate(rot);
      c.scale(1 + 0.07 * (1 - press), 1 + 0.07 * (1 - press));
      c.strokeStyle = rgba('signal', 1); c.lineWidth = 3;
      c.strokeRect(-bw / 2, -bh / 2, bw, bh);
      drawCue(c, cue, t, 0, st.size * 0.36, { color: rgba('signal', 1), align: 'center', local: true, still: true });
      c.restore();
      const ring = prog(t, cue.start, cue.start + 0.45);
      if (ring > 0 && ring < 1) {
        const g = lerp(0, 16, ease.outExpo(ring));
        c.save();
        c.translate(cx, cy); c.rotate(rot);
        c.strokeStyle = rgba('signal', 0.35 * (1 - ring)); c.lineWidth = 2;
        c.strokeRect(-bw / 2 - g, -bh / 2 - g, bw + 2 * g, bh + 2 * g);
        c.restore();
      }
      // (a lead below the route starts under the week labels)
      this.ink.seg2(x, RY + (s.side < 0 ? -14 : 76), x, cy - s.side * bh / 2, 2, sig(1), a);
    });

    drawCue(c, this.cue('schedule.n1'), t, 160, 850, { color: this.fg });
    drawCue(c, this.cue('schedule.n2'), t, 160, 925, { color: this.fg });
    return { paper: 1 };
  }
}
