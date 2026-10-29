# Seth Happens - A New Adventure

Level 1 retains the original 26-rooftop beer run, characters, two photo objectives, hazards, elevator secret, timeout sequence, scoring, keyboard/controller/mobile controls, sound effects, voices, radio and outcome music. Its scenery uses a dusk-city treatment: illustrated skyline and river, textured brick buildings, stone roof caps and decorative rooftop ventilation. Collision geometry, movement, timer and scoring rules are unchanged.

The game has a separate browser-storage namespace for scores, preferences, touch controls and update guards. It never imports or clears the original game's records.

## Run locally

Use Node >=22.13.0 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
./dev.sh
```

Use the local URL printed by Vite; occupied ports cause it to select another port. `pnpm build` typechecks and builds `dist/`. `pnpm test` runs the existing regression suite, including a loopback-only server test. The optional leaderboard server code is retained from the release, but shared scores remain disabled. No backend is deployed.

## Level 2 · Thai Takeout Run

Complete **Level 1** once to unlock **Level 2**, then replay either from **Choose Level** on desktop or in the mobile menu. The unlock is saved in this browser independently of scores; clearing browser site data removes it. Existing saved rooftop finishes in this new game also count. Original Seth Happens records do not unlock this game. Level 1 also offers **Continue to Level 2** after completion. Direct local link: `/?level=thai` (returns to Level 1 while locked).

Head right from the apartment to the Thai restaurant, then press **F / Action** at the pickup door. Return left to the apartment and press **F / Action** at the elevator to complete delivery. No photo or soccer interaction is required. The route includes jumpable dumpsters, parked buses, food carts and one-/two-story buildings. Moving vehicles support landings and riding on their roofs, hoods and trunks. Only their front bumper causes vehicle damage; rear/roof contact is harmless. Familiar wandering pedestrians remain hazards. On the return, traffic is faster and a food snatcher chases Seth within its block.

- 180-second run deadline; pause freezes gameplay, time, and food warmth.
- Food starts at 100% condition and warmth when collected. Warmth falls one point per active return second.
- A hit reduces food condition by 12 and warmth by 8; the food snatcher reduces them by 20 and 12. A 1.6-second recovery window prevents repeated damage from one contact. Outbound hits affect the mishap count but cannot damage food not yet collected.
- A battered/cold order remains deliverable. Final score: 1,000 delivery + 10 × condition + 10 × remaining warmth + 10 × whole seconds below 180, minus 25 per hit, floored at zero.
- Entering the home elevator secures the food and freezes its delivery time/warmth. The elevator ride uses the existing sound timing and supports pause.
- Takeout records are local-only and separate from rooftop records. No existing records are migrated or rewritten.

New sprites and close-building backdrop were generated with imagegen. See [art and exact prompts](docs/thai-art.md). Collision geometry remains separate from the art.

## Computer and mobile

The same scenery renders in the existing game world on desktop and mobile. It scales with the canvas and leaves the existing responsive touch controls intact. Landscape Home Screen app play remains the inherited recommended mobile path. Browser viewport checks do not establish physical iOS, Android or controller acceptance. No new mobile-browser fixes are included.

## Music, sound and asset credits

## Release status

