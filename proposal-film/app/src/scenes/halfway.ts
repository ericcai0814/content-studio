// Plate 4 · halfway (0:37.5–0:52.5). Engraved 3D. The six-part skeleton as a stack of six slabs in
// perspective. Five projects' copies arrive one per half beat as grey wireframes, apart, and slide
// into exact register (additive lines: where they coincide they read brighter); on the hash match the
// wires turn teal and the registered stack appears as a solid, shaded like an engraving (raymarched,
// `engrave()` hatch).
// The camera drifts once across the plate (eased, no loop). TSMC's numbers in the right column.
import * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { FSPass, W, H } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN } from '../engine/palette';
import { hash, lerp } from '../engine/util';
import { Plate, drawCue, inn, move, threadHead, threadLine, sig } from './_motifs';

const MATCH = 42.5;
const ROWS = 6;
/** Slab i (0 = top): centre and half size in world units; each row a little narrower and set right. */
const CENTER = Array.from({ length: ROWS }, (_, i) => new THREE.Vector3(i * 0.18 - 0.45, (2.5 - i) * 0.62, 0));
const HALF = Array.from({ length: ROWS }, (_, i) => new THREE.Vector3((5.4 - i * 0.36) / 2, 0.2, 1.1));
/** The stack is framed upper left: the view window is shifted this many px right and down. */
const SHIFT = 420, SHIFT_Y = 190;

const ENGRAVE = /* glsl */ `
uniform vec3 camPos; uniform mat3 camRot; uniform float tanHalf, aspect, shiftX, shiftY, solid, lit;
uniform vec3 bc[${ROWS}]; uniform vec3 bh[${ROWS}];
float map(vec3 p) { float d = 1e9; for (int i = 0; i < ${ROWS}; i++) d = min(d, sdBox3(p - bc[i], bh[i])); return d; }
vec3 nrm(vec3 p) {
  vec2 e = vec2(1e-3, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
void main() {
  vec3 col = C_INK;
  if (solid > 0.001) {
    vec2 ndc = vUv * 2.0 - 1.0;
    ndc += vec2(shiftX, shiftY);
    vec3 rd = normalize(camRot * vec3(ndc.x * tanHalf * aspect, ndc.y * tanHalf, -1.0));
    float tt = 0.0; bool hit = false;
    for (int i = 0; i < 96; i++) {
      float d = map(camPos + rd * tt);
      if (d < 1e-3) { hit = true; break; }
      tt += d;
      if (tt > 40.0) break;
    }
    if (hit) {
      vec3 n = nrm(camPos + rd * tt);
      float lum = 0.15 + 0.85 * max(dot(n, normalize(vec3(-0.45, 0.85, 0.35))), 0.0);
      // each face orientation gets its own burin angle, as an engraver would cut it
      float ang = abs(n.y) > 0.5 ? 0.35 : (abs(n.x) > 0.5 ? 1.25 : -0.55);
      float ink = engrave(FRAG_PX, lum * 0.8, 1.0 / 6.0, ang);
      vec3 line = mix(C_BONE * 0.4, C_SIGNAL * 0.8, lit * 0.3);
      col = mix(C_INK, mix(C_INK2, line, ink), solid);
    }
  }
  fragColor = vec4(col, 1.0);
}`;

export default class Halfway extends Plate {
  cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  wires = new LineBatch(4000, { screen2D: false, blend: 'add' });
  solid = new FSPass(ENGRAVE, {
    camPos: { value: new THREE.Vector3() }, camRot: { value: new THREE.Matrix3() },
    tanHalf: { value: Math.tan((30 * Math.PI) / 360) }, aspect: { value: W / H }, shiftX: { value: (2 * SHIFT) / W }, shiftY: { value: (-2 * SHIFT_Y) / H },
    solid: { value: 0 }, lit: { value: 0 }, bc: { value: CENTER }, bh: { value: HALF },
  });

  /** Camera at time t: one slow eased drift across the whole plate. */
  private place(t: number) {
    const k = move(t, 37.5, 52.5);
    const yaw = lerp(-0.62, -0.4, k), pitch = lerp(0.46, 0.38, k), dist = lerp(25, 23.5, k);
    this.cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    this.cam.lookAt(0, 0.1, 0);
    this.cam.setViewOffset(W, H, SHIFT, SHIFT_Y, W, H);
    this.cam.updateMatrixWorld();
  }

