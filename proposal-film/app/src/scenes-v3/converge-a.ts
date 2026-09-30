// v3 shot 5 · converge A (bars 8-9). Five glass rule slabs (the 105 s film's glass) hang at different
// angles over a dark gloss floor, each with its reflection, continuing halfway's floor. On bar 8 they
// turn square to us while teal paths draw from each to the centre; on bar 9 they slide along the paths
// and settle into one stack, a little offset, like papers squared on a desk. No text in this shot.
import * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { W, H } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { LIN, rgba } from '../engine/palette';
import { hash, lerp } from '../engine/util';
import { inn, move, threadLine, sig } from '../scenes/_motifs';
import { Shot } from './_v3';

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

const START = [380, 670, 960, 1250, 1540].map((x, i) => ({ x, y: 380 + (i % 2) * 60 }));
const CORE = { x: 960, y: 440 };
const SW = 270, SH = 144;
/** The gloss floor (layout y) and the reflection's strength at the floor. */
export const FLOOR_Y = 640;
const REFLECT = 0.22;

export default class ConvergeA extends Shot {
  scene3 = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(FOV, W / H, 10, 5000);
  edges = new LineBatch(4000, { screen2D: false, blend: 'add' });
  /** Five slabs, then their five mirror images. */
  slabs = Array.from({ length: 10 }, (_, j) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: GLASS_VERT, fragmentShader: GLASS_FRAG,
      uniforms: {
        tint: { value: new THREE.Vector3(...LIN.ink2).multiplyScalar(1.4) },
        rim: { value: new THREE.Vector3(...LIN.signal).multiplyScalar(j < 5 ? 2.2 : 1.2) },
        opacity: { value: 1 },
      },
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
    this.scene3.add(m);
    return m;
  });

  constructor(ctx: ConstructorParameters<typeof Shot>[0]) {
    super(ctx);
    this.cam.position.set(W / 2, -H / 2, DIST);
    this.cam.lookAt(W / 2, -H / 2, 0);
    this.cam.updateMatrixWorld();
  }

  /** Slab i at t: layout centre, yaw/pitch (squared up on bar 8), stacking offset once merged. */
  private slabAt(i: number, t: number) {
    const s = START[i]!;
    const square = move(t, this.t0, this.at(9));
    const k = move(t, this.at(9) + i * 0.06, this.at(10) - 0.25 - (4 - i) * 0.06);
    const yaw = (hash(i, 5) < 0.5 ? -1 : 1) * (0.45 + 0.3 * hash(i, 8)) * (1 - square);
    const pitch = (hash(i, 6) - 0.5) * 0.4 * (1 - square);
    const off = (i - 2) * 7;
    return { x: lerp(s.x, CORE.x + off, k), y: lerp(s.y, CORE.y - off * 0.6, k), yaw, pitch };
  }

  override under(f: Frame, out: THREE.WebGLRenderTarget) {
    const t = f.t, { renderer } = this.ctx;
    this.edges.clear();
    this.slabs.forEach((m, j) => {
      const i = j % 5, mirror = j >= 5;
      const s = this.slabAt(i, t);
      // the mirror image: reflected about the floor (layout y -> 2 FLOOR_Y - y), pitch reversed
      const y = mirror ? 2 * FLOOR_Y - s.y : s.y;
      m.position.set(s.x, -y, -i * 2);
      m.rotation.set(mirror ? -s.pitch : s.pitch, s.yaw, 0);
      m.scale.set(SW, mirror ? -SH : SH, 10);
      (m.material as THREE.ShaderMaterial).uniforms.opacity!.value = mirror ? REFLECT : 1;
      m.updateMatrixWorld();
      const P = [-0.5, 0.5];
      const v = (x: number, yy: number, z: number) => new THREE.Vector3(x, yy, z).applyMatrix4(m.matrixWorld);
      const rgb = LIN.ash.map((c) => c * 0.55 * (mirror ? REFLECT : 1)) as [number, number, number];
      for (const z of P) {
        const q = [v(-0.5, -0.5, z), v(0.5, -0.5, z), v(0.5, 0.5, z), v(-0.5, 0.5, z)];
        for (let e = 0; e < 4; e++) this.edges.seg(q[e]!.x, q[e]!.y, q[e]!.z, q[(e + 1) % 4]!.x, q[(e + 1) % 4]!.y, q[(e + 1) % 4]!.z, 1.4, rgb[0], rgb[1], rgb[2], 1);
      }
      for (const x of P) for (const yy of P) { const a = v(x, yy, -0.5), b = v(x, yy, 0.5); this.edges.seg(a.x, a.y, a.z, b.x, b.y, b.z, 1.4, rgb[0], rgb[1], rgb[2], 1); }
    });
    renderer.setRenderTarget(out);
    renderer.render(this.scene3, this.cam);
    this.edges.render(renderer, out, this.cam);
  }

  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    // the floor's far edge: one hairline, and the reflections fade out below it (drawn in the 2D layer,
    // which sits over the GL glass)
    const g = c.createLinearGradient(0, FLOOR_Y + 20, 0, FLOOR_Y + 260);
    g.addColorStop(0, 'rgba(10,10,11,0)');
    g.addColorStop(1, 'rgba(10,10,11,1)');
    c.fillStyle = g;
    c.fillRect(0, FLOOR_Y + 20, W, H - FLOOR_Y - 20);
    c.fillStyle = rgba('graphite', 0.35);
    c.fillRect(0, FLOOR_Y, W, 1);

    // the paths the slabs will travel: drawn on bar 8, gone as the stack settles
    const pathK = move(t, this.t0 + this.beat, this.at(9));
    const pathA = 1 - inn(t, this.at(10) - 0.5, 0.45);
    for (const s of START) threadLine(this.glow, [s, CORE], pathK * Math.hypot(CORE.x - s.x, CORE.y - s.y), 1.4, sig(1.4), pathA);
  }
}
