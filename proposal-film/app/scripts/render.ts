#!/usr/bin/env bun
// Offline renderer (from pdoom-video, MIT; audio optional, per-cut contact sheets and a frame-hash mode
// added). Drives the app in headless Chrome (?export=1) and either
//   stills:  bun scripts/render.ts stills --t 1.5,23,40.2 [--only id1,id2] [--out dir]
//   sheet:   bun scripts/render.ts sheet --from 20 --to 35 [--n 12] [--cols 4] [--only ids] [--out file.png]   (or --times a,b,c)
//            sheet --cuts [--out dir]: one sheet per plate boundary (6 frames around each cut) into out/sheets/,
//            and a blank-frame report (near-uniform black or white cells)
//   hash:    bun scripts/render.ts hash --t 12.5,60 [--samples 4]   (renders each time twice with a seek in
//            between and prints the SHA-256 of the pixels: the reproducibility check)
//   perf:    bun scripts/render.ts perf --from 20 --to 25 [--only ids] [--samples 1] [--shutter 0.5]   (avg ms per frame incl. GPU sync and the export's pixel readback)
//   video:   bun scripts/render.ts video [--from 0] [--to <duration>] [--fps 60] [--crf 16] [--x264 aq-mode=3] [--samples 1] [--shutter 0.5] [--out ../out/film.mp4] [--audio ../audio/sfx.wav]
//            --samples N averages N sub-frames per frame over shutter×(1/fps): motion blur + temporal AA;
//            --samples auto picks the count per frame (4, 12, 36, 108 or 324, see Engine.render)
//   --comp v3 (all modes): the 38 s cut (data/cues-v3.json, src/scenes-v3/) instead of the 105 s film.
//   --scale N (all modes): render at N× the 1920x1080 layout (--scale 2 = true 3840x2160); stills are then saved
//            full-res from the pixel buffer, videos are encoded at the physical size.
// Uses the Vite dev server at --url if given; otherwise starts a private one (no live reload).
import { chromium, type Page } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const mode = argv[0] ?? 'stills';
const opt = (k: string, d?: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const flag = (k: string) => argv.includes(`--${k}`);
const APP = path.resolve(import.meta.dir, '..');
const SCALE = Math.max(1, Math.round(+opt('scale', '1')!));
const OW = 1920 * SCALE, OH = 1080 * SCALE; // output size
// --samples N (fixed) or --samples auto [--min-samples 4] [--max-samples 324] [--tol 3] (adaptive, see Engine.render)
const SAMPLES = opt('samples', '1') === 'auto'
  ? { min: +opt('min-samples', '4')!, max: +opt('max-samples', '324')!, tol: +opt('tol', '3')! }
  : +opt('samples', '1')!;
const hist = (h: Record<string, number>) => Object.entries(h).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => `${k}:${v}`).join(' ');
const ROOT = path.resolve(APP, '..');

async function reachable(url: string) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(1500) }); return r.ok; } catch { return false; }
}

async function ensureServer(): Promise<{ url: string; stop: () => void }> {
  // --url: use that server (it must serve this app); otherwise start a private one, since 5173 may
  // well be some other project's dev server
  const url = opt('url');
  if (url) {
    if (!(await reachable(url))) throw new Error(`--url ${url} is not reachable`);
    return { url, stop: () => {} };
  }
  const port = 5300 + Math.floor(Math.random() * 500);
  // no live reload: a file saved mid-render must not reload the page
  const proc = Bun.spawn(['bunx', 'vite', '--port', String(port), '--strictPort'], { cwd: APP, stdout: 'ignore', stderr: 'ignore', env: { ...process.env, FILM_NO_HMR: '1' } });
  const u = `http://localhost:${port}`;
  for (let i = 0; i < 100 && !(await reachable(u)); i++) await Bun.sleep(100);
  return { url: u, stop: () => proc.kill() };
}

