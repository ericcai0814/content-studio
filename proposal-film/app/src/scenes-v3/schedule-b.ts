// v3 shot 8 · schedule B (bar 14 to bar 15 beat 3). The other end of the route. The route is revealed
// left to right at the cut (mask); W8 waits inside a dashed ring. The point runs in along the route and
// reaches the ring on bar 14 beat 3, where the W8 seal is pressed. The route (travelled part teal) is
// what dogfood A cuts on.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { lerp } from '../engine/util';
import { drawCue, inn, move, threadHeadInk, sig } from '../scenes/_motifs';
import { Shot, Y } from './_v3';
import { RING } from './converge-b';
import { TICK, seal } from './schedule-a';

/** The W8 seal's centre; dogfood-a.ts puts the core here. */
export const W8 = { x: 1380, y: Y };
/** Where the route enters from the left: chosen so that, pushed in by two shots (dogfood A and B), the
 * horizon thread starts at the open's LX0 again when the outro retracts it. */
export const ROUTE_X0 = 301;

export default class ScheduleB extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const stamp = this.at(14, 3);
    const x1 = W8.x - RING;
    const reveal = move(t, this.t0, this.t0 + 0.5);
    c.fillStyle = rgba('ink', 0.55);
    c.fillRect(ROUTE_X0, Y - 1, (x1 - ROUTE_X0) * reveal, 2);
    for (let x = x1 - TICK; x > ROUTE_X0; x -= TICK) if (x < ROUTE_X0 + (x1 - ROUTE_X0) * reveal) c.fillRect(x - 1, Y - 10, 2, 20);

    // the point arrives at the ring on the stamp
    const go = move(t, this.t0, stamp);
    const hx = lerp(ROUTE_X0, x1, go);
    this.ink.seg2(ROUTE_X0, Y, hx, Y, 4, sig(1));
    threadHeadInk(this.ink, hx, Y, 1);

    const press = inn(t, stamp, 0.35);
    seal(c, W8.x, W8.y, RING, t >= stamp ? press : 0, true);
    drawCue(c, this.cue('schedule.w8'), t, W8.x, W8.y + 17, { color: this.fg, align: 'center', size: 48 });
    return { paper: 1 };
  }
}
