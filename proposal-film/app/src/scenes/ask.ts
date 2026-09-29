// Plate 8 · ask (1:40–1:52.5). Bone paper form: the three decisions as check boxes. The point moves
// from box to box and ticks each as it appears; the amber stamp (the only amber in the film) sets the
// meeting (a solid amber block, ink type). The point stops in the last box and the film fades out.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { lerp, prog, ease } from '../engine/util';
import { Plate, drawCue, inn, move, threadHeadInk, threadLine, sig, STYLE } from './_motifs';
import { measure } from '../engine/type';

const FX0 = 160, FX1 = 1320, FY0 = 150, FY1 = 930;
const ROWS = [430, 550, 670];
const BOX = 44, BX = 220, TX = 300;
const FADE0 = 111.25, FADE1 = 112.5;

export default class Ask extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const items = [this.cue('ask.c1'), this.cue('ask.c2'), this.cue('ask.c3')];
    const stamp = this.cue('ask.stamp');

    // the form, whole from the cut
    c.strokeStyle = rgba('ink', 0.6); c.lineWidth = 1.5;
    c.strokeRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
    c.fillStyle = rgba('ink', 0.35);
    c.fillRect(FX0 + 60, 310, FX1 - FX0 - 120, 1.5);
    drawCue(c, this.cue('ask.title'), t, FX0 + 60, 260, { color: this.fg, size: 56 });

    // boxes and their ticks; the point travels from box to box
    let px = BX + BOX / 2, py = ROWS[0]! - BOX / 2 + 4;
    items.forEach((it, i) => {
      const y = ROWS[i]!, bx = BX, by = y - BOX + 6;
      c.strokeStyle = rgba('ink', 0.75); c.lineWidth = 2;
      c.strokeRect(bx, by, BOX, BOX);
      const tick = [{ x: bx + 9, y: by + 23 }, { x: bx + 19, y: by + 34 }, { x: bx + 37, y: by + 10 }];
      const k = inn(t, it.start, 0.5);
      threadLine(this.ink, tick, k * 50, 4, sig(1));
      drawCue(c, it, t, TX, y, { color: this.fg });
      // the point moves into this box over the half second before its item appears
      const m = move(t, it.start - 0.625, it.start);
      if (i === 0 || t >= it.start - 0.625) {
        px = lerp(px, bx + BOX / 2, i === 0 ? 1 : m);
        py = lerp(py, by + BOX / 2, i === 0 ? 1 : m);
      }
    });
    threadHeadInk(this.ink, px, py, inn(t, 101.875));

    // the amber stamp
    const st = STYLE.stamp!;
    const size = 44, tw = measure(stamp.text, st.f, size), pad = 22;
    const k = inn(t, stamp.start, 0.5);
    if (k > 0) {
      const cx = 1330, cy = 800, sc = lerp(1.12, 1, k);
      c.save();
      c.globalAlpha = Math.min(1, k * 2);
      c.translate(cx, cy); c.rotate(-0.06); c.scale(sc, sc);
      // a solid amber block with ink type: amber type on bone paper would not read
      c.fillStyle = rgba('amber', 1);
      c.fillRect(-tw / 2 - pad, -size / 2 - pad, tw + pad * 2, size + pad * 2);
      c.restore();
      drawCue(c, stamp, t, cx, cy + size * 0.36, { color: rgba('ink', 0.95), align: 'center', size, rot: -0.06 });
    }
    return { paper: 1, fade: prog(t, FADE0, FADE1, ease.inOutCubic) };
  }
}