async function openPage(url: string) {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: !flag('headed'),
    args: ['--use-angle=metal', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const logs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
  const only = opt('only'), comp = opt('comp');
  await page.goto(`${url}/?export=1${only ? `&only=${only}` : ''}${comp ? `&comp=${comp}` : ''}${SCALE !== 1 ? `&scale=${SCALE}` : ''}`);
  await page.waitForFunction(() => (window as any).__film?.ready || (window as any).__film?.error, null, { timeout: 120000 });
  const err = await page.evaluate(() => (window as any).__film.error);
  if (err) throw new Error(`app failed to boot:\n${err}\n${logs.join('\n')}`);
  const size: [number, number] = await page.evaluate(() => [(window as any).__film.width ?? 1920, (window as any).__film.height ?? 1080]);
  if (size[0] !== OW || size[1] !== OH) throw new Error(`app renders ${size[0]}x${size[1]}, expected ${OW}x${OH} (--scale ${SCALE})`);
  const sceneErrors: string[] = await page.evaluate(() => (window as any).__film.errors);
  if (sceneErrors.length) console.error('SCENE ERRORS:\n' + sceneErrors.join('\n'));
  return { browser, page, logs };
}

async function stills(page: Page, times: number[], outDir: string) {
  mkdirSync(outDir, { recursive: true });
  const files: string[] = [];
  for (const t of times) {
    const k: number = await page.evaluate(([t, s, sh]) => (window as any).__film.still(t, s, sh), [t, SAMPLES, +opt('shutter', '0.5')!] as const);
    const f = path.join(outDir, `f_${t.toFixed(2).padStart(7, '0')}.png`);
    if (typeof SAMPLES !== 'number') console.log(`t=${t}: ${k} sub-frames`);
    // at scale > 1 the canvas is shown downscaled on the page: save the full-res pixel buffer instead
    if (SCALE !== 1) await Bun.write(f, Buffer.from(await page.evaluate(() => (window as any).__film.png()), 'base64'));
    else await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    files.push(f);
  }
  return files;
}

/** Mean and standard deviation of the luma (0..255) of each cell, to catch blank (black/white) frames. */
type CellStat = { t: number; mean: number; std: number };

async function sheet(page: Page, times: number[], cols: number, out: string): Promise<CellStat[]> {
  const { dataUrl, stats }: { dataUrl: string; stats: CellStat[] } = await page.evaluate(async ({ times, cols }) => {
    const P = (window as any).__film;
    const cw = 480, ch = 270, pad = 4, lab = 18;
    const rows = Math.ceil(times.length / cols);
    const cv = document.createElement('canvas');
    cv.width = cols * (cw + pad) + pad; cv.height = rows * (ch + lab + pad) + pad;
    const c = cv.getContext('2d', { willReadFrequently: true })!;
    c.fillStyle = '#222'; c.fillRect(0, 0, cv.width, cv.height);
    const src = document.getElementById('c') as HTMLCanvasElement;
    const stats: { t: number; mean: number; std: number }[] = [];
    times.forEach((t: number, i: number) => {
      P.still(t);
      const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + lab + pad);
      c.drawImage(src, x, y + lab, cw, ch);
      const px = c.getImageData(x, y + lab, cw, ch).data;
      let s = 0, s2 = 0;
      for (let k = 0; k < px.length; k += 4) { const l = 0.2126 * px[k]! + 0.7152 * px[k + 1]! + 0.0722 * px[k + 2]!; s += l; s2 += l * l; }
      const n = px.length / 4, mean = s / n;
      stats.push({ t, mean, std: Math.sqrt(Math.max(0, s2 / n - mean * mean)) });
      c.fillStyle = '#ddd'; c.font = '13px monospace'; c.fillText(`${t.toFixed(3)}s`, x + 2, y + 13);
    });
    return { dataUrl: cv.toDataURL('image/png'), stats };
  }, { times, cols });
  mkdirSync(path.dirname(out), { recursive: true });
  await Bun.write(out, Buffer.from(dataUrl.split(',')[1]!, 'base64'));
  return stats;
}

/** A cell that is nearly one flat colour at the black or white end reads as a blank frame. */
const blankKind = (s: CellStat) => (s.std < 4 && s.mean < 30 ? 'BLACK' : s.std < 4 && s.mean > 225 ? 'WHITE' : '');

