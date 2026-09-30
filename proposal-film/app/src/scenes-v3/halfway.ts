// v3 shot 4 · halfway (bars 6-7, the drop). The engraved stack from the 105 s film, seen from a fixed
// camera (the push-in is the only camera move). At the cut the thread is one edge of the first copy's
// wireframe (meanings.ts ends on exactly that edge, see matchEdge()); the other four copies arrive a
// half beat apart and slide into register; on bar 7 the registered stack appears as an engraved solid,
// and a dark gloss floor under it takes a faint reflection of the solid (not of the wires: additive
// teal lines mirrored read as a second stack, not as a reflection).
import * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { FSPass, W, H } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN } from '../engine/palette';
import { hash, lerp, type V2 } from '../engine/util';
import { drawCue, inn, move } from '../scenes/_motifs';
import { Shot } from './_v3';

const ROWS = 6;
const CENTER = Array.from({ length: ROWS }, (_, i) => new THREE.Vector3(i * 0.18 - 0.45, (2.5 - i) * 0.62, 0));
const HALF = Array.from({ length: ROWS }, (_, i) => new THREE.Vector3((5.4 - i * 0.36) / 2, 0.2, 1.1));
/** The floor, just under the bottom slab. */
const FLOOR = CENTER[ROWS - 1]!.y - HALF[ROWS - 1]!.y - 0.12;
/** Framing: the stack sits right of centre and high, the line of text below left. */
const SHIFT = -230, SHIFT_Y = 40;
const REFLECT = 0.1;

const ENGRAVE = /* glsl */ `
uniform vec3 camPos; uniform mat3 camRot; uniform float tanHalf, aspect, shiftX, shiftY, solid, lit, floorY, reflectK;
uniform vec3 bc[${ROWS}]; uniform vec3 bh[${ROWS}];
float map(vec3 p) { float d = 1e9; for (int i = 0; i < ${ROWS}; i++) d = min(d, sdBox3(p - bc[i], bh[i])); return d; }
vec3 nrm(vec3 p) {
  vec2 e = vec2(1e-3, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
float march(vec3 ro, vec3 rd) {
  float tt = 0.0;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * tt);
    if (d < 1e-3) return tt;
    tt += d;
    if (tt > 40.0) break;
  }
  return -1.0;
}
vec3 shade(vec3 p) {
  vec3 n = nrm(p);
  float lum = 0.15 + 0.85 * max(dot(n, normalize(vec3(-0.45, 0.85, 0.35))), 0.0);
  float ang = abs(n.y) > 0.5 ? 0.35 : (abs(n.x) > 0.5 ? 1.25 : -0.55);
  float ink = engrave(FRAG_PX, lum * 0.8, 1.0 / 6.0, ang);
  vec3 line = mix(C_BONE * 0.4, C_SIGNAL * 0.8, lit * 0.3);
  return mix(C_INK2, line, ink);
}
void main() {
  vec3 col = C_INK;
  if (solid > 0.001) {
    vec2 ndc = vUv * 2.0 - 1.0;
    ndc += vec2(shiftX, shiftY);
    vec3 rd = normalize(camRot * vec3(ndc.x * tanHalf * aspect, ndc.y * tanHalf, -1.0));
    float tt = march(camPos, rd);
    if (tt > 0.0) col = mix(C_INK, shade(camPos + rd * tt), solid);
    else if (rd.y < 0.0) {
      // the gloss floor: the mirrored ray, fading with distance from the stack
      vec3 fp = camPos + rd * ((floorY - camPos.y) / rd.y);
      vec3 rr = vec3(rd.x, -rd.y, rd.z);
      float t2 = march(fp, rr);
      if (t2 > 0.0) col = mix(C_INK, shade(fp + rr * t2), solid * reflectK * exp(-t2 * 0.7));
    }
  }
  fragColor = vec4(col, 1.0);
}`;

/** The fixed camera (the push-in happens in post). */
function makeCam() {
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  const yaw = -0.5, pitch = 0.36, dist = 18.5;
  cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
  cam.lookAt(0, 0.1, 0);
  cam.setViewOffset(W, H, SHIFT, SHIFT_Y, W, H);
  cam.updateMatrixWorld();
  return cam;
}