  /** Screen position (logical px) of a world point. */
  private screen(p: THREE.Vector3) {
    const v = p.clone().project(this.cam);
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
  }

  override under(f: Frame, out: THREE.WebGLRenderTarget) {
    const t = f.t, { renderer } = this.ctx;
    this.place(t);
    const lit = inn(t, MATCH, 0.6);
    const u = this.solid.u;
    (u.camPos!.value as THREE.Vector3).copy(this.cam.position);
    (u.camRot!.value as THREE.Matrix3).setFromMatrix4(this.cam.matrixWorld);
    u.solid!.value = inn(t, MATCH - 0.3, 1.2);
    u.lit!.value = lit;
    this.solid.render(renderer, out);

    // five copies' wireframes, sliding into register
    this.wires.clear();
    const corners = [-1, 1];
    for (let p = 0; p < 5; p++) {
      const k = move(t, 38.75 + p * 0.5, 41.25 + p * 0.25);
      const off = new THREE.Vector3((hash(p, 1) - 0.5) * 3.2, (hash(p, 2) - 0.5) * 1.4, (hash(p, 4) - 0.5) * 3.2).multiplyScalar(1 - k);
      const spin = (hash(p, 3) - 0.5) * 0.6 * (1 - k);
      const cs = Math.cos(spin), sn = Math.sin(spin);
      // copies arrive one after another (the first is there from the cut), so the opening frames are
      // not a tangle of thirty boxes
      const enter = p === 0 ? 1 : inn(t, 37.5 + p * 0.3125, 0.6);
      if (enter <= 0) continue;
      const rgb: [number, number, number] = [0, 1, 2].map((j) => lerp(LIN.ash[j]! * 0.22, LIN.signal[j]! * 0.75, lit) * enter) as [number, number, number];
      for (let i = 0; i < ROWS; i++) {
        const c = CENTER[i]!, h = HALF[i]!;
        const v = (sx: number, sy: number, sz: number) => {
          const x = sx * h.x, z = sz * h.z;
          return [c.x + off.x + x * cs - z * sn, c.y + off.y + sy * h.y, c.z + off.z + x * sn + z * cs] as const;
        };
        for (const a of corners) for (const b of corners) {
          // the 12 edges: 4 along each axis
          const e = [[v(-1, a, b), v(1, a, b)], [v(a, -1, b), v(a, 1, b)], [v(a, b, -1), v(a, b, 1)]] as const;
          for (const [p0, p1] of e) this.wires.seg(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], 1.5, rgb[0], rgb[1], rgb[2], 1);
        }
      }
    }
    this.wires.render(renderer, out, this.cam);
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    this.place(t);
    // the hash mark: a lead from the right end of the third slab to its label
    const md5 = this.cue('halfway.md5');
    const lead = inn(t, md5.start, 0.6);
    const a = this.screen(new THREE.Vector3(CENTER[2]!.x + HALF[2]!.x, CENTER[2]!.y, HALF[2]!.z));
    const h = threadLine(this.glow, [a, { x: 900, y: a.y }], lead * Math.max(0, 900 - a.x), 2, sig(2));
    if (lead > 0) threadHead(this.glow, h.x, h.y, 0.8 * lead);
    drawCue(c, md5, t, 925, a.y + 11, { color: this.fg });

    drawCue(c, this.cue('halfway.five'), t, 160, 650, { color: this.dim });
    drawCue(c, this.cue('halfway.tsmc'), t, 1240, 300, { color: this.dim });
    drawCue(c, this.cue('halfway.n1'), t, 1240, 375, { color: this.fg });
    drawCue(c, this.cue('halfway.n2'), t, 1240, 440, { color: this.fg });
    drawCue(c, this.cue('halfway.n3'), t, 1240, 505, { color: this.fg });
    drawCue(c, this.cue('halfway.main'), t, 160, 830, { color: this.fg });
    drawCue(c, this.cue('halfway.main2'), t, 160, 915, { color: this.fg });
  }
}