async function video(page: Page, from: number, to: number, fps: number, out: string) {
  mkdirSync(path.dirname(out), { recursive: true });
  const crf = opt('crf', '16')!;
  // M1 is silent: an audio track is muxed only when --audio names one (audio/sfx.sh, from M2)
  const audio = opt('audio');
  const args = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${OW}x${OH}`, '-r', String(fps), '-i', 'pipe:0'];
  if (audio) args.push('-ss', String(from), '-t', String(to - from), '-i', path.resolve(audio));
  // Frames are sRGB (toSRGB in the final pass): convert with the BT.709 matrix and tag the stream,
  // otherwise ffmpeg converts with BT.601 while players and YouTube decode untagged HD as BT.709.
  // scale tags the matrix and range; primaries and transfer need setparams (the -color_* output flags don't reach the stream).
  args.push('-vf', 'vflip,scale=out_color_matrix=bt709,setparams=color_primaries=bt709:color_trc=bt709', '-c:v', 'libx264', '-preset', opt('preset', 'slow')!, '-crf', crf, '-pix_fmt', 'yuv420p', '-tune', 'grain', '-x264-params', opt('x264', 'aq-mode=3')!);
  if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-movflags', '+faststart', out);
  const ff = Bun.spawn(args, { stdin: 'pipe', stdout: 'inherit', stderr: 'inherit' });
  let frames = 0;
  const total = Math.round(to * fps) - Math.round(from * fps);
  const t0 = performance.now();
  const server = Bun.serve({
    port: 0,
    fetch(req, srv) { return srv.upgrade(req) ? undefined : new Response('ws only', { status: 400 }); },
    websocket: {
      maxPayloadLength: Math.max(64 * 1024 * 1024, OW * OH * 4 + 1024),
      async message(ws, msg) {
        ff.stdin.write(msg as Uint8Array);
        await ff.stdin.flush();
        frames++;
        ws.send(String(frames)); // ack: the page keeps at most a few frames ahead of ffmpeg (bounded memory at 4K)
        if (frames % 60 === 0 || frames === total) {
          const el = (performance.now() - t0) / 1000;
          process.stdout.write(`\r${frames}/${total} frames  ${(frames / el).toFixed(1)} fps  eta ${((total - frames) / (frames / el)).toFixed(0)}s   `);
        }
      },
    },
  });
  const used: Record<string, number> = await page.evaluate((o) => (window as any).__film.stream(o), { from, to, fps, ws: `ws://localhost:${server.port}`, samples: SAMPLES, shutter: +opt('shutter', '0.5')!, inflight: 4 });
  // wait for all frames to arrive
  while (frames < total) await Bun.sleep(20);
  ff.stdin.end();
  await ff.exited;
  server.stop();
  console.log(`\nwrote ${out} (${frames} frames in ${((performance.now() - t0) / 1000).toFixed(1)}s)`);
  console.log(`sub-frames per frame (count:frames): ${hist(used)}`);
}

