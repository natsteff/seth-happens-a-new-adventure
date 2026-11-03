import type Phaser from 'phaser';
import type {FootAdventure} from './foot-adventure';
export type StairFlight={x:number;end:number;bottom:number;top:number};
export class StairWalker{
 active:number|null=null;descending=false;ignored:number|null=null;endpoint=0;
 reset(scene:FootAdventure){this.active=null;this.descending=false;this.ignored=null;if(scene.player?.active){const b=scene.player.body as Phaser.Physics.Arcade.Body;b.checkCollision.none=false;b.setAllowGravity(true);}}
 update(scene:FootAdventure,flights:StairFlight[],delta:number,onDescend:(index:number)=>void){
  const b=scene.player.body as Phaser.Physics.Arcade.Body,vx=b.velocity.x;
  if(this.ignored!==null&&Math.abs(scene.player.x-this.endpoint)>120)this.ignored=null;
  if(this.active===null&&b.blocked.down){
   flights.forEach((f,i)=>{if(i===this.ignored)return;const sign=Math.sign(f.end-f.x);if(Math.abs(scene.player.x-f.x)<28&&Math.abs(b.bottom-f.bottom)<20&&vx*sign>1){this.active=i;this.descending=false;}else if(Math.abs(scene.player.x-f.end)<28&&Math.abs(b.bottom-f.top)<20&&vx*sign< -1){this.active=i;this.descending=true;}});
  }
  if(this.active===null)return;
  const index=this.active,f=flights[index],span=f.end-f.x,sign=Math.sign(span);
  b.checkCollision.none=true;b.setAllowGravity(false);scene.lastGround=-Infinity;
  const x=scene.player.x+vx*Math.min(delta,50)/1000,u=Math.max(0,Math.min(1,(x-f.x)/span));
  const bottom=f.bottom-Math.floor(u*32)/32*(f.bottom-f.top);
  b.reset(f.x+u*span,bottom-24);scene.player.setVelocity(0,0);scene.portrait.setPosition(scene.player.x,bottom);
  if(Math.abs(vx)>1)scene.portrait.stop().setTexture('seth-walk',Math.floor(Math.abs(x-f.x)/12)%4);
  if((u===0&&vx*sign<0)||(u===1&&vx*sign>0)){
   if(u===0&&this.descending)onDescend(index);this.ignored=index;this.endpoint=scene.player.x;this.active=null;b.checkCollision.none=false;b.setAllowGravity(true);
  }
 }
}
