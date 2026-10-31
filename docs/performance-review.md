# Memory and performance review

Reviewed with the v0.13.0 early-alpha changes. Measurements below come from a desktop browser running the real Phaser scenes; they are not physical iPhone acceptance or a total process/GPU-memory measurement.

## Changes

- Keep supplied/generated originals intact. Load smaller runtime copies for small character portraits, walking/carrying sheets, title art and the team logo. Animation frame counts and logical display/collision sizes are unchanged.
- The team logo falls from 3840×2160 to 384×216: about 31.64 MiB to 0.32 MiB per decoded RGBA copy. The rooftop preload’s PNG dimensions sum to **121.64 MiB before / 46.35 MiB after**, a reduction of about 62%. This comparison excludes generated textures, canvas copies, renderer overhead and audio.
- Four new character sheets use 768×768 shared atlases. The new home tower uses repeating vector floor sections, not a giant 26-story bitmap.
- On scene shutdown, remove textures exclusive to that scene and their dependent animations. Keep a small reusable core. Remove loader listeners when the scene stops.
- At the static jukebox finale, release the dance/cast/venue images and retain only the logo. On close, cancel rendering, stop/unload the selected stream, release the remaining art and shrink the canvas. A visit token rejects image decodes that finish after close. The cast roster shares images by path rather than decoding a separate image per character crop.
- Gameplay music and jukebox music stream the selected song rather than predecoding a catalogue. Existing voice recordings total roughly 8 MiB as Float32 samples at their source rates; audio decoder/device rates can change actual allocation. Curtain-call applause is a short transient synthesized buffer.

## Repeated scene-switch check

Two consecutive passes visited all 13 entries through the actual level-switch path. Each scene had the same texture count and RGBA estimate on both passes. Estimates sum Phaser texture source dimensions ×4; they do not include all hidden renderer/browser copies.

| Entry | Texture count, both passes | Estimated source RGBA MiB, both passes |
| --- | ---: | ---: |
| Rooftop | 152 | 69.17 |
| Thai | 50 | 52.37 |
| Scooter | 39 | 62.94 |
| Concert | 33 | 39.54 |
| Haunted | 39 | 44.16 |
| Zombie | 32 | 46.47 |
| Snow | 44 | 48.12 |
| Carnival | 44 | 36.82 |
| Cabin | 38 | 32.96 |
| Grocery | 37 | 30.69 |
| Soccer | 35 | 31.05 |
| Last Call | 28 | 35.60 |
| Encore prototype | 33 | 66.67 |

No scene-switch runtime errors were captured during this check. The optional browser JS heap reading fluctuated with garbage collection; it is not used to claim that every leak is eliminated. A two-pass switch check also does not replace long gameplay sessions, all failure paths, physical-device frame-time measurements or iOS memory-pressure testing. Existing build chunk-size advisory remains.
