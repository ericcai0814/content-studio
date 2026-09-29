// The film's time data (data/cues.json): plate windows, every piece of on-screen text with the time it
// appears and leaves, the virtual beat grid (no music, but cuts and sound effects still land on a grid),
// and the sound-effect cue points. Replaces pdoom's lyrics.json / audio.json.

export interface PlateCue {
  id: string;
  /** Plate window in film seconds (cuts land on downbeats of the virtual grid). */
  start: number;
  end: number;
  /** Bone paper plate (light) instead of ink. */
  paper?: boolean;
  /** Working title, for the preview UI and the docs only (never drawn). */
  title: string;
}

export interface TextCue {
  id: string;
  plate: string;
  /** Exactly the string drawn on screen. */
  text: string;
  /** Fully readable from `start` (the entrance begins here) until `end` (the exit begins here). */
  start: number;
  end: number;
  /** Typographic role: display | headline | body | note | label | stamp | annotation. */
  role: string;
  /** Verbatim excerpts of dept-brain.md that back a text which is not itself a verbatim excerpt. */
  source?: string[];
}

export interface SfxCue {
  t: number;
  kind: string;
  plate: string;
  note?: string;
}

export interface CueData {
  bpm: number;
  /** Film time of beat 0. */
  offset: number;
  beatsPerBar: number;
  duration: number;
  plates: PlateCue[];
  texts: TextCue[];
  sfx: SfxCue[];
}

export class Cues {
  private byId = new Map<string, TextCue>();
  constructor(public data: CueData) {
    for (const c of data.texts) this.byId.set(c.id, c);
  }

  static async load(): Promise<Cues> {
    const r = await fetch('data/cues.json');
    if (!r.ok) throw new Error(`data/cues.json: HTTP ${r.status}`);
    return new Cues(await r.json());
  }

  get duration() { return this.data.duration; }
  get plates() { return this.data.plates; }

  /** The text cue with this id (throws: a scene asking for a missing cue is a bug, not a blank frame). */
  get(id: string): TextCue {
    const c = this.byId.get(id);
    if (!c) throw new Error(`text cue not found: ${id}`);
    return c;
  }

  /** All text cues of a plate whose id starts with `prefix` (e.g. 'schedule.w'), in file order. */
  list(prefix: string): TextCue[] {
    return this.data.texts.filter((c) => c.id.startsWith(prefix));
  }

  get beatLen() { return 60 / this.data.bpm; }
  /** Continuous beat index at t. */
  beatAt(t: number) { return (t - this.data.offset) / this.beatLen; }
  barAt(t: number) { return this.beatAt(t) / this.data.beatsPerBar; }
  timeOfBeat(i: number) { return this.data.offset + i * this.beatLen; }
}
