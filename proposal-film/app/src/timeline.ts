// The edit: which plate plays when (structure from pdoom-video, MIT). Plate windows come from
// data/cues.json, where every cut sits on a downbeat of the virtual beat grid. Windows touch, so
// every cut is a hard cut.
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Cues } from './engine/cues';

// Scene modules are discovered lazily so a missing/broken scene never breaks the build.
const modules = import.meta.glob<{ default: SceneClass }>('./scenes/*.ts');
const scene = (name: string) => () => {
  const m = modules[`./scenes/${name}.ts`];
  return m ? m() : Promise.reject(new Error(`scene module not found: scenes/${name}.ts`));
};

export function makeTimeline(cues: Cues): TimelineEntry[] {
  return cues.plates.map((p) => ({
    id: p.id,
    load: scene(p.id),
    start: p.start,
    end: p.end,
    params: { paper: !!p.paper },
    post: p.paper ? { paper: 1 } : undefined,
  }));
}
