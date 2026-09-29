// Plate 1 · open (0:00–0:10). Black. A teal point ignites in the dark (one soft flare as it catches),
// holds for a beat, then pulls a line across the frame; the title is written glyph by glyph just
// behind the moving point. A mono label settles in under the line. The title card hard-cuts out.
import type { Frame } from '../engine/scene';
import { lerp, prog, ease } from '../engine/util';
import { Plate, drawCue, inn, threadHead, threadLine, sig } from './_motifs';

const X0 = 160, X1 = 1760, Y = 600;
/** The point catches on the second beat. */
const IGNITE = 0.625;

export default class Open extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const title = this.cue('open.title'), label = this.cue('open.label');
    const lit = inn(t, IGNITE, 1.25);
    // one flare as it catches: a wide soft halo that swells and settles (not a loop)
    const flare = prog(t, IGNITE, IGNITE + 1.1);
    if (flare > 0 && flare < 1) this.glow.seg2(X0, Y, X0 + 0.01, Y, lerp(40, 190, ease.outExpo(flare)), sig(0.9), 0.35 * (1 - flare));
    // then the pull, on the title's cue; the words are written just behind the head
    const pull = prog(t, title.start, title.start + 1.875, ease.outExpo);
    const hx = lerp(X0, X1, pull);
    const head = threadLine(this.glow, [{ x: X0, y: Y }, { x: X1, y: Y }], hx - X0, 2, sig(2.2));
    threadHead(this.glow, head.x, head.y, lit);

    drawCue(c, title, t, X0, Y - 56, { color: this.fg, reveal: { x: hx - 20, feather: 140 } });
    drawCue(c, label, t, X0, Y + 76, { color: this.dim });
  }
}
