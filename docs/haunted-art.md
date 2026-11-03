# Haunted House artwork

The exterior uses an original AI-generated Victorian mansion cutout (`public/assets/haunted/victorian-mansion-v1.png`). An original cemetery atlas (`cemetery-v1.png`) supplies weathered headstones, monuments and crypts; a moonlit forest (`woods-v1.png`) forms the escape backdrop. Runtime copies are sized for mobile memory use, with transparent edges preserved.

`mansion-wall-v1.png` repeats behind the enclosed four-floor interior. Separate collision bodies define the walls, wooden floors, stairwell openings and first-floor exit. The key is in the attic; its first-floor door leads to the woods. Upper exterior walls remain solid after the door is unlocked.

Ghosts use the original creepy ghost atlas `ghosts-v1.png`, never repurposed people. The key, checkpoint bell, falling books and fallen timber are drawn in code. The radio track remains **The Haunted Happy Hour**. Decorative images do not create collision bodies.
