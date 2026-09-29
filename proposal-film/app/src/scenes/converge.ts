// Plate 5 · converge (0:52.5–1:14.5). Five glass rule slabs (three.js), one per project, hang at
// different angles, catching light on their edges; they turn square to us as they slide along teal
// lines into one core, dept-brain. Projects then only grow small tags (their exceptions). At the close
// the thread runs out from the core to a closing project and back around into the core: the loop of
// writing back closes once.
import * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN, rgba } from '../engine/palette';
import { hash, lerp } from '../engine/util';
import { Plate, drawCue, inn, move, bezier, pathLen, threadHead, threadLine, sig } from './_motifs';

/** Glass: a faint ink tint, a teal fresnel rim (HDR, so edges on-angle bloom) and one fixed highlight. */
const GLASS_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const GLASS_FRAG = /* glsl */ `
uniform vec3 tint; uniform vec3 rim; uniform float opacity;
varying vec3 vN; varying vec3 vV;
void main() {
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(vV);
  float fr = pow(1.0 - abs(dot(n, v)), 3.0);
  float sp = pow(max(dot(reflect(-normalize(vec3(-0.4, 0.6, 0.7)), n), v), 0.0), 30.0);
  float a = (0.3 + 0.55 * fr + 0.5 * sp) * opacity;
  gl_FragColor = vec4((tint + rim * fr + vec3(0.9) * sp) * a, a);
}`;
/** Perspective camera whose z = 0 plane maps 1:1 onto layout px (world y = -layout y). */
const FOV = 30, DIST = (H / 2) / Math.tan((FOV * Math.PI) / 360);

const START = [360, 660, 960, 1260, 1560].map((x) => ({ x, y: 300 }));
const CORE = { x: 960, y: 420 };
const NODES = [{ x: 420, y: 640 }, { x: 690, y: 690 }, { x: 960, y: 705 }, { x: 1230, y: 690 }, { x: 1500, y: 640 }];
const SW = 210, SH = 110, CW = 300, CH = 150;
const MERGE0 = 55.625, MERGE1 = 57.5;

