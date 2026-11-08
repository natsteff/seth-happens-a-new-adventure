# Online scores

Only project `seth-happens-2` is supported. No Functions, Firebase Hosting or Analytics are used. The original game's Firebase project is unrelated.

New runs save to `seth-happens-2.scores.v2` first. Old per-level lists are ignored without deletion or migration. That local journal recovers any interrupted outbox enqueue. The separate IndexedDB database `seth-happens-2.online.v1` keeps jobs and durable receipts. Retries use exponential backoff, foreground/reconnect recovery and a cross-tab lease. Stable per-level run IDs plus immutable Firestore receipts make uncertain commits and duplicate retries safe. Switching Online/This Device changes only the view.

Each playable level has one fixed-size record-book document: top 25 legitimate scores, initially displaying 10, followed by the first five Level 1 shortcut scores. Encore cannot create a board. Device history remains local and is not limited to the online top 25. Online read failures show actual device scores with an explicit fallback notice.

## Rules and operation

Rules require authentication, validate the level and exact payload fields, enforce per-level score limits, validate Rooftop/Takeout totals and timed-level durations, and protect unchanged leaderboard rows/order/eviction. Each admitted score must atomically update its book, immutable receipt and the authenticated user's budget. The budget is shared across all levels: 60 admitted submissions per rolling 24-hour window, at least one second apart. Public collection scans, deletes and unrelated paths are denied. Run receipts outlive leaderboard eviction. These are practical per-identity limits: anonymous identity churn and fabricated but plausible client runs cannot be prevented by client-only scoring. This is a beta leaderboard, not authoritative gameplay attestation.

Clients may create only an exact empty board through rules. `pnpm scores:initialize` safely prepares all 12 without overwriting existing books; normal reads/submissions can also initialize a missing book. No admin account or permissive initialization rules are required.

`pnpm test` runs normal and durable queue tests. With Node 24+ (native TypeScript support) and Java 21+, `pnpm test:firebase` starts isolated demo Auth/Firestore emulators and runs security plus real SDK transaction tests. It never targets production.

Deploy only with:

```
pnpm exec firebase deploy --only firestore:rules,firestore:indexes --project seth-happens-2
```

The configured index exemptions keep record-book arrays/payloads unindexed; no composite query indexes are needed. Back up the active Firestore rules before deployment. Enable `onlineHighScores` in `public/game-config.json` only after emulator tests and a deployed end-to-end submission pass. Set it false to disable Firebase networking without discarding local scores or pending jobs. There is no client-side online clear action. Administrative cleanup is an owner operation.

No new Console configuration is required when the supplied web app, Firestore and Anonymous Authentication already work. Physical-device acceptance is separate from browser viewport testing.

## Current boards

Every playable level uses one `record-book/live` document. There is no archive reader, historical formula or migration. Old `current` and `risk-v2` documents are denied by the active rules and can be deleted during the owner’s pre-release server purge. New scores use the current Rooftop/Carnival/Cabin formulas; receipt writes validate payloads and atomic board/budget links. Local playtest scores and old pending uploads are discarded once on upgrade; settings/progression remain separate.
