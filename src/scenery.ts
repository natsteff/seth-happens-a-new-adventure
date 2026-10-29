import Phaser from 'phaser';

// Scenery never creates physics bodies. The existing mission owns all collision geometry.
export function cityBackdrop(scene: Phaser.Scene, width: number, height: number) {
  const sky = scene.add.image(width / 2, height, 'adventure-skyline')
    .setOrigin(.5, 1).setScrollFactor(0).setDepth(-30);
  const scale = Math.max(width / sky.width, height / sky.height);
  sky.setScale(scale);
  // Keep the vivid distant windows behind the readable, warmer foreground buildings.
  scene.add.rectangle(width / 2, height / 2, width, height, 0x172039, .22)
    .setScrollFactor(0).setDepth(-29);
}

export function brickBuilding(scene: Phaser.Scene, x: number, roofY: number, width: number, bottom: number, floor: number) {
  const height = bottom - roofY;
  // TileSprite owns a POT fill canvas + GPU texture for every building. Using
  // the 1536x1024 original here duplicated 8 MiB 26 times at startup. Sample
  // once near the displayed size; retain the original file and repeat spacing.
  const tileKey = 'adventure-brick-display';
  if (!scene.textures.exists(tileKey)) {
    const tile = scene.textures.createCanvas(tileKey, 384, 256)!;
    tile.context.drawImage(scene.textures.get('adventure-brick').getSourceImage() as HTMLImageElement, 0, 0, 384, 256);
    tile.refresh();
  }
  const facade = scene.add.tileSprite(x, roofY + 8, width, Math.max(1, height - 8), tileKey)
    .setOrigin(0).setTileScale(.76).setDepth(-8);
  facade.tilePositionX = (floor % 4) * 96;
  const detail = scene.add.graphics().setDepth(-7);
  // Dark return and base establish depth without changing the playable roof width.
  detail.fillStyle(0x101725, .55).fillRect(x + width - 10, roofY + 8, 10, height - 8);
  detail.fillStyle(0x171c27, .6).fillRect(x, bottom - 17, width, 17);
  detail.fillStyle(0x4a4650).fillRect(x, roofY, width, 12);
  detail.fillStyle(0xa4a09a).fillRect(x, roofY, width, 5);
  detail.fillStyle(0xd5c8af).fillRect(x, roofY, width, 2);
  detail.lineStyle(1, 0x423e49, .8);
  for (let capX = x + 27; capX < x + width; capX += 34) detail.lineBetween(capX, roofY + 2, capX - 2, roofY + 11);
  // A restrained edge highlight, exactly at the existing collision top.
  detail.fillStyle(floor === 26 ? 0xffd18c : 0xa9d0bb).fillRect(x, roofY, width, 1);
  // Low-profile decorative ventilation, behind actors and never presented as a platform.
  if (floor % 3 !== 1) {
    const ventX = x + width - 45;
    detail.fillStyle(0x303942).fillRect(ventX, roofY - 18, 28, 18);
    detail.fillStyle(0x68717a).fillRect(ventX - 2, roofY - 20, 32, 3);
    detail.lineStyle(1, 0x91928c, .5);
    for (let y = roofY - 15; y < roofY - 3; y += 4) detail.lineBetween(ventX + 4, y, ventX + 24, y);
  }
}
