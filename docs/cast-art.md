# Expanded character cast

New original artwork was made with the built-in image-generation tool for Cabin Fever, Snow Day From Hell, Thai Takeout Run and Scooter Ride. Each runtime atlas is a display-sized 768×768 copy with alpha-based frame bounds. Generated full-size masters remain preserved locally. No paid assets or external character likenesses were used.

| Runtime asset | Cast / prompt summary |
| --- | --- |
| `public/assets/cast/cabin-v1.png` | Four exaggerated backwoods-comedy adults: plaid/overall angler, auburn-haired cook with frying pan, silver-bearded old-timer with tackle box, and braided hiker with cooler. Warm individual faces and distinct rural-comedy silhouettes. |
| `public/assets/cast/winter-v1.png` | Canadian winter walkers in plaid/parka/toques, plus Inuit/Arctic-inspired practical fur-trimmed parkas and insulated boots. Individual respectful faces, everyday winter clothing. |
| `public/assets/cast/thai-v1.png` | Modern Thai restaurant owner, delivery rider and two Asian neighborhood pedestrians, with distinct everyday outfits and no ethnic caricature. |
| `public/assets/cast/scooter-v1.png` | Four African American neighbors, including a man and woman with prominent natural Afros, a silver-bearded elder and a braided runner. Distinct friendly faces and modern streetwear. |

Each generation prompt requested a regular transparent 2×2 sheet of complete isolated full-body figures, generous margins, no overlap, painterly cartoon realism, readable small silhouettes, no text/logos/scenery or painted checkerboard. Runtime resizing preserves the generated alpha and source originals.

`src/curtain-cast.mjs` is the shared roster for Encore and the rotating Credits/Jukebox dance crowd. It currently contains 34 entries: existing regulars/fans/player, the 16 new neighbors, four original ghosts, two zombie variants, the cats, cabin wildlife and rooftop pigeon, then Allison and Seth. No Allison ghost is included. Encore uses one entrance/bow/exit per entry and remains an early prototype for later animation refinement.

`public/assets/lastcall/bar-wall-v1.png` is original generated pub scenery: a reusable warm mahogany wall section with brass lamps, bottle shelves, unbranded clock and counter; no people, logos or foreground collision objects. One shared image repeats behind separate collision geometry.
