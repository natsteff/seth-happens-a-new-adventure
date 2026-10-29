# Thai Takeout artwork

`public/assets/thai/street-backdrop-v1.png` provides the close-building street scenery. It repeats behind the route and remains separate from collision geometry.

`street-props-v1.png` is a transparent atlas containing a bus, directional cars, dumpster, takeout bag and food cart. Runtime frames and collision bodies are defined in `src/thai-scene.ts`.

Playable vehicle tops align with the rendered roofs. Moving vehicles support roof landings; only front contact causes vehicle damage. The takeout bag is attached to the character while carrying food.
