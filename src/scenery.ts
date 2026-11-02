import Phaser from 'phaser';

// Scenery never creates physics bodies. The existing mission owns all collision geometry.
export function cityBackdrop(scene: Phaser.Scene, width: number, height: number) {
  const sky = scene.add.image(width / 2, height, 'adventure-skyline')
    .setOrigin(.5, 1).setScrollFactor(0).setDepth(-30);
  const scale = Math.max(width / sky.width, height / sky.height);
  sky.setScale(scale);
  skylineLandmarks(scene,width,height);
  // Keep the vivid distant windows behind the readable, warmer foreground buildings.
  scene.add.rectangle(width / 2, height / 2, width, height, 0x172039, .22)
    .setScrollFactor(0).setDepth(-29);
}

// Small vector landmarks share the skyline's dusk palette; no extra bitmap or bodies.
function skylineLandmarks(scene:Phaser.Scene,width:number,height:number){
 const g=scene.add.graphics().setScrollFactor(0).setDepth(-29.5);
 const base=height*.55,unit=height/600;
 // First National: limestone setbacks and its distinctive rooftop “1st” mast.
 const x=width*.64,w=66*unit,top=base-145*unit;
 g.fillStyle(0x66596c).fillRect(x+5*unit,top+42*unit,w,103*unit);
 g.fillStyle(0x9b8891).fillRect(x,top+45*unit,w,100*unit);
 g.fillStyle(0xb3a09b).fillRect(x+17*unit,top+12*unit,44*unit,133*unit);
 g.fillStyle(0xc4aea0).fillRect(x+24*unit,top,31*unit,145*unit);
 g.fillStyle(0x695c74).fillRect(x+49*unit,top,6*unit,145*unit);
 for(let row=0;row<17;row++)for(let col=0;col<7;col++){
  const wx=x+(5+col*8)*unit,wy=top+(row*8+7)*unit;
  if(wy<top+45*unit&&wx<x+24*unit)continue;
  g.fillStyle((row+col*3)%7===0?0xe0aa6e:0x343b5c).fillRect(wx,wy,3*unit,5*unit);
 }
 // Open steel lattice, with dusk-lit edges and a thin antenna above the sign.
 const sx=x+39*unit;
 g.lineStyle(1.2*unit,0x444757);
 g.lineBetween(sx-12*unit,top,sx-8*unit,top-43*unit);
 g.lineBetween(sx+12*unit,top,sx+8*unit,top-43*unit);
 for(let tier=0;tier<4;tier++){
  const y=top-tier*10*unit,half=(12-tier)*unit;
  g.lineBetween(sx-half,y,sx+half,y);
  g.lineBetween(sx-half,y,sx+(half-unit),y-10*unit);
  g.lineBetween(sx+half,y,sx-(half-unit),y-10*unit);
 }
 g.lineStyle(.7*unit,0xc2ada1).lineBetween(sx-12*unit,top,sx-8*unit,top-43*unit);
 g.lineBetween(sx+8*unit,top-43*unit,sx+8*unit,top-54*unit);
 g.fillStyle(0xed977c).fillCircle(sx+8*unit,top-54*unit,1.1*unit);
 // Crafted sign silhouettes, rather than font glyphs: tall red 1 and raised st.
 const outline=[[-10,-39],[-4,-44],[1,-44],[1,-17],[6,-17],[6,-12],[-12,-12],[-12,-17],[-6,-17],[-6,-36],[-10,-33]];
 const poly=(points:number[][],dx=0,dy=0)=>points.map(([px,py])=>new Phaser.Geom.Point(sx+(px+dx)*unit,top+(py+dy)*unit));
 g.fillStyle(0x573d52).fillPoints(poly(outline,2,1),true);
 g.fillStyle(0xe7c4b1).fillPoints(poly(outline),true);
 g.fillStyle(0xb94751).fillPoints(poly([[-8,-38],[-3,-42],[-1,-42],[-1,-15],[4,-15],[4,-14],[-10,-14],[-10,-15],[-4,-15],[-4,-39],[-8,-35]]),true);
 // Raised lowercase s/t, drawn as continuous angular neon paths with dark extrusion.
 const letters=[[[5,-39],[1,-39],[1,-35],[5,-35],[5,-31],[1,-31]],[[10,-42],[10,-31],[14,-31]],[[7,-38],[14,-38]]];
 for(const [color,thickness,offset] of [[0x5c4356,3,1],[0xf0cfb6,2,0]] as const){
  g.lineStyle(thickness*unit,color);
  for(const points of letters){g.beginPath();points.forEach(([px,py],i)=>i?g.lineTo(sx+(px+offset)*unit,top+(py+offset)*unit):g.moveTo(sx+(px+offset)*unit,top+(py+offset)*unit));g.strokePath();}
 }
 // US Bank: pale vertical piers framing narrow dark glazing and rooftop sign.
 const bx=width*.81,bw=66*unit,bt=base-128*unit;
 g.fillStyle(0x5a607b).fillRect(bx+4*unit,bt,bw,128*unit);
 g.fillStyle(0xaca8b5).fillRect(bx,bt,bw,128*unit);
 for(let col=0;col<6;col++){
  const wx=bx+(4+col*10)*unit;g.fillStyle(0x263958).fillRect(wx,bt+13*unit,6*unit,115*unit);
  for(let row=0;row<14;row++){g.fillStyle((row*3+col)%11===0?0xd5a66b:0x46506d).fillRect(wx,bt+(17+row*8)*unit,6*unit,unit);}
 }
 g.fillStyle(0xc1b6b6).fillRect(bx-2*unit,bt,70*unit,5*unit);
 g.lineStyle(unit,0x9a9bae).lineBetween(bx+16*unit,bt,bx+16*unit,bt-13*unit);
 g.fillStyle(0x974457).fillRect(bx+10*unit,bt+2*unit,18*unit,11*unit);
 scene.add.text(bx+12*unit,bt+unit,'us',{fontFamily:'Arial',fontStyle:'bold',fontSize:`${10*unit}px`,color:'#f1c9b5'}).setScrollFactor(0).setDepth(-29.4);
 scene.add.text(bx+29*unit,bt+unit,'bank',{fontFamily:'Arial',fontStyle:'bold',fontSize:`${10*unit}px`,color:'#383e5c'}).setScrollFactor(0).setDepth(-29.4);
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
