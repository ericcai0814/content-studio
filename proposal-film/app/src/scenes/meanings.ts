// Plate 3 · meanings (0:25–0:37.5). Blueprint. A traceability-table header; its 狀態 column lights,
// and the thread drops out of it and splits into four leads, one per project's meaning.
// (M1: flat line drawing on a faint grid.)
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { W, H } from '../engine/gl';
import { lerp } from '../engine/util';
import { Plate, drawCue, inn, move, threadHead, threadLine, sig } from './_motifs';

const TX0 = 160, TX1 = 1760, TY0 = 200, TY1 = 270, COLS = 6, COL = 2;
const NODES = [310, 700, 1090, 1480];
const SPLIT_Y = 380, NODE_Y = 470;

export default class Meanings extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const col = this.cue('meanings.col');

    // faint blueprint grid, present from the cut
    c.fillStyle = rgba('graphite', 0.16);
    for (let x = 0; x < W; x += 60) c.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 60) c.fillRect(0, y, W, 1);

    // table header: six cells, the status column lit teal on its cue
    const cw = (TX1 - TX0) / COLS;
    c.strokeStyle = rgba('bone', 0.4); c.lineWidth = 1.5;
    for (let i = 0; i < COLS; i++) c.strokeRect(TX0 + i * cw, TY0, cw, TY1 - TY0);
    c.fillStyle = rgba('ash', 0.35);
    for (let i = 0; i < COLS; i++) if (i !== COL) c.fillRect(TX0 + i * cw + 28, (TY0 + TY1) / 2 - 3, cw * 0.45, 6);
    const lit = inn(t, col.start);
    const cx0 = TX0 + COL * cw, cx1 = cx0 + cw;
    const box = [{ x: cx0, y: TY0 }, { x: cx1, y: TY0 }, { x: cx1, y: TY1 }, { x: cx0, y: TY1 }, { x: cx0, y: TY0 }];
    threadLine(this.glow, box, lit * 2 * (cw + TY1 - TY0), 2, sig(2));
    drawCue(c, this.cue('meanings.table'), t, TX0, TY0 - 30, { color: this.dim });
    drawCue(c, col, t, (cx0 + cx1) / 2, TY1 - 20, { color: this.fg, align: 'center' });

    // the trunk drops out of the column, then four leads split off it, one per meaning
    const mx = (cx0 + cx1) / 2;
    const trunkK = move(t, 26.875, 27.5);
    threadLine(this.glow, [{ x: mx, y: TY1 }, { x: mx, y: SPLIT_Y }], trunkK * (SPLIT_Y - TY1), 2, sig(2));
    NODES.forEach((nx, i) => {
      const m = this.cue(`meanings.m${i + 1}`), p = this.cue(`meanings.p${i + 1}`);
      const k = move(t, m.start - 0.5, m.start);
      const pts = [{ x: mx, y: SPLIT_Y }, { x: nx, y: SPLIT_Y + 40 }, { x: nx, y: NODE_Y }];
      const len = Math.hypot(nx - mx, 40) + (NODE_Y - SPLIT_Y - 40);
      const h = threadLine(this.glow, pts, k * len, 1.6, sig(1.8));
      if (k > 0) threadHead(this.glow, h.x, h.y, lerp(0.4, 0.8, k));
      drawCue(c, p, t, nx, 545, { color: this.dim, align: 'center' });
      drawCue(c, m, t, nx, 610, { color: this.fg, align: 'center' });
    });

    drawCue(c, this.cue('meanings.main'), t, TX0, 830, { color: this.fg });
    drawCue(c, this.cue('meanings.main2'), t, TX0, 915, { color: this.fg });
  }
}
