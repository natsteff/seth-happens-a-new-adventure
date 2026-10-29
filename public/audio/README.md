# Owner-supplied voice recordings

Provided directly by the project October 26, 2026; copied byte-for-byte from the named Downloads files. Originals untouched. Included in the October 29, 2026 release with the project's publication approval. No voice cloning or robotic browser TTS.

| Runtime file | Supplied file | Trigger | Duration |
| --- | --- | --- | --- |
| grunt.wav | jump.wav | Jump | 0.50s |
| fall.wav | fall.wav | Falling off a balcony | 0.89s |
| person.wav | excuse you.wav | Bumping a pedestrian/clown | 1.30s |
| beer.wav | mmm, beer.wav | Six-pack pickup | 1.85s |
| start.wav | lets go.wav | BEER RUN intro on load/restart | 3.32s |
| win.wav | great success.wav | Completed level | 1.57s |

All are mono PCM16, 44.1 kHz. Combined files: 831,866 bytes (~0.83 MB). No conversion or destructive trimming. src/voice-clips.ts resolves local files using Vite’s relative base. Decode in parallel once after audio unlock; reuse decoded AudioBuffers. MP3 conversion is unnecessary for this small set.

A browser gesture is required on first load before audio can start. The intro overlay freezes physics and disables gameplay until the actual clip-ended event, including when muted. The Sound button/S mutes both voices and original synthesized effects. Higher-priority reactions interrupt lower-priority grunts; grunts cannot cut off intro, beer, fall, collision or win lines. Voice level and small effects level use separate gain stages through the same master mute.

## Additional owner-supplied effects

| Runtime file | Supplied file | Trigger | Duration |
| --- | --- | --- | --- |
| ahh.wav | ahh sfx.wav | Random non-person collision reaction | 0.50s |
| ouch.wav | ouch sfx.wav | Random non-person collision reaction | 0.76s |
| soccer.wav | soccer chant sfx.wav | First Loon Zone arrival each run | 6.07s |
| concert.wav | guitar effect.wav | First concert arrival each run | 2.37s |
| jet.wav | jet sfx.wav | First approach to each baggage location (floors 13 and 22) each run | 2.24s |

Copied unchanged from the project's supplied Downloads files. The full eleven-file set totals 2,339,046 bytes (~2.34 MB). Location cues play on a separate, quieter layer so grunts and other voice reactions do not cut them off. Master mute and restart stop location playback. Per-location guards reset with the run. Object-reaction random choice excludes people and falls, which retain their dedicated clips. No format conversion was needed.

## Arrival and falling-object clips

- `hero.wav`: copied unchanged from the project's `my hero.wav` (1.23s). Plays once on first landing on floor 26. Delivery is locked until the actual playback-end event; mute silences it without shortening the lock. Higher priority prevents grunts interrupting the line. Restart clears the arrival gate safely.
- `squish.wav`: copied unchanged from the project's `squish sfx.wav`. A piano hitting Seth uses this clip instead of the ordinary object-bump reaction. Other objects keep random ouch/ahh, people keep excuse-you, and the early ledge-fall scream remains separate.

Intro autoplay is attempted immediately; browser policy may require a first gesture. S toggles all sound. Original supplied files are untouched and runtime recordings are included in the public game.

Additional owner recordings: elevator.wav (ride, arrival synchronized to end), goal.wav (Easter egg kick), crashing.wav (cooler debris), quick-jump.wav (tap jump), cheater.wav (shortcut arrival). Originals preserved.

Soundtrack: owner-supplied unmodified MP3 files in music/ (Arcade Staircase, The Beer of Destiny, Twenty-Six Floors of Celts, Go Seth Go, The Haunted Happy Hour). Runtime copies from the project's provided files; original intake hashes are retained privately by the project owner. No third-party download in this update. Countdown/outcome tracks are also owner supplied: The Final Warning, System Failure Imminent, Failure - Twenty-Six Floors for Nothing, Big Stupid Cheater, 26 Floors of Glory, Eye of the Stairwell. All runtime MP3s preserve supplied bytes; no Beer Delivery World Champion track is used.

## New Adventure level soundtracks · October 28, 2026

Owner-supplied MP3s copied byte-for-byte; supplied originals remain unchanged. Initially integrated for local review; included in the owner-approved October 29 release. Both are stereo 48 kHz MP3. No transcoding or trimming.

| Runtime file | Supplied file | Default / unlock | Browser duration | SHA-256 |
| --- | --- | --- | --- | --- |
| music/thai-food-run.mp3 | Thai Food Run.mp3 | Level 2; unlocks with Level 2 | 176.60s | d982b6af5c331755bb512758cf263f5b64bd6b2320fd849c0c8ed17efd0e01e3 |
| music/scooter-run.mp3 | Scooter Run.mp3 | Level 3; unlocks with Level 3 | 132.20s | 5e0863db44880a8fe8b78dafa4a0b924dcf5b24424269aa0c3b2613d5d3823b2 |

Once unlocked, either track can be selected on any level. Tracks stream on demand through the existing radio; no backend or audio service added. Level 1's initial five tracks/order/default, countdown tracks and outcome tracks are retained. Per-level choices use seth-new-adventure.level-music.v1, separate from original-game settings and all score/progress keys.

Concert Chaos soundtrack supplied by the project October28: `Eye of the Stairwell (Leads Take Me Away!).mp3`, copied unchanged into `music/concert-eye-of-the-stairwell.mp3`. Stereo48kHz MP3; estimated224.832s. SHA256 source/runtime:93885e7f101ed6b21ae79726fb43394d198129600b7121e847bb67b0979e3341. Level4 default, track8; unlocks with Concert Chaos and then selectable on any level. The existing `music/eye-of-the-stairwell.mp3` champion track is a separate supplied recording and is untouched. No transcoding; included in the owner-approved October 29 release.
