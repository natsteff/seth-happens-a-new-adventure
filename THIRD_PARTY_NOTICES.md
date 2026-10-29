# Asset and dependency provenance

Level geometry, skyline, drawn NPCs, props, typography layout, jokes, and Web Audio effects are original code in this repository. Seth’s character and walking sheet, Allison, and both cats were made using the built-in image-generation tool from the project's owner-supplied photographs and corrections; the comedy clown, scruffy pedestrian, fictional soccer star and happy concert fans were generated from original prompts. Raw reference photographs are not included. Thirteen WAV recordings were supplied by the project from Downloads on October 26 and copied unchanged under public/audio/ for local use; see that directory’s README for provenance. Owner-provided voices were built using ElevenLabs (https://elevenlabs.io/); the game plays supplied recordings rather than calling a voice service at runtime. Browser TTS remains disabled. The Minnesota United crest (`public/assets/minnesota-united-user-supplied.png`) was provided directly by the project on October 26 for the local fan scene. It remains third-party team artwork/trademark; no license or endorsement is claimed. Display uses the original pixels and a texture crop. No third-party stock visual art, downloaded fonts, starter-game code, or venue assets were added. Browser/system Arial/Helvetica sans-serif is used. The intro skyline (`public/assets/intro-skyline.png`) was generated with the built-in image tool from the project's supplied city photo; the raw photo is not included. Audio includes original synthesized game effects, owner-provided recordings and select effects credited by the owner to Pixabay (https://pixabay.com/sound-effects/). Music is by BT-AI (https://suno.com/@bt_ai). Source originals and private intake records are preserved outside this public payload.

Runtime dependency: Phaser 3.90.0 (MIT), Copyright (c) 2013-2025 Phaser Studio Inc. Reuses its rendering, input, camera and Arcade Physics systems. Its full MIT notice is retained in `licenses/phaser-MIT.txt` and installed package LICENSE.md. Source: https://github.com/phaserjs/phaser/tree/v3.90.0

Build tools: Vite 8.3.5 (MIT), TypeScript 7.0.2 (Apache-2.0). These are development dependencies; their license texts and transitive dependency notices remain in installed packages. Lockfile pins exact resolution. Phaser transitively uses eventemitter3 (MIT). Retained full notice in `licenses/eventemitter3-MIT.txt`.

Public availability does not imply ownership of third-party material or grant additional rights to supplied music, voices, sound effects or team artwork. Existing dependency licenses apply to their respective components.

The title logo and five additional WAV recordings (elevator, goal, crashing, quick jump, cheater) were supplied by the project owner October 26, 2026. The quiet final tower and impact debris are original code-drawn artwork.

Version0.3.0 includes generated directional carry/fall and timeout angel sprites using owner-supplied Seth references. Runtime music MP3s were supplied by the owner and copied unchanged. Full soundtrack: https://suno.com/playlist/0ef61d61-9481-48f2-b67f-989cffdc9cca . Provider credits reflect owner attribution; individual provider licenses are not independently certified here.

Level 2 Thai Takeout Run adds a close-street backdrop and alpha-transparent prop sheet (bus, two cars, dumpster, food cart and takeout bag), generated with the built-in image tool on October 28, 2026 using the project's supplied dusk-city concept as a style reference. Runtime PNGs are unchanged copies. Atlas framing is performed at runtime; original generated files are preserved. Exact prompts and usage notes: docs/thai-art.md. No paid stock art or external audio was added. Existing owner-supplied likeness/audio/team-mark provenance and review limits still apply.

## Scooter Ride additions

`public/assets/scooter/seth-allison-v1.png` was generated with the built-in imagegen tool using the existing owner-authorized game character illustrations as appearance references. It contains a generic electric stand-up scooter without a third-party logo. The generated original is preserved; the game trims its transparent margins at runtime. Exact prompt and provenance: [docs/scooter-art.md](docs/scooter-art.md). Existing street scenery, props, character art and music are reused with their existing attribution and pre-release audit requirements. No Allison voice audio was generated or added.

## Additional New Adventure music

Thai Food Run and Scooter Run were supplied directly by the project for Levels 2 and 3. Runtime MP3s preserve supplied bytes; no external download or audio generation was used. See [audio provenance](public/audio/README.md) for filenames and hashes. Local integration is owner-authorized; new public distribution still requires the release/rights review described above.

## Concert Chaos and supplied logo

The new adventure logo was supplied directly by the project and copied unchanged into public/assets/adventure-logo.png; the original supplied file and prior game logo are preserved. Concert stage art was generated using the built-in imagegen tool, with fictional performers and no band branding; see docs/concert-art.md for the exact prompt and provenance. Existing game character, vehicle and scenery assets are reused under the existing owner authorization and pre-release rights-review requirements. No public distribution authorized by this local implementation.

## Haunted House additions

The mansion-wall scenery was generated with the built-in imagegen tool and copied unchanged into public/assets/haunted/mansion-wall-v1.png; exact prompt/provenance in docs/haunted-art.md. Existing character art is reused as tinted translucent spectral visitors, alongside the existing street/brick scenery and The Haunted Happy Hour soundtrack. Original assets and generated originals remain preserved. No new audio generation or public distribution.

## Zombie Apocalypse and Snow Day additions

These local first efforts reuse the existing street backdrop, owner-authorized character art and unlocked music. Zombie coloration, truck and plow art, buses/bins, snowbanks, snow/ice effects and icicles are generated in code within the scenes. No new third-party download, likeness reference, paid asset or audio was introduced. Existing asset permissions still require the same owner review before public distribution.

## Carnival Catastrophe additions

Carnival tents, string lights, Ferris-wheel structure/gondolas, moving lifts/shuttle and bumper-car texture are original code-drawn scene art. Existing street scenery, familiar character illustrations (including Allison) and unlocked music are reused unchanged. No new reference photo, external download, generated voice, paid asset or soundtrack was introduced. Existing provenance and owner release/rights-review requirements continue to apply.

## October 29, 2026 release and app icons

the project explicitly authorized publishing this New Adventure game and its GitHub Pages build on October 29, superseding the earlier local-only integration notes above. This approval does not assign ownership or grant a new license for third-party marks, music, effects or voices; their attributions remain unchanged. Release review checked the runtime asset inventory and retained dependency notices, isolated saves, disabled shared-score backend, and excluded private instructions/queue/logs, credentials and raw reference photos.

The new app-icon master was generated with the built-in imagegen tool from the project's approved New Adventure logo. iPhone/Android/browser derivatives resize that master; maskable icons add a safe margin. The supplied logo and generated original are preserved. Exact prompt and production sizes: [app-icon notes](docs/app-icons.md).
