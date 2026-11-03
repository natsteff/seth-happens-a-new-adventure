import type Phaser from 'phaser';
import type {StairFlight} from './walk-stairs';
export function mansionStairs(scene:Phaser.Scene,f:StairFlight){
 const g=scene.add.graphics().setDepth(2),steps=32,dx=(f.end-f.x)/steps,dy=(f.bottom-f.top)/steps;
 g.lineStyle(14,0x211c22).lineBetween(f.x,f.bottom+25,f.end,f.top+25);
 for(let i=0;i<steps;i++){
  const x=f.x+i*dx,y=f.bottom-i*dy,left=Math.min(x,x+dx)-2;
  g.fillStyle(i%3?0x43372f:0x392d2b).fillRect(left,y,Math.abs(dx)+4,dy+12);
  g.lineStyle(2,0x99816a).lineBetween(left,y,left+Math.abs(dx)+4,y);
  g.lineStyle(1,0x211d22).lineBetween(left+3,y+6,left+Math.abs(dx),y+8);
  if(i%4===0){g.lineStyle(3,0x4e4240).lineBetween(x,y,x,y-46);g.lineStyle(1,0x8d7561).lineBetween(x+2,y,x+2,y-46);}
  if(i%7===0){g.lineStyle(1,0x7a7b72,.5).lineBetween(x,y+4,x+dx*2,y+21);}
 }
 g.lineStyle(5,0x715745).lineBetween(f.x,f.bottom-46,f.end,f.top-46);g.lineStyle(1,0xb09a79).lineBetween(f.x,f.bottom-49,f.end,f.top-49);
 for(const [x,y] of [[f.x,f.bottom],[f.end,f.top]]){g.fillStyle(0x3b3030).fillRect(x-5,y-62,10,62);g.fillStyle(0x8d775f).fillCircle(x,y-62,7);g.fillStyle(0x8e7859).fillRect(x-3,y-78,6,13);g.fillStyle(0xe6ba78).fillEllipse(x,y-82,5,11);g.fillStyle(0xe6ba78,.06).fillCircle(x,y-82,30);}
}
