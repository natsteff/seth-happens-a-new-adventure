# Asset and dependency notices

## Game artwork and audio

Character illustrations, city scenery, the logo and app icons include AI-generated artwork. Reference photographs are not distributed. Level geometry, decorative props, interface artwork and synthesized game effects also include original code-drawn content.

Music is credited to **[BT-AI](https://suno.com/@bt_ai)**. [Full soundtrack playlist](https://suno.com/playlist/0ef61d61-9481-48f2-b67f-989cffdc9cca). Music files are distributed as recorded, without transcoding.

Selected sound effects are credited to **[Pixabay](https://pixabay.com/sound-effects/)**. Voice recordings were produced using **[ElevenLabs](https://elevenlabs.io/)** and play as audio files; the game does not call a voice service at runtime. See [audio credits](public/audio/README.md).

The Minnesota United crest in `public/assets/minnesota-united-user-supplied.png` is third-party team artwork and a trademark. No ownership, license or endorsement is claimed for that mark. The game has no official team, band or venue affiliation. Stage performers are fictional.

Public availability does not grant a blanket license to redistribute the game's artwork, likenesses, music, recordings or third-party marks. Their respective rights remain unchanged.

The Victorian mansion, cemetery, woods and Thai street-vehicle atlas are original AI-generated artwork. Their runtime images are resized copies; supplied reference screenshots are not distributed. Existing cast images are reused for animated Thai pedestrians.

Four additional concertgoers and the weathered log/boulder atlas are original AI-generated artwork. Existing Scooter cast and Thai vehicle artwork are reused. Supplied reference screenshots are not distributed.

## Dependencies

- **Phaser 3.90.0** — MIT, Copyright (c) 2013–2025 Phaser Studio Inc. [Full notice](licenses/phaser-MIT.txt). [Source](https://github.com/phaserjs/phaser/tree/v3.90.0).
- **Firebase JavaScript SDK 13.2.0** (App, Anonymous Authentication and Firestore) — Apache-2.0. [Full notice](licenses/firebase-Apache-2.0.txt).
- **idb** — ISC. [Full notice](licenses/idb-ISC.txt).
- **protobufjs** — BSD-3-Clause. [Full notice](licenses/protobufjs-BSD.txt).
- **long** — Apache-2.0. [Full notice](licenses/long-Apache-2.0.txt).
- **eventemitter3** — MIT. [Full notice](licenses/eventemitter3-MIT.txt).
- **Vite 8.3.5** — MIT; development dependency.
- **TypeScript 7.0.2** — Apache-2.0; development dependency.

Build-tool and transitive dependency notices are included with their installed packages. Browser/system Arial and Helvetica are used; no downloaded fonts are included.

## Artwork references

Technical descriptions of runtime artwork and icon sizes are available in [scenery notes](docs/scenery.md), [Thai Takeout art](docs/thai-art.md), [Scooter Ride art](docs/scooter-art.md), [Concert Chaos art](docs/concert-art.md), [Haunted House art](docs/haunted-art.md) and [app icons](docs/app-icons.md).

Cabin Fever woods, cabin, lake, boats, docks, cooler and wildlife are drawn in scene code; existing Seth/Allison art and audio are reused. See [Cabin Fever art](docs/cabin-art.md).

## Birthday Surprise audio

`public/audio/birthday/happy-birthday-seth.mp3` is the owner-supplied custom “Happy Birthday, Seth” recording. Dedicated generated birthday atlases are based on the existing owner-approved Seth/Allison artwork; fitted hat/horn and held camera are baked into the poses. The cloth birthday banner is a generated transparent atlas. Confetti, lighting and camera flash are drawn in code. No additional third-party assets or services were introduced.

The Cabin Fever Unicorn Haze six-pack is an owner-supplied design prepared as a transparent pickup sprite. Its original reference is kept locally; only the selected game cutout is distributed.

## Beta scene artwork and supplied effects

Grocery fixtures, milk/bread/egg pickups and shopping cart, Carnival food-vendor walking poses and roller-coaster car are generated transparent sprite assets. Existing approved cast artwork is reused for ordinary shoppers and the information-booth attendant. Physics bodies remain separate from decorative artwork.

Grocery collection and high Scooter launches use owner-supplied Pixabay recordings; authors, source links and license links are listed in [audio credits](public/audio/README.md). Supplied originals remain local.

The Grocery carried basket and opening parking-lot backdrop are generated game artwork. The basket has transparent alpha and attaches to the existing hand anchor; parking-lot scenery has no collision bodies.
