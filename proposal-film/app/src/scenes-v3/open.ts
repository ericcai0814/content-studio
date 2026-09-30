// v3 shot 1 · open (bars 1-2.5). Black. One point of light comes up at the left end of the horizon and
// pulls the thread across; the title is revealed just behind the head (the mask edge follows the
// point). The title leaves with the cut; the thread's line is matched by the paper's rule in `copies`.
import type { Frame } from '../engine/scene';
import { ease, lerp, prog } from '../engine/util';
import { drawCue, inn, threadHead, threadLine, sig } from '../scenes/_motifs';
import { Shot, Y, LX0, LX1 } from './_v3';

export default class Open extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const title = this.cue('open.title');
    const lit = inn(t, this.t0, 0.6);
    const pull = prog(t, title.start, this.at(2, 2), ease.outExpo);
    const hx = lerp(LX0, LX1, pull);
    const head = threadLine(this.glow, [{ x: LX0, y: Y }, { x: LX1, y: Y }], hx - LX0, 2, sig(2.2));
    threadHead(this.glow, head.x, head.y, lit);
    drawCue(c, title, t, LX0, Y - 56, { color: this.fg, reveal: { x: hx - 20, feather: 140 } });
  }
}