export default class Converge extends Plate {
  scene3 = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(FOV, W / H, 10, 5000);
  edges = new LineBatch(2000, { screen2D: false, blend: 'add' });
  slabs = START.map(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: GLASS_VERT, fragmentShader: GLASS_FRAG,
      uniforms: {
        tint: { value: new THREE.Vector3(...LIN.ink2).multiplyScalar(1.4) },
        rim: { value: new THREE.Vector3(...LIN.signal).multiplyScalar(2.6) },
        opacity: { value: 1 },
      },
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
    this.scene3.add(m);
    return m;
  });

  constructor(ctx: ConstructorParameters<typeof Plate>[0]) {
    super(ctx);
    this.cam.position.set(W / 2, -H / 2, DIST);
    this.cam.lookAt(W / 2, -H / 2, 0);
    this.cam.updateMatrixWorld();
  }

  /** Slab i at t: layout-px centre, size, yaw/pitch (squared up as it merges), opacity. */
  private slabAt(i: number, t: number) {
    const s = START[i]!;
    const k = move(t, MERGE0 + i * 0.1, MERGE1 - (4 - i) * 0.1);
    // before the merge each hangs at its own angle, turning slowly and linearly (no loop)
    const drift = (t - 52.5) * 0.03 * (hash(i, 9) - 0.5);
    const yaw = ((hash(i, 5) < 0.5 ? -1 : 1) * (0.45 + 0.35 * hash(i, 8)) + drift) * (1 - k), pitch = (hash(i, 6) - 0.5) * 0.4 * (1 - k);
    return {
      x: lerp(s.x, CORE.x, k), y: lerp(s.y, CORE.y, k), w: lerp(SW, CW, k), h: lerp(SH, CH, k), yaw, pitch,
      a: 1 - inn(t, MERGE1, 0.4) * (i === 2 ? 0 : 1),
    };
  }

  override under(f: Frame, out: THREE.WebGLRenderTarget) {
    const t = f.t, { renderer } = this.ctx;
    this.edges.clear();
    this.slabs.forEach((m, i) => {
      const s = this.slabAt(i, t);
      m.visible = s.a > 0.002;
      m.position.set(s.x, -s.y, 0);
      m.rotation.set(s.pitch, s.yaw, 0);
      m.scale.set(s.w, s.h, 10);
      (m.material as THREE.ShaderMaterial).uniforms.opacity!.value = s.a;
      m.updateMatrixWorld();
      if (!m.visible) return;
      // front and back outlines and the four short sides
      const P = [-0.5, 0.5];
      const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(m.matrixWorld);
      const rgb = LIN.ash.map((c) => c * 0.55 * s.a) as [number, number, number];
      for (const z of P) {
        const q = [v(-0.5, -0.5, z), v(0.5, -0.5, z), v(0.5, 0.5, z), v(-0.5, 0.5, z)];
        for (let e = 0; e < 4; e++) this.edges.seg(q[e]!.x, q[e]!.y, q[e]!.z, q[(e + 1) % 4]!.x, q[(e + 1) % 4]!.y, q[(e + 1) % 4]!.z, 1.4, rgb[0], rgb[1], rgb[2], 1);
      }
      for (const x of P) for (const y of P) { const a = v(x, y, -0.5), b = v(x, y, 0.5); this.edges.seg(a.x, a.y, a.z, b.x, b.y, b.z, 1.4, rgb[0], rgb[1], rgb[2], 1); }
    });
    renderer.setRenderTarget(out);
    renderer.render(this.scene3, this.cam);
    this.edges.render(renderer, out, this.cam);
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const m = move(t, MERGE0, MERGE1);
    const core = this.cue('converge.core');
    const t2 = this.cue('converge.t2'), t3 = this.cue('converge.t3');

    // the paths the slabs will travel, drawn just before they move, gone once they have merged
    const pathK = move(t, 54.375, MERGE0);
    const pathA = 1 - m * 0.4 - 0.6 * inn(t, MERGE1, 0.6);
    for (const s of START) threadLine(this.glow, [s, CORE], pathK * Math.hypot(CORE.x - s.x, CORE.y - s.y), 1.4, sig(1.4), pathA);

    // project nodes and their exception tags (after the merge)
    const nk = inn(t, t2.start - 0.625);
    NODES.forEach((n, i) => {
      if (nk <= 0) return;
      c.strokeStyle = rgba('graphite', 0.8 * nk); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(CORE.x, CORE.y + CH / 2); c.lineTo(n.x, n.y); c.stroke();
      c.fillStyle = rgba('ink2', nk); c.strokeStyle = rgba('ash', nk);
      c.beginPath(); c.arc(n.x, n.y, 16, 0, Math.PI * 2); c.fill(); c.stroke();
      const tag = inn(t, t2.start + 0.125 * i, 0.5);
      if (tag > 0) this.glow.seg2(n.x + 22, n.y - 18, n.x + 22 + 26 * tag, n.y - 18, 8, sig(1.3), 1);
    });

    // slab labels (the glass itself is drawn in under()); after the merge only the core remains
    START.forEach((_, i) => {
      const s = this.slabAt(i, t);
      drawCue(c, this.cue(`converge.p${i + 1}`), t, s.x, s.y + 11, { color: this.fg, align: 'center' });
    });
    const lit = inn(t, MERGE1, 0.6);
    if (lit > 0) {
      const x0 = CORE.x - CW / 2, x1 = CORE.x + CW / 2, y0 = CORE.y - CH / 2, y1 = CORE.y + CH / 2;
      const r = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }, { x: x0, y: y0 }];
      threadLine(this.glow, r, lit * 2 * (CW + CH), 2, sig(2.4));
    }
    drawCue(c, core, t, CORE.x, CORE.y + 12, { color: this.fg, align: 'center', size: 36 });

    // the loop, once: out of the core to the closing project, then around and back into the core
    const loop = [{ x: CORE.x, y: CORE.y + CH / 2 }, ...bezier(NODES[4]!, { x: 1760, y: 620 }, { x: 1700, y: 400 }, { x: CORE.x + CW / 2, y: CORE.y })];
    const lk = move(t, t3.start + 0.625, t3.start + 3.125);
    const h = threadLine(this.glow, loop, lk * pathLen(loop), 2, sig(2.2));
    if (lk > 0) threadHead(this.glow, h.x, h.y, 1);

    drawCue(c, this.cue('converge.t1'), t, 160, 820, { color: this.fg, size: 56 });
    drawCue(c, t2, t, 160, 895, { color: this.fg, size: 56 });
    drawCue(c, t3, t, 160, 970, { color: this.fg, size: 56 });
  }
}
