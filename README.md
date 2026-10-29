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

## Level 3 · Scooter Ride

Complete **Level 2** to unlock **Level 3**, then replay any unlocked level at any time. Thai delivery completion grants access before saving a score and offers a Continue button. Previously saved valid new-game Thai finishes also qualify after Level 1 completion. `/?level=scooter` respects the lock. Progress remains independent of score records; unavailable/corrupt storage falls back to session unlocks without overwriting unreadable data.

Seth drives a stand-up electric scooter with Allison behind him on the same deck. Auto-forward momentum keeps the ride moving. **A / Left** brakes, **D / Right / Shift** accelerates, and **W / Up / Space** hops. Mobile arrows and controller stick/D-pad brake or accelerate; Jump / A / Cross hops. **F / Action / X / Square** toggles the optional high ramp. The five main ramps launch automatically, building from a dumpster hop to bus and rooftop leaps. The optional higher route awards one 750-point sky bonus; the lower route remains available.

Allison's grip starts at 100%. Walker, bird, sign and front-obstacle impacts cost 18; exceptionally hard landings cost 10, with 1.5 seconds of recovery between hits. Roof landings and rear contacts are safe. Zero grip or a 120-second rental expiry fails the ride without a record. Finish with Allison aboard to score: 2,000 + 20 × grip + sky bonus + 10 × whole seconds remaining below 120 − 100 × bumps. The first route takes roughly 16–35 seconds depending on speed; this is an initial gameplay pass for tuning.

## Level 4 · Concert Chaos

Regular jumps, double-tap Mega Jump, sprint, controller/touch controls, pause, restart and music are reused. Street vehicles remain landable and damage only at their front bumper. Concertgoers, spilled drinks and a crowd surfer provide obstacles. Losing stamina returns Seth to the current checkpoint; a full restart clears the pass and photographs. Three successful shots finish with **SETH GOT THE SHOT!** and a separate local record book. Score: 4,000 + 750 per saved shot − 5 per rounded-up run second − 80 per mishap − 100 per missed photo, floored at zero. **Eye of the Stairwell (Leads Take Me Away!)** is the Level4 default, unlocked with Concert Chaos and then selectable on every level as track8. It is separate from the existing champion-track recording.

## Level 5 · Haunted House

Complete Concert Chaos to unlock Haunted House. Cross the dark neighborhood and press **F / Action** at the mansion door. Climb four floors using the east, west and attic staircases. The landing bell sets a checkpoint; the attic key sets another checkpoint and wakes a pursuing ghost. Escape down the long east staircase to the exit door within 90 active seconds, then press **F / Action** to leave. Running out of escape time returns Seth to the attic checkpoint with another attempt; losing stamina returns him to the current checkpoint. A full restart clears entry, key and checkpoints.

Ghosts disappear, glow as a harmless warning, become solid hazards, then fade harmlessly. Warning marks precede falling books; landed books are harmless. Familiar characters appear as spectral visitors, with the larger landlord ghost joining the escape. Platforms have clearly highlighted wood tops; mansion treads and floor sections use one-way support, allowing upward jumps through them. Controls, Mega Jump, sprint, pause, touch/controller input and independent records are reused. Score: 5,000 + 20 per rounded-up escape second remaining − 100 per scare − 3 per rounded-up total run second, floored at zero.

## Level 6 · Zombie Apocalypse

Complete Haunted House to unlock Zombie Apocalypse. Survive a close-building neighborhood, jumping over familiar zombie characters and climbing bins and parked buses. Sprint from the bins to reach the bus roofs. Allison advances independently and clears nearby threats herself; there is no rescue objective. Press **F / Action** beside the truck to board together. The finale automatically drives forward: left brakes, right accelerates, and Jump clears marked barricades. Truck contact flattens zombies; reaching the safe zone completes the level. Stamina loss returns to the street start or truck checkpoint. Restart clears the truck and horde. Score: 6,000 + 100 per zombie flattened − 5 per whole run second − 100 per hit, floored at zero.

## Level 7 · Snow Day From Hell

Complete Zombie Apocalypse to unlock Snow Day. Reach the warming shelter and press **F / Action**. Blue strips mark ice: releasing movement leaves a slide, while steering against it brakes faster. Snowbanks provide stepped high routes. Snowplow roofs and rear contacts are safe; directional front impacts and periodic thrown snow walls hurt. Yellow warnings precede falling icicles. Two warm bus stops automatically restore stamina and save checkpoints. Snow and periodic haze preserve visibility of platform tops and hazards. Score: 6,500 − 8 per whole run second − 125 per hit, floored at zero.

## Computer and mobile

The same scenery renders in the existing game world on desktop and mobile. It scales with the canvas and leaves the existing responsive touch controls intact. Landscape Home Screen app play remains the inherited recommended mobile path. Browser viewport checks do not establish physical iOS, Android or controller acceptance. No new mobile-browser fixes are included.

## Music, sound and asset credits

## Unlockable level music

Level 1 starts with the original five radio choices and Arcade Staircase as its default. Unlocking Level 2 also unlocks **Thai Food Run**, which is Level 2's default. Unlocking Level 3 also unlocks **Scooter Run**, which is Level 3's default. Each unlocked soundtrack is available on every level through the radio's Track picker (in the mobile menu), previous/next buttons, or keys **6**, **7**, and **8**. Locked tracks cannot be selected by shortcut or restored from an old preference.

## Release status

