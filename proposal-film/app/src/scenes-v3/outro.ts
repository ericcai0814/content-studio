// v3 shot 11 · outro (bars 19-20). Black, the bookend of the open. At the cut the horizon thread is where
// dogfood B last showed it; it retracts into a single point at the open's LX0 (landing on bar 19 beat 3,
// with the chime), the point holds, the department's name settles under it, and the film fades to ink.
import type { Frame } from '../engine/scene';
import { ease, lerp, prog } from '../engine/util';
import { drawCue, move, threadHead, threadLine, sig } from '../scenes/_motifs';
import { Shot, Y, LX0, PUSH, zoomed } from './_v3';
import { CORE, CW, LINE_X0 } from './dogfood-a';

export default class Outro extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const label = this.cue('outro.label');
    // the thread as dogfood B's push-in left it (A-space pushed in twice)
    const z2 = (1 + PUSH) * (1 + PUSH);
    const x0 = zoomed({ x: LINE_X0, y: Y }, z2).x, x1 = zoomed({ x: CORE.x - CW / 2, y: Y }, z2).x;
    const back = move(t, this.t0, this.at(19, 3));
    const left = lerp(x0, LX0, back), right = lerp(x1, LX0, back);
    threadLine(this.glow, [{ x: left, y: Y }, { x: right, y: Y }], right - left, 2, sig(2.2));
    threadHead(this.glow, right, Y, 1);
    drawCue(c, label, t, LX0, Y + 84, { color: this.dim, size: 44 });
    return { fade: prog(t, label.end, this.t1, ease.inOutCubic) };
  }
}
