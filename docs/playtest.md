# Level selection and developer playtesting

**Choose Level** changes the adventure. The radio’s **Music track** selector changes music only. Normal players must complete each mission to unlock the next. Encore is a view-only finale unlocked by Last Call.

Developer review is deliberately absent from ordinary public navigation. An owner-provided hidden developer URL enables a visibly labelled PLAYTEST MODE. Select **Choose playtest level**, then the level’s named button. Both desktop controls and the mobile menu include **Choose Level**. The direct `level=KEY` parameter selects an adventure, while the approved developer entry enables review of locked levels. Without that entry, the level parameter respects normal unlocks. Old public `review=all` URLs no longer bypass locks on the release site.

This is a static, client-side convenience, **not authentication**. Anyone who learns the developer URL or inspects the public source can use it. No password protection or backend is provided. The owner’s exact links are kept in local review notes rather than public navigation/documentation.

Local development supports `?review=all&level=KEY` on loopback. Run `./dev.sh` and use its printed port. Review mode suppresses saved completions and score entries, uses session-only progression, and offers an Exit link back to normal play. Existing records and unlocks are preserved. Music/input preferences still work normally.

| Level | Key | Adventure |
| --- | --- | --- |
| 1 | rooftop | Rooftop Beer Run |
| 2 | thai | Thai Takeout Run |
| 3 | scooter | Scooter Ride |
| 4 | concert | Concert Chaos |
| 5 | haunted | Haunted House |
| 6 | zombie | Zombie Apocalypse |
| 7 | snow | Snow Day From Hell |
| 8 | carnival | Carnival Catastrophe |
| 9 | cabin | Cabin Fever |
| 10 | grocery | Grocery Store Gauntlet |
| 11 | soccer | Soccer Game Hijinx |
| 12 | lastcall | Last Call |
| 13 | encore | Encore · View-only prototype |
