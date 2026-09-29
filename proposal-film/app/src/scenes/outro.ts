// Plate 8 · outro (1:40–1:45). Black, the bookend of the open: the teal line lies where the title
// was written, retracts into a single point, the point holds, and only the department's name stays
// under it while the film fades out.
import type { Frame } from '../engine/scene';
import { lerp, prog, ease } from '../engine/util';
import { Plate, drawCue, move, threadHead, threadLine, sig } from './_motifs';

// the open's line (open.ts), so the film ends where it began
const X0 = 160, X1 = 1760, Y = 600;
const FADE0 = 103.75, FADE1 = 105;

export default class Outro extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const back = move(t, 100.3125, 101.25);
    const hx = lerp(X1, X0, back);
    threadLine(this.glow, [{ x: X0, y: Y }, { x: X1, y: Y }], hx - X0, 2, sig(2.2));
    threadHead(this.glow, hx, Y, 1);
    drawCue(c, this.cue('outro.label'), t, X0, Y + 76, { color: this.dim });
    return { fade: prog(t, FADE0, FADE1, ease.inOutCubic) };
  }
}
