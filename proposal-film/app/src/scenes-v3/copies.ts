// v3 shot 2 · copies (bar 2 beat 3 to bar 4). Bone paper. At the cut the open's thread becomes the
// paper's ink rule (same row; its ends sit where the open's pushed-in line ended). Above the rule the
// same rules document appears five times, one a beat, each revealed by a mask rising from the rule.
// The copies are identical on purpose: the body lines are the same on every sheet.
import type { Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { hash } from '../engine/util';
import { drawCue, inn } from '../scenes/_motifs';
import { Shot, Y, LX0, LX1, PUSH, zoomed } from './_v3';

const N = 5, SW = 236, SH = 300, GAP = 26;
const SX0 = (1920 - (N * SW + (N - 1) * GAP)) / 2, SB = Y - 40;

export default class Copies extends Shot {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    // the rule: the open's line as it was seen on its last frame (pushed in by 1 + PUSH)
    const a = zoomed({ x: LX0, y: Y }, 1 + PUSH), b = zoomed({ x: LX1, y: Y }, 1 + PUSH);
    c.fillStyle = rgba('ink', 0.85);
    c.fillRect(a.x, Y - 2, b.x - a.x, 4);

    for (let i = 0; i < N; i++) {
      const m = inn(t, this.t0 + i * this.beat, 0.45);
      if (m <= 0) continue;
      const x = SX0 + i * (SW + GAP), top = SB - SH;
      c.save();
      c.beginPath(); c.rect(x - 2, SB - (SH + 4) * m, SW + 4, (SH + 4) * m); c.clip();
      c.fillStyle = rgba('bone', 1);
      c.fillRect(x, top, SW, SH);
      c.strokeStyle = rgba('ink', 0.7); c.lineWidth = 1.5;
      c.strokeRect(x, top, SW, SH);
      c.fillStyle = rgba('ink', 0.75);
      c.fillRect(x + 24, top + 28, SW * 0.55, 10);
      c.fillStyle = rgba('graphite', 0.55);
      for (let k = 0; k < 10; k++) c.fillRect(x + 24, top + 70 + k * 21, (SW - 48) * (0.55 + 0.45 * hash(k, 1)), 3);
      c.restore();
    }

    drawCue(c, this.cue('copies.main'), t, SX0, Y + 170, { color: this.fg });
    return { paper: 1 };
  }
}