const { url, stop } = await ensureServer();
const { browser, page, logs } = await openPage(url);
try {
  if (mode === 'gpu') {
    console.log(await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')!;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    }));
  } else if (mode === 'stills') {
    const times = (opt('t') ?? '0').split(',').map(Number);
    const files = await stills(page, times, opt('out', path.join(ROOT, 'out/stills'))!);
    console.log(files.join('\n'));
  } else if (mode === 'sheet') {
    const cols = +opt('cols', '3')!;
    if (flag('cuts')) {
      // one sheet per plate boundary: 3 frames before the cut, 3 after
      const tl: { id: string; start: number }[] = await page.evaluate(() => (window as any).__film.timeline);
      const dir = opt('out', path.join(ROOT, 'out/sheets'))!;
      const blanks: string[] = [];
      for (let i = 1; i < tl.length; i++) {
        const a = tl[i - 1]!, b = tl[i]!, c = b.start;
        const times = [c - 0.5, c - 0.1, c - 1 / 60, c + 1 / 60, c + 0.1, c + 0.5];
        const out = path.join(dir, `cut-${String(i).padStart(2, '0')}-${a.id}-${b.id}.png`);
        const stats = await sheet(page, times, cols, out);
        for (const s of stats) if (blankKind(s)) blanks.push(`${blankKind(s)} ${s.t.toFixed(3)}s (mean ${s.mean.toFixed(1)}, std ${s.std.toFixed(1)}) in ${path.basename(out)}`);
        console.log(`${out}  luma mean ${stats.map((s) => s.mean.toFixed(0)).join('/')}  std ${stats.map((s) => s.std.toFixed(0)).join('/')}`);
      }
      console.log(blanks.length ? `BLANK FRAMES:\n${blanks.join('\n')}` : 'blank frames: 0');
    } else {
      const from = +opt('from', '0')!, to = +opt('to', '10')!, n = +opt('n', '12')!;
      let times = Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1));
      if (opt('times')) times = opt('times')!.split(',').map(Number);
      const out = opt('out', path.join(ROOT, `out/sheets/sheet_${from}-${to}.png`))!;
      await sheet(page, times, cols, out);
      console.log(out);
    }
  } else if (mode === 'hash') {
    // reproducibility: each time rendered twice, with a seek to another time in between
    const times = (opt('t') ?? '0').split(',').map(Number);
    let same = true;
    for (const t of times) {
      const h: string[] = await page.evaluate(async ([t, s, sh]) => {
        const P = (window as any).__film;
        const out: string[] = [];
        for (const pre of [t + 7.31, t - 3.17]) {
          P.still(Math.max(0, Math.min(P.duration - 0.01, pre)), s, sh);
          P.still(t, s, sh);
          const px = await P.engine.readPixelsAsync();
          const d = new Uint8Array(await crypto.subtle.digest('SHA-256', px));
          out.push(Array.from(d, (b) => b.toString(16).padStart(2, '0')).join(''));
        }
        return out;
      }, [t, SAMPLES, +opt('shutter', '0.5')!] as const);
      same &&= h[0] === h[1];
      console.log(`t=${t}  ${h[0]}  ${h[1]}  ${h[0] === h[1] ? 'SAME' : 'DIFFERENT'}`);
    }
    console.log(same ? 'hash: all frames identical' : 'hash: MISMATCH');
    if (!same) process.exitCode = 1;
  } else if (mode === 'perf') {
    const from = +opt('from', '0')!, to = +opt('to', '5')!;
    const r = await page.evaluate(async ({ from, to, samples, shutter }) => {
      const P = (window as any).__film;
      const ms: number[] = [];
      const buf = new Uint8Array(P.width * P.height * 4);
      P.still(from);
      const used: Record<number, number> = {};
      for (let t = from; t < to; t += 1 / 60) {
        const a = performance.now();
        const k = P.engine.render(t, 1 / 60, false, samples, shutter);
        used[k] = (used[k] ?? 0) + 1;
        await P.engine.readPixelsAsync(buf);
        ms.push(performance.now() - a);
      }
      ms.sort((a, b) => a - b);
      return { n: ms.length, avg: ms.reduce((a, b) => a + b, 0) / ms.length, p50: ms[ms.length >> 1], p95: ms[Math.floor(ms.length * 0.95)], max: ms[ms.length - 1], used };
    }, { from, to, samples: SAMPLES, shutter: +opt('shutter', '0.5')! });
    console.log(`frames ${r.n}  avg ${r.avg.toFixed(1)}ms  p50 ${r.p50.toFixed(1)}  p95 ${r.p95.toFixed(1)}  max ${r.max.toFixed(1)}  sub-frames ${hist(r.used)}`);
  } else if (mode === 'video') {
    const dur: number = await page.evaluate(() => (window as any).__film.duration);
    await video(page, +opt('from', '0')!, +opt('to', String(dur))!, +opt('fps', '60')!, path.resolve(opt('out', path.join(ROOT, 'out/film.mp4'))!));
  }
  const layout: string[] = await page.evaluate(() => (window as any).__film.layout ?? []);
  console.log(layout.length ? `LAYOUT WARNINGS:\n${layout.join('\n')}` : 'layout warnings: 0');
  if (logs.length) console.error('BROWSER LOG:\n' + logs.slice(0, 40).join('\n'));
} finally {
  await browser.close();
  stop();
}
