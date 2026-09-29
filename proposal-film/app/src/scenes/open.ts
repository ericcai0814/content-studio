// Plate 1 · open (0:00–0:10). Black. A teal point comes out of the dark and pulls a line across the
// frame; the title is written behind it. A mono label sits under the line.
import type { Frame } from '../engine/scene';
import { lerp, prog, ease } from '../engine/util';
import { Plate, drawCue, inn, threadHead, threadLine, sig } from './_motifs';

const X0 = 160, X1 = 1760, Y = 600;

export default class Open extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const title = this.cue('open.title'), label = this.cue('open.label');
    // the point surfaces (0.625–1.875), then pulls the line on the title's cue
    const appear = inn(t, 0.625, 1.25);
    const pull = prog(t, title.start, title.start + 1.875, ease.outExpo);
    const hx = lerp(X0, X1, pull);
    // the words leave before the cut; the line stays and carries into the next plate
    const head = threadLine(this.glow, [{ x: X0, y: Y }, { x: X1, y: Y }], hx - X0, 2, sig(2.2));
    threadHead(this.glow, head.x, head.y, appear);

    drawCue(c, title, t, X0, Y - 56, { color: this.fg, clipX: hx });
    drawCue(c, label, t, X0, Y + 76, { color: this.dim });
  }
}
