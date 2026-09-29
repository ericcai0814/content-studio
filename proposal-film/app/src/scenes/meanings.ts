// Plate 3 · meanings (0:25–0:37.5). Blueprint: a drafting sheet (border, minor and major grid,
// registration crosses, a dimension line). A traceability-table header; its status column is
// hatched and lit, and the thread drops out of it and splits into four leads, one per project's
// meaning, each ending in a bracketed callout.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { W, H } from '../engine/gl';
import { lerp } from '../engine/util';
import { Plate, drawCue, cueVis, inn, move, threadHead, threadLine, sig } from './_motifs';

const TX0 = 160, TX1 = 1760, TY0 = 200, TY1 = 270, COLS = 6, COL = 2;
const NODES = [310, 700, 1090, 1480];
const SPLIT_Y = 380, NODE_Y = 470;

export default class Meanings extends Plate {
  /** The drafting sheet, on screen from the cut: minor/major grid, border, registration crosses. */
  private sheet(c: CanvasRenderingContext2D) {
    c.fillStyle = rgba('graphite', 0.09);
    for (let x = 0; x < W; x += 30) c.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 30) c.fillRect(0, y, W, 1);
    c.fillStyle = rgba('graphite', 0.22);
    for (let x = 0; x < W; x += 150) c.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 150) c.fillRect(0, y, W, 1);
    c.strokeStyle = rgba('ash', 0.35); c.lineWidth = 1.5;
    c.strokeRect(60, 60, W - 120, H - 120);
    c.strokeRect(68, 68, W - 136, H - 136);
    c.fillStyle = rgba('ash', 0.45);
    for (let x = 450; x < W; x += 300) for (let y = 150; y < H; y += 300) {
      c.fillRect(x - 8, y - 0.75, 16, 1.5); c.fillRect(x - 0.75, y - 8, 1.5, 16);
    }
  }

  /** Section hatching in the lit column (45°, clipped to the cell). */
  private hatchCell(c: CanvasRenderingContext2D, x0: number, x1: number, k: number) {
    if (k <= 0) return;
    c.save();
    c.beginPath(); c.rect(x0, TY0, x1 - x0, TY1 - TY0); c.clip();
    c.strokeStyle = rgba('signal', 0.28 * k); c.lineWidth = 1.5;
    c.beginPath();
    for (let x = x0 - (TY1 - TY0); x < x1; x += 12) { c.moveTo(x, TY1); c.lineTo(x + (TY1 - TY0), TY0); }
    c.stroke();
    c.restore();
  }

  /** A dimension line over the column: extension lines, arrow ticks, drawn out from the middle. */
  private dimension(c: CanvasRenderingContext2D, x0: number, x1: number, k: number) {
    if (k <= 0) return;
    const y = TY0 - 22, mx = (x0 + x1) / 2, half = ((x1 - x0) / 2) * k;
    c.strokeStyle = rgba('ash', 0.7 * k); c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x0, TY0 - 6); c.lineTo(x0, y - 10); c.moveTo(x1, TY0 - 6); c.lineTo(x1, y - 10);
    c.moveTo(mx - half, y); c.lineTo(mx + half, y);
    for (const [x, d] of [[mx - half, 1], [mx + half, -1]] as const) { c.moveTo(x + d * 9, y - 5); c.lineTo(x, y); c.lineTo(x + d * 9, y + 5); }
    c.stroke();
  }

  /** Corner brackets framing a callout of size w x h centred on (x, top y). */
  private callout(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number) {
    if (a <= 0) return;
    const l = 16, x0 = x - w / 2, x1 = x + w / 2, y1 = y + h;
    c.strokeStyle = rgba('ash', 0.5 * a); c.lineWidth = 1.5;
    c.beginPath();
    for (const [px, py, sx, sy] of [[x0, y, 1, 1], [x1, y, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]] as const) {
      c.moveTo(px + sx * l, py); c.lineTo(px, py); c.lineTo(px, py + sy * l);
    }
    c.stroke();
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const col = this.cue('meanings.col');

    this.sheet(c);

    // table header: six cells, the status column lit teal on its cue
    const cw = (TX1 - TX0) / COLS;
    c.strokeStyle = rgba('bone', 0.4); c.lineWidth = 1.5;
    for (let i = 0; i < COLS; i++) c.strokeRect(TX0 + i * cw, TY0, cw, TY1 - TY0);
    c.fillStyle = rgba('ash', 0.35);
    for (let i = 0; i < COLS; i++) if (i !== COL) c.fillRect(TX0 + i * cw + 28, (TY0 + TY1) / 2 - 3, cw * 0.45, 6);
    const lit = inn(t, col.start);
    const cx0 = TX0 + COL * cw, cx1 = cx0 + cw;
    this.hatchCell(c, cx0, cx1, lit);
    this.dimension(c, cx0, cx1, lit);
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
      this.callout(c, nx, 500, 310, 140, cueVis(t, m));
      drawCue(c, p, t, nx, 545, { color: this.dim, align: 'center' });
      drawCue(c, m, t, nx, 610, { color: this.fg, align: 'center' });
    });

    drawCue(c, this.cue('meanings.main'), t, TX0, 830, { color: this.fg });
    drawCue(c, this.cue('meanings.main2'), t, TX0, 915, { color: this.fg });
    // no chromatic aberration: the drawing frame runs close to the edges, where CA fringes it magenta
    return { ca: 0 };
  }
}
