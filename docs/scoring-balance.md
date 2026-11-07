# Rooftop, Carnival and Cabin scoring balance

This change affects only these three levels. Controls, objectives, collision geometry, stamina, checkpoints and other level formulas are unchanged.

## Rooftop

Original: `max(0, objectives − 10 × total mishaps) + time bonus`.

Revised: `max(0, objectives + time bonus − 300 × falls − 250 × squishes − 200 × bumps)`.

Objectives remain 1,000 finish, 500 for beer, 250 per on-time photo and 125 per late photo. Time bonus remains `max(0, 120 − ceil(seconds)) × 100`. Shortcut runs remain fixed at −10,000.

Staged native Arcade measurements at sprint speed replayed setbacks of 46/106/154 pixels in approximately 0.13/0.28/0.42 seconds. The 1.4-second immunity window permits immediate movement; it must not be counted as a forced delay. Falls can additionally lose airborne time before recovery. This is why the original ten-point deduction did little to discourage cutting through hazards. New direct deductions equal 2–3 seconds of time bonus, plus actual recovery time, with falls highest. Applying deductions to the whole total prevents heavy mishaps from becoming free after objective points reach zero. Fast clean play still wins; photos have not been increased.

## Carnival

Formula remains `max(0, 6500 + optional bonuses − floor(seconds) × 6 − hits × 100)`.

| Activity | Original | Revised | Time-only break-even |
|---|---:|---:|---:|
| Ferris wheel | 1,000 | 150 | 25 seconds, formerly 167 |
| Coaster | 500 | 75 | 12.5 seconds, formerly 83 |

A staged, mounted bottom gondola reached the sky award in about 4.02 seconds. Boarding, exit positioning and a possible missed connection add time; the wheel cycle is ten seconds. Use a 6–12-second added-time range for the wheel, rather than treating the full cycle as a guaranteed delay. The coaster approach has three 70-pixel climbs, a 1,320-pixel elevated route, and an opposing car; a 3–6-second detour is a representative estimate, not a measured full-player population result.

At eight extra seconds, the wheel's new 150 points yield +102 if clean, +2 if it costs one hit, and can lose value after a failed attempt. At four extra seconds, the coaster's 75 points yield +51 clean or −49 with one extra hit. This rewards clean optional activity while giving uncertain players a reasonable reason to skip. The original once-per-run bonus flags remain authoritative.

These are bounded initial values, not claims based on telemetry. Very skilled routes may collect a bonus with less added time; owner playtesting should check incidental awards and repeated-route optimizations before any further adjustment.

## Cabin cargo

After pickup, an accepted ordinary damaging hit removes five condition points. Any respawn removes fifteen instead; a stamina-depleting hit is not also charged five. Before pickup and on harmless or invulnerable contact, condition is unchanged. Condition is clamped to 0–100, with no decay or warmth.

The base damage handler still decides whether a collision is accepted. Existing 1.4-second immunity prevents per-frame duplicate damage. The Cabin wrapper detects whether that hit called respawn and chooses only the respawn loss. Condition updates appear immediately in the return HUD and damage message. Stamina/checkpoint behavior is unchanged.

The formula is unchanged: `max(0, 7000 + condition × 15 − floor(seconds) × 5 − hits × 100)`.

Accepted collisions increment the hit count once; stamina-depletion respawn adds no second hit. Lake/out-of-bounds recovery increments the hit count once before respawn. Thus an ordinary post-pickup hit costs 175 points (75 cargo +100 hit), and a lake/lethal recovery costs 325 (225 cargo +100 hit), plus actual lost time. Five ordinary hits followed by a lethal sixth hit leave 60% condition, not 55%. At 0%, further cargo penalties stop but normal hit/time penalties remain.

## Representative strategies

The following are illustrative full-run scenarios, not measured end-to-end player runs. Actual recovery and wheel timing above were measured in staged native gameplay. Both Rooftop photos are taken on time in each Rooftop row.

| Level / strategy | Scenario | Original | Revised |
|---|---|---:|---:|
| Rooftop fast/reckless | 44s; 1 fall, 1 squish, 3 bumps | 9,550 | 8,450 |
| Rooftop careful | 49s; clean | 9,100 | 9,100 |
| Rooftop skillful | 46s; 1 bump | 9,390 | 9,200 |
| Carnival fast/reckless | 55s; 3 hits, no bonuses | 5,870 | 5,870 |
| Carnival careful | 62s; clean, no bonuses | 6,128 | 6,128 |
| Carnival completionist | 74s; 1 hit, both bonuses | 7,456 | 6,181 |
| Cabin fast/reckless | 100s; 4 ordinary hits +1 lake recovery; condition 90→65 | 7,350 | 6,975 |
| Cabin careful | 115s; 1 ordinary hit; condition 100→95 | 7,825 | 7,750 |
| Cabin skillful | 108s; clean, condition 100 | 7,960 | 7,960 |

The comparison script evaluates the original committed functions and revised functions directly. It does not recompute anyone's saved records.

## Score versions and safety

Rooftop/Carnival/Cabin use fresh versioned boards while preserving earlier records. Their current edition is `risk-v2`; the original edition remains stored separately. The other nine levels retain their original local/online identities. No records are deleted or migrated.

The shared local journal retains both editions. High Scores exposes Current balance / Earlier scores for the three affected levels; Online and This Device remain independent view controls. Old pending submissions retain their original rules and synchronize only to their original board. Current-rule local clearing does not remove archived rows.

Firestore continues to require linked atomic book, receipt and budget writes. The book update enforces bounded insertion/order/eviction and a newly created matching receipt. The linked receipt validates the after-write payload's exact formula and scoring edition; the budget is bound to that same edition. This distributes validation across the three protected writes without exceeding Firestore's per-operation expression limit. It does not relax validation. New-edition books are allowed only for the three affected levels. Exact Rooftop/Carnival/Cabin totals are checked locally and by rules; original formulas remain valid only in their original boards. Payloads from other levels are unchanged.

Theoretical maxima remain 14,000 Rooftop and 8,500 Cabin; Carnival becomes 6,725. Top-25 retention and five Rooftop shortcut slots remain per edition. Client-side validation still does not prove honest gameplay.
