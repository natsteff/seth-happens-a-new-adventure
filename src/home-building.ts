import type Phaser from 'phaser';
/** Shared architectural vocabulary: three bays left, two right, brick/tan piers,
 * teal glazing, blue stepped crown and round G. Decoration never owns bodies. */
export function homeTower(scene:Phaser.Scene,x:number,roof:number,width:number,bottom:number,stories=26,depth=-8){
 const g=scene.add.graphics().setDepth(depth),scale=width/250,height=bottom-roof,row=height/stories;
 g.fillStyle(0x713d31).fillRect(x,roof,width,height);
 for(let i=0;i<stories;i++){
  const y=roof+i*row;
  g.fillStyle(i%3===0?0xbe6840:i%3===1?0xc2784a:0xb55e39).fillRect(x,y,width,row);
  for(let bay=0;bay<5;bay++){const bx=x+bay*width/5;
   g.fillStyle(0x173c49).fillRect(bx+7*scale,y+8*scale,width/5-12*scale,Math.max(5,row-17*scale));
   g.fillStyle(0x348293).fillRect(bx+10*scale,y+10*scale,5*scale,Math.max(3,row-21*scale));
   g.fillStyle(bay<3?0xd9975a:0xc08552).fillRect(bx,y,7*scale,row);
   if(i%4===0)g.fillStyle(0xe6c28a).fillRect(bx,y,width/5,5*scale);
  }
  g.fillStyle(0xe1b87d).fillRect(x,y+row-4*scale,width,4*scale);
 }
 // Five differently stepped glass facets echo the approved logo silhouette.
 for(let bay=0;bay<5;bay++){const bx=x+bay*width/5,cap=[70,105,130,100,65][bay]*scale;
  g.fillStyle(bay<3?0x216a8a:0x1b536f).fillRect(bx,roof-cap,width/5,cap);
  g.lineStyle(2*scale,0x6fb9ce).strokeRect(bx+2*scale,roof-cap,width/5-4*scale,cap);
  for(let y=roof-cap+15*scale;y<roof;y+=24*scale)g.lineBetween(bx,y,bx+width/5,y);
 }
 // Roof edge is aligned exactly with the existing collision top.
 g.fillStyle(0xe2c294).fillRect(x,roof,width,5*scale);
 const badgeY=Math.min(bottom-85*scale,roof+80*scale);g.fillStyle(0xd5c497).fillCircle(x+width*.54,badgeY,18*scale);g.lineStyle(3*scale,0x776048).strokeCircle(x+width*.54,badgeY,18*scale);
 const badge=scene.add.text(x+width*.54,badgeY,'G',{fontFamily:'Arial',fontSize:`${26*scale}px`,fontStyle:'bold',color:'#4a514e'}).setOrigin(.5).setDepth(depth+1);if(depth===-29)badge.setScrollFactor(0);
 // Recessed entrance, three piers to its left / two to its right, circular drive.
 if(height>300*scale){g.fillStyle(0x152e3a).fillRect(x+width*.23,bottom-100*scale,width*.5,100*scale);
  for(const bay of [0,1,2,4,5])g.fillStyle(0xcf8a50).fillRect(x+bay*width/6,bottom-120*scale,9*scale,120*scale);
  g.lineStyle(4*scale,0xd1b879).strokeEllipse(x+width*.62,bottom+14*scale,width*.62,34*scale);
 }
 return g;
}
