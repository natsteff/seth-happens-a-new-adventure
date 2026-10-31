# Playtest any level

Use **Playtest any level** in the desktop controls or mobile menu, then **Choose Level**. No earlier completion is required. The visible PLAYTEST MODE notice distinguishes review from normal progression; completions and scores are not saved. **Exit playtest mode** returns to normal play and your existing unlocks.

Direct links work on GitHub Pages and the local development server. Add `?review=all&level=KEY` to the game's URL. For example:

- Published: https://natsteff.github.io/seth-happens-a-new-adventure/?review=all&level=thai
- Local (`./dev.sh` prints the actual port): http://127.0.0.1:5174/?review=all&level=thai

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

`level=KEY` without `review=all` respects normal locks. Levels 10–13 are not implemented. The previous local-only `?level=cabin&review=cabin` shortcut still works on a local development server.
