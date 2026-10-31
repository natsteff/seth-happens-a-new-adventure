# Credits/Jukebox artwork

The dance atlases and original venue concept are reused with owner approval from the original game's public `v1.0.5` release. Selected source: https://github.com/natsteff/seth-happens/tree/v1.0.5 . Original repository and supplied originals were not modified; no original music or private portrait references were copied.

`public/assets/afterparty/seth-*-v1.png` are five complete-body, 4×3 chronological dance atlases. Rendering uses rounded cell boundaries and alpha-derived bounds at a consistent scale per sequence. Other cast members reuse this game's shipped artwork.

`venue-new-adventure-v1.png` was edited with the built-in image generation tool using the approved shipped venue and New Adventure logo as references. Prompt: replace only the printed banner behind the DJ with the exact New Adventure logo, integrated into the fabric with folds, stage-colored lighting, shadows and haze; remove Beer Run/Elevator Out of Order wording; preserve DJ identity, BT-AI booth/shirt, speakers, lights and empty floor. The generated master is preserved separately; the project asset is the selected deliverable.

The finale uses this game's own logo. No official team or venue affiliation is claimed. Public credits use Nate S and BT-AI. Only this game's eight gameplay tracks are catalogued: the player's unlocked tracks plus Eye of the Stairwell (Leads Take Me Away!), which is always available here and is the jukebox default by explicit owner direction. Gameplay locks and station selection remain independent.

Art loads on first opening only. The fixed 1100×600 scene is fitted uniformly, with device density capped at 2 and rendering capped at 30fps. The static logo finale stops its animation loop while audio/controls remain active.

Active venue: `venue-band-v3.png`, owner-approved generated band scene with six musicians, raised drums, centered BT-AI booth art and printed fabric New Adventure drape. The earlier venue remains preserved. Crowd includes non-Allison ghost/zombie variants and cabin wildlife; regular Allison is unchanged.

The ghost dancers now use original `haunted/ghosts-v1.png` wraith/skull artwork shared with Haunted House, replacing temporary familiar-character ghost variants. No Allison ghost is used.

The v0.13.0 cast audit centralizes all34 current roster entries in `src/curtain-cast.mjs`, including the new Cabin/Winter/Thai/Scooter neighbors. Eight rotating guest positions cover the complete guest roster before departure without crowding the dance floor. Regular Allison and Seth remain central; no Allison ghost is used. The static jukebox finale releases unneeded images, and Close releases the rest. See [cast art](cast-art.md) and [performance review](performance-review.md).
