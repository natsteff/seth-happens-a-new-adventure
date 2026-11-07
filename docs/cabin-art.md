# Cabin Fever artwork

Cabin Fever uses scene-native drawn woods, shoreline, cabin, docks, boats, cooler, geese and raccoons alongside existing Seth/Allison artwork. Small wildlife textures are generated once and reused; scenery does not allocate world-sized render textures. Cream deck trims mark the collision tops. Tree/cabin/hull/water decoration has no collision.

Existing movement, music and audio resources are reused unchanged. The pickup is a full cooler and the objective is a successful beer return. Water recovers at the current checkpoint, retaining acquired beer with a condition penalty.

The far-shore cooler now displays the owner-supplied Unicorn Haze IPA six-pack, also used as the carried beer. `public/assets/cabin/unicorn-haze-v1.png` is an alpha cutout preserving the supplied design. The texture frame removes transparent margins; display sizes are 43 pixels at the cooler and 40 pixels while carried, with aspect ratio preserved. Neither image has a collision body. Collection, checkpoints, damage and delivery rules are unchanged.
