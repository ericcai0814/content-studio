// The edit: which plate plays when (structure from pdoom-video, MIT). Plate windows come from
// data/cues.json, where every cut sits on a downbeat of the virtual beat grid. Windows touch, so
// every cut is a hard cut.
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Cues } from './engine/cues';

// Scene modules are discovered lazily so a missing/broken scene never breaks the build. The 105 s
// film's plates live in scenes/, the 38 s cut's shots (cues.json `composition: "v3"`) in scenes-v3/.
const modules = { ...import.meta.glob<{ default: SceneClass }>('./scenes/*.ts'), ...import.meta.glob<{ default: SceneClass }>('./scenes-v3/*.ts') };
const scene = (dir: string, name: string) => () => {
  const m = modules[`./${dir}/${name}.ts`];
  return m ? m() : Promise.reject(new Error(`scene module not found: ${dir}/${name}.ts`));
};

export function makeTimeline(cues: Cues): TimelineEntry[] {
  const dir = cues.data.composition === 'v3' ? 'scenes-v3' : 'scenes';
  return cues.plates.map((p) => ({
    id: p.id,
    load: scene(dir, p.scene ?? p.id),
    start: p.start,
    end: p.end,
    params: { paper: !!p.paper },
    post: p.paper ? { paper: 1 } : undefined,
  }));
}
