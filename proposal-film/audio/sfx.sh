#!/usr/bin/env bash
# Synthesise the film's sound-effect track from data/cues.json (sfx[]). No samples, no music: every
# kind is one ffmpeg lavfi recipe (deterministic: fixed noise seeds), each event is placed at its cue
# time, and the mix is loudness-normalised to -16 LUFS with a -2 dBTP ceiling (two-pass loudnorm:
# measure the dry mix, then apply one linear gain from that measurement).
#
#   audio/sfx.sh [out.wav]        default: out/sfx.wav (out/ is not in git)
#   then: cd app && bun scripts/render.ts video --audio ../out/sfx.wav ...
#
# Kinds (see docs/TREATMENT.md): rise (low swell), whoosh (filtered noise), paper (rustle),
# stamp (muffled thud), tick (counter), ding (glass), soft (the outro's closing chord).
# Every recipe starts at full attack within ~10 ms, so a sound lands on its cue, not after it.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(dirname "$here")
cues="$root/data/cues.json"
out="${1:-$root/out/sfx.wav}"
work="$root/out/sfx-parts"
mkdir -p "$work" "$(dirname "$out")"
SR=48000

synth() { ffmpeg -y -loglevel error -f lavfi -i "$2" -ar $SR -ac 2 "$work/$1.wav"; }
synth rise   "aevalsrc='0.55*sin(2*PI*(38*t+16*t*t))*min(t/0.01,1)*(0.35+0.65*min(t/0.9,1))*max(0,1-t/1.8)':d=1.8:s=$SR"
synth whoosh "anoisesrc=d=0.75:c=pink:r=$SR:a=0.6:seed=7,bandpass=f=900:width_type=o:w=2,afade=t=in:d=0.01,afade=t=out:st=0.05:d=0.7:curve=exp"
synth paper  "anoisesrc=d=0.35:c=white:r=$SR:a=0.35:seed=3,highpass=f=2200,lowpass=f=9000,tremolo=f=28:d=0.8,afade=t=in:d=0.005,afade=t=out:st=0.08:d=0.27"
synth stamp  "aevalsrc='0.9*sin(2*PI*62*t)*exp(-t*16)+0.35*sin(2*PI*131*t)*exp(-t*26)+0.25*(random(0)*2-1)*exp(-t*90)':d=0.5:s=$SR"
synth tick   "aevalsrc='0.45*sin(2*PI*2400*t)*exp(-t*70)':d=0.1:s=$SR"
synth ding   "aevalsrc='0.3*(sin(2*PI*1568*t)+0.45*sin(2*PI*2352*t)+0.25*sin(2*PI*3920*t))*exp(-t*2.6)*min(t/0.004,1)':d=2:s=$SR"
synth soft   "aevalsrc='0.25*(sin(2*PI*196*t)+0.6*sin(2*PI*294*t)+0.35*sin(2*PI*392*t))*min(t/0.01,1)*exp(-t*0.8)':d=4.5:s=$SR"

dur=$(jq -r '.duration' "$cues")
inputs=()
filters=""
labels=""
i=0
while IFS=$'\t' read -r t kind; do
  [[ -f "$work/$kind.wav" ]] || { echo "no recipe for sfx kind '$kind'" >&2; exit 1; }
  inputs+=(-i "$work/$kind.wav")
  ms=$(awk -v t="$t" 'BEGIN { printf "%d", t * 1000 + 0.5 }')
  filters+="[$i:a]adelay=${ms}|${ms}[e$i];"
  labels+="[e$i]"
  i=$((i + 1))
done < <(jq -r '.sfx[] | [.t, .kind] | @tsv' "$cues")

filters+="${labels}amix=inputs=$i:normalize=0:dropout_transition=0,apad,atrim=0:$dur[out]"
dry="$work/dry.wav"
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "$filters" -map "[out]" -ar $SR -ac 2 -c:a pcm_f32le "$dry"

# pass 1: measure; pass 2: normalise with the measured values (linear: one gain, transients intact)
LN="I=-16:TP=-2:LRA=11"
m=$(ffmpeg -hide_banner -nostats -i "$dry" -af "loudnorm=$LN:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
val() { jq -r ".$1" <<<"$m"; }
ffmpeg -y -loglevel error -i "$dry" -af "loudnorm=$LN:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true,aresample=$SR" -ar $SR -ac 2 -c:a pcm_s16le "$out"
echo "wrote $out ($i events, ${dur}s; dry mix measured $(val input_i) LUFS)"
