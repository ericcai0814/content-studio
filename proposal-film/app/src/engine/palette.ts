import { hexToLinear } from './util';

// The film's palette (docs/TREATMENT.md): ink, bone and one signal colour, the ewill teal.
// Only signal glows, and it is the film's only accent; redline belongs to the correction marks on
// the copies plate only.
export const HEX = {
  ink: '#0A0A0B', // background black
  ink2: '#151517', // raised black (panels, slabs)
  graphite: '#5E5B57', // dim lines, secondary text
  ash: '#9C978F', // mid grey
  bone: '#EEE9DF', // paper white, primary text
  signal: '#00979C', // ewill teal: the thread, the one thing that glows
  redline: '#B0382B', // only the correction marks on plate 2
} as const;

export type PaletteKey = keyof typeof HEX;

/** Linear RGB triplets for GL uniforms. */
export const LIN: Record<PaletteKey, [number, number, number]> = Object.fromEntries(
  Object.entries(HEX).map(([k, v]) => [k, hexToLinear(v)]),
) as Record<PaletteKey, [number, number, number]>;

/** CSS rgba() for Canvas2D. */
export function rgba(key: PaletteKey | string, a = 1): string {
  const hex = (HEX as Record<string, string>)[key] ?? key;
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
