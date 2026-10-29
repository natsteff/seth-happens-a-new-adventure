# Thai Takeout artwork

`public/assets/thai/street-backdrop-v1.png` provides the close-building street scenery. It repeats behind the route and remains separate from collision geometry.

`street-props-v1.png` is a transparent atlas containing a bus, directional cars, dumpster, takeout bag and food cart. Runtime frames and collision bodies are defined in `src/thai-scene.ts`.

Playable vehicle tops align with the rendered roofs. Moving vehicles support roof landings; only front contact causes vehicle damage. The takeout bag is attached to the character while carrying food.

## Home lower-facade artwork

`public/assets/thai/home-lower-facade-v1.png` is a separate 1536×1024 transparent cartoon lower-facade asset created with the built-in image generation tool. It is loaded by Level 2 as the distinctive home facade. The supplied logo and street photograph served as architectural/style references, not bundled assets. Supplied originals remain untouched.

The design includes brick piers, tan stone bands, tall teal glass bays, a circular G emblem and recessed covered entry with a curved driveway. Only the lower stories are depicted; full 26-floor architecture and Level 1 final-floor/roof design remain deferred. The artwork introduces no collision geometry. Runtime draws it at 500 world pixels wide, crops transparent margins using a texture frame, and reuses the same texture for a foreground entry pier. Lightweight repeated upper-floor drawing continues the tower above the fixed street camera; no thirty-story texture is allocated. The existing home interaction position stays unchanged. Delivery ends with Seth and Allison approaching the left pedestrian door, disappearing behind the middle pier, and then the existing completion/score flow; there is no elevator ride or elevator audio.

Generation prompt: “Create one transparent lower-street-level apartment facade sprite for a 2D cartoon platform game. Use the left-logo tower identity and supplied entrance architecture; brick/tan/glass, three left and two right leg-like sections, prominent circular G, recessed entry and curved circular drive. Show only lower stories cropped above, no roof or full tower; no characters, cars, extra text or photographic background. Keep an open entry area for the runtime elevator.”
