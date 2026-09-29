# Engine guide

A web app (`app/`, TypeScript + three.js, bun + Vite) that renders any film time `t` deterministically at 1920×1080. The same code drives the browser preview and the offline 60 fps export. The engine and renderer are adapted from [pdoom-video](https://github.com/mexicat/pdoom-video) (MIT, see `../LICENSE-pdoom`); what changed is listed at the end.

## Running things

All commands from `app/` (run `bun install` once).

- Preview: `bunx vite --port 5190` → http://localhost:5190/?t=23.0 (space play/pause, ←/→ ±1 s, shift ±5 s, `,`/`.` ±1 frame, `[`/`]` previous/next plate, `l` loop the plate, `h` hide the UI). There is no audio: the preview runs on its own clock.
- Stills (look at the PNGs): `bun scripts/render.ts stills --t 12.5,33 [--only copies] --out ../out/wip`
- Contact sheets, one per plate cut, with a blank-frame report: `bun scripts/render.ts sheet --cuts` → `../out/sheets/cut-NN-a-b.png`
- Reproducibility: `bun scripts/render.ts hash --t 12.5,60 --samples 4` renders each time twice (with a seek between) and compares SHA-256 of the pixels.
- Draft video: `bun scripts/render.ts video --samples 4 --out ../out/m1-draft.mp4`; final: `--samples auto` (adaptive motion blur). `--audio ../audio/sfx.wav` muxes a sound track (M2).
- Every mode prints `SCENE ERRORS`, browser errors and `LAYOUT WARNINGS` (text outside title-safe or below 30 px).
- `render.ts` starts its own Vite server without live reload. `--url http://localhost:5190` reuses a running one; it must serve this app (5173 is often another project's).
- Typecheck: `bun run typecheck`.

Checks (from `proposal-film/`): `bun scripts/check-facts.ts` (every text and number traceable to dept-brain.md) and `bun scripts/check-readability.ts` (dwell ≥ units/5 + 1, exits before cuts, cuts on downbeats, sfx on beats).

## Data: `data/cues.json`

- `bpm`, `offset`, `beatsPerBar`: the virtual beat grid (96 BPM; no music, but cuts and effects land on it).
- `plates[]`: `{id, start, end, paper?, title}`. The timeline is built from this list; `id` is also the scene module name (`app/src/scenes/<id>.ts`). `paper: true` gives a bone ground.
- `texts[]`: `{id, plate, role, text, start, end, source?}`. `text` is exactly what is drawn. It is readable from `start` (its entrance begins) to `end` (its exit begins). `role` picks the type style. `source` lists verbatim excerpts of dept-brain.md when `text` is condensed rather than quoted.
- `sfx[]`: `{t, kind, plate, note}`: sound-effect cue points on the beat grid (synthesised from M2).

Scenes read text only through `this.cue(id)`; they never hard-code display strings (the fact check fails on CJK literals in scene files).

## Writing a plate

One file `app/src/scenes/<id>.ts`, default-exporting a class extending `Plate` (`scenes/_motifs.ts`):

```ts
import type { Frame } from '../engine/scene';
import { Plate, drawCue, inn, threadLine, threadHead, sig } from './_motifs';

export default class MyPlate extends Plate {
  draw(f: Frame, c: CanvasRenderingContext2D) {
    const t = f.t;
    const h = threadLine(this.glow, [{ x: 160, y: 600 }, { x: 1760, y: 600 }], inn(t, 2) * 1600, 2, sig(2.2));
    threadHead(this.glow, h.x, h.y);
    drawCue(c, this.cue('my.title'), t, 160, 540, { color: this.fg });
    // return post overrides if needed, e.g. { fade: 0.5 }
  }
}
```

`Plate.render` clears to bone or ink, calls `draw`, then composites in order: the Canvas2D `layer`, `ink` lines (normal blend) and `glow` lines (additive HDR, the only thing that blooms).

Rules:

- **Deterministic**: a pure function of `f.t`. No `Math.random()`, `Date.now()`, `performance.now()`; use `hash()` / `mulberry32()` from `engine/util.ts`. The export averages sub-frames in any order.
- **One motion language**: `inn(t, t0, dur)` (outExpo entrances), `move(t, t0, t1)` (inOutCubic moves), `cueVis` / `drawCue` (text in and out). Linear only for slow drift and counters. No loops, no particles.
- **Text** goes through `drawCue(c, cue, t, x, baselineY, opts)`: role styles in `STYLE`, `align`, `size`, `clipX` (reveal left of x), `rot`, `text` (e.g. `rollNumber()` counters). It checks title-safe (96 px) and the 30 px minimum.
- **The thread**: `threadLine(batch, pts, len, width, rgb)` draws the first `len` px of a polyline and returns the head; `threadHead` (on ink, glowing) / `threadHeadInk` (on paper). Colours are linear; `sig(k)` is the signal teal times `k` (k > ~1.2 blooms on ink).
- Every plate shows something from its first frame (the cut must not land on a blank ground); texts finish exiting before the cut.

## Toolbox (from pdoom)

- `gl.ts`: `FSPass` fullscreen GLSL pass, `Compositor` (`ctx.comp.draw(renderer, tex, target, {mode, opacity})`), `Layer2D` (1920×1080 Canvas2D → sRGB texture), `makeRT`, `clearRT`, `SCALE` (`?scale=2` for 4K).
- `glsl/common.ts`: palette constants (`C_INK`, `C_BONE`, `C_SIGNAL`, `C_AMBER` …), hashes, simplex noise, SDFs, `hatch` / `engrave` (for the engraved plates in M2).
- `lines.ts`: `LineBatch` GPU capsule segments, 2D pixels or 3D with a camera.
- `post.ts`: bloom (threshold 1.0 linear), signal-tinted halation, chromatic aberration, tone shoulder, grain, vignette, `fade`, `flash`, `zoom`, `shake`.
- `util.ts`: `clamp, lerp, prog, keys, ease.*, hash, noise*, polylineLengths, pointAtLength`.
- `type.ts`: `F.sans(weight)`, `F.mono(weight)`, `font(spec, px)`, `measure`, `fitSize`.

## Motion blur and sampling

Unchanged from pdoom: `--samples N` averages N sub-frames over `--shutter` × frame time; `--samples auto` steps 4 → 12 → 36 → 108 → 324 until the estimated error is under `--tol` (3/255). Scenes must depend on `t` only; per-frame jitter must use `frameIdx(t)`.

## What changed from pdoom-video

- `audio.ts`, `lyrics.ts`, `stroke.ts` and the analysis pipeline removed; `cues.ts` reads `data/cues.json` (plates, texts, beat grid, sfx points).
- `palette.ts` / `glsl/common.ts`: this film's palette (signal = ewill teal, amber, redline); `heat()` removed.
- `post.ts`: bloom threshold 1.0 with a narrow knee (only HDR teal glows), halation tinted teal, P(doom) fields removed.
- `hud.ts`: crop marks only (off by default).
- `type.ts`: Noto Sans TC (variable) + IBM Plex Mono, no opentype.js outlines.
- `main.ts`: `window.__film`, no audio clock, layout warnings exported.
- `render.ts`: private server by default, audio optional, `sheet --cuts` writes one sheet per cut with a blank-frame report, new `hash` mode, `plates` mode removed.
- Scenes, the treatment and all assets are this film's own; pdoom's song, lyrics, analysis, scene designs and fonts are not used.
