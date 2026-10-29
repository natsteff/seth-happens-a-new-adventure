# Seth Happens - A New Adventure

A separate game project derived from the complete **Seth Happens v0.3.12** release. First local version: **0.1.0**.

This version retains the original 26-rooftop beer run, characters, two photo objectives, hazards, elevator secret, timeout sequence, scoring, keyboard/controller/mobile controls, sound effects, voices, radio and outcome music. The initial change is the dusk-city scenery: illustrated skyline and river, textured brick buildings, stone roof caps and decorative rooftop ventilation. Collision geometry, movement, timer and scoring rules are unchanged.

The game has a separate browser-storage namespace for scores, preferences, touch controls and update guards. It never imports or clears the original game's records.

## Run locally

Use Node >=22.13.0 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
./dev.sh
```

Use the local URL printed by Vite; occupied ports cause it to select another port. `pnpm build` typechecks and builds `dist/`. `pnpm test` runs the existing regression suite, including a loopback-only server test. The optional leaderboard server code is retained from the release, but shared scores remain disabled. No backend is deployed.

## Computer and mobile

The same scenery renders in the existing game world on desktop and mobile. It scales with the canvas and leaves the existing responsive touch controls intact. Landscape Home Screen app play remains the inherited recommended mobile path. Browser viewport checks do not establish physical iOS, Android or controller acceptance. No new mobile-browser fixes are included.

## Music, sound and asset credits

## Release status