/** Screen position (layout px) of a world point. */
function screen(cam: THREE.PerspectiveCamera, p: THREE.Vector3): V2 {
  const v = p.clone().project(cam);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
}

/** The edge the drop cuts on: the front bottom edge of the first copy's top slab, in screen px at zoom 1. */
export function matchEdge(): [V2, V2] {
  const cam = makeCam(), c = CENTER[0]!, h = HALF[0]!;
  return [screen(cam, new THREE.Vector3(c.x - h.x, c.y - h.y, h.z)), screen(cam, new THREE.Vector3(c.x + h.x, c.y - h.y, h.z))];
}

export default class Halfway extends Shot {
  cam = makeCam();
  wires = new LineBatch(8000, { screen2D: false, blend: 'add' });
  solid = new FSPass(ENGRAVE, {
    camPos: { value: new THREE.Vector3() }, camRot: { value: new THREE.Matrix3() },
    tanHalf: { value: Math.tan((30 * Math.PI) / 360) }, aspect: { value: W / H }, shiftX: { value: (2 * SHIFT) / W }, shiftY: { value: (-2 * SHIFT_Y) / H },
    solid: { value: 0 }, lit: { value: 0 }, bc: { value: CENTER }, bh: { value: HALF }, floorY: { value: FLOOR }, reflectK: { value: REFLECT },
  });

  override under(f: Frame, out: THREE.WebGLRenderTarget) {
    const t = f.t, { renderer } = this.ctx;
    const solidAt = this.at(7);
    const lit = inn(t, solidAt, 0.6);
    const u = this.solid.u;
    (u.camPos!.value as THREE.Vector3).copy(this.cam.position);
    (u.camRot!.value as THREE.Matrix3).setFromMatrix4(this.cam.matrixWorld);
    u.solid!.value = inn(t, solidAt - 0.2, 1.0);
    u.lit!.value = lit;
    this.solid.render(renderer, out);

    this.wires.clear();
    const corners = [-1, 1];
    for (let p = 0; p < 5; p++) {
      // copy 0 is in register from the cut (its edge is the matched line); the others arrive a half
      // beat apart and slide in by the end of bar 6
      const arrive = this.t0 + p * this.beat * 0.5;
      const k = p === 0 ? 1 : move(t, arrive, this.at(7) - 0.1);
      const enter = p === 0 ? 1 : inn(t, arrive, 0.5);
      if (enter <= 0) continue;
      const off = new THREE.Vector3((hash(p, 1) - 0.5) * 3.2, (hash(p, 2) - 0.5) * 1.4, (hash(p, 4) - 0.5) * 3.2).multiplyScalar(1 - k);
      const spin = (hash(p, 3) - 0.5) * 0.6 * (1 - k);
      const cs = Math.cos(spin), sn = Math.sin(spin);
      // copy 0 carries the thread's teal from the cut; the others are grey until they register
      const base = p === 0 ? LIN.signal.map((x) => x * 1.4) : LIN.ash.map((x) => x * 0.22);
      const rgb = [0, 1, 2].map((j) => lerp(base[j]!, LIN.signal[j]! * 0.75, lit) * enter) as [number, number, number];
      for (let i = 0; i < ROWS; i++) {
        const c = CENTER[i]!, h = HALF[i]!;
        const v = (sx: number, sy: number, sz: number) => {
          const x = sx * h.x, z = sz * h.z;
          return [c.x + off.x + x * cs - z * sn, c.y + off.y + sy * h.y, c.z + off.z + x * sn + z * cs] as const;
        };
        for (const a of corners) for (const b of corners) {
          const e = [[v(-1, a, b), v(1, a, b)], [v(a, -1, b), v(a, 1, b)], [v(a, b, -1), v(a, b, 1)]] as const;
          for (const [p0, p1] of e) this.wires.seg(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], 1.5, rgb[0], rgb[1], rgb[2], 1);
        }
      }
    }
    this.wires.render(renderer, out, this.cam);
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    drawCue(c, this.cue('halfway.main'), f.t, 240, 930, { color: this.fg });
  }
}
