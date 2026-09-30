// v3 shot 7 · schedule A (bars 12-13). Bone paper. At the cut the write-back ring becomes the W0 seal
// (same place and size as it was last seen in converge B). On beat 2 the seal is pressed (drops from
// 106 %, outExpo; its inside takes a pale teal tint and the W0 mark). The route to the right is revealed
// by a mask running left to right, then the point sets off along it. The stop rule is the one line.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { lerp } from '../engine/util';
import { drawCue, inn, move, threadHeadInk, sig } from '../scenes/_motifs';
import { Shot, Y, PUSH, zoomed } from './_v3';
import { CORE, RING } from './converge-b';

/** Route: from the seal's right edge off to the right; weekly ticks every TICK px. */
export const TICK = 150;

/** A seal: the teal ring (4 px ink-weight), tinted inside once pressed. */
export function seal(c: CanvasRenderingContext2D, x: number, y: number, r: number, press: number, dashed: boolean) {
  c.save();
  c.translate(x, y);
  const s = 1 + 0.06 * (1 - press);
  c.scale(s, s);
  if (press > 0) {
    c.fillStyle = rgba('signal', 0.08 * press);
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  }
  c.strokeStyle = dashed && press <= 0 ? rgba('graphite', 0.7) : rgba('signal', 1);
  c.lineWidth = 4;
  if (dashed && press <= 0) c.setLineDash([10, 9]);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
  c.restore();
}

export default class ScheduleA extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const at = zoomed(CORE, 1 + PUSH), r = RING * (1 + PUSH);
    const w0 = this.cue('schedule.w0');
    const press = inn(t, w0.start, 0.35);

    // the route, revealed left to right from the seal on beat 2 through the end of bar 12
    const x0 = at.x + r, x1 = 1860;
    const reveal = move(t, w0.start, this.at(13));
    c.fillStyle = rgba('ink', 0.55);
    c.fillRect(x0, Y - 1, (x1 - x0) * reveal, 2);
    for (let x = x0 + TICK; x < x0 + (x1 - x0) * reveal; x += TICK) c.fillRect(x - 1, Y - 10, 2, 20);

    // the point sets off on bar 13 and is halfway along when the shot ends
    const go = move(t, this.at(13), this.t1 + 0.6);
    const hx = lerp(x0, x1, 0.55 * go);
    if (go > 0) this.ink.seg2(x0, Y, hx, Y, 4, sig(1));
    threadHeadInk(this.ink, go > 0 ? hx : x0, Y, inn(t, this.at(13), 0.4));

    seal(c, at.x, at.y, r, press, false);
    drawCue(c, w0, t, at.x, at.y + 17, { color: this.fg, align: 'center', size: 48, still: true });

    drawCue(c, this.cue('schedule.n2'), t, 240, 930, { color: this.fg });
    return { paper: 1 };
  }
}
