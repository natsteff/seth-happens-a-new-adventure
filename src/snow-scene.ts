import {loadCast,castFrames} from './cast';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {SNOW,icePatches,onIce,winterVelocity,blizzardAlpha,icicleWarningMs,icicleLeadDistance,snowScore} from './snow-mission.mjs';
import {vehicleFrontHurts} from './thai-mission.mjs';
type Plow={sprite:Phaser.Physics.Arcade.Sprite;left:number;right:number;direction:number;roof:Phaser.GameObjects.Rectangle;wall:Phaser.GameObjects.Rectangle;label:Phaser.GameObjects.Text};
type Icicle={x:number;floor:number;y:number;vy:number;phase:string;at:number;art:Phaser.GameObjects.Triangle;warning:Phaser.GameObjects.Text};
export class SnowDay extends FootAdventure{
 constructor(){super({key:'snow',number:7,title:'Snow Day From Hell',...SNOW,startY:SNOW.ground,instructions:'A Wisconsin blizzard. Reach the warming shelter at the far end of town.\nBlue pavement is ice: release early and steer against a slide to brake.\nJump onto plow roofs; only their front bumpers hurt. Watch thrown snow!\nYellow ! warns of falling icicles. Bus stops save your checkpoint.'});}
 preload(){
  super.preload();loadCast(this,'winter');
  if(!this.textures.exists('snowplow-v2'))this.load.image('snowplow-v2','./assets/snow/plow-v2.png');
  if(!this.textures.exists('snowbank-v2'))this.load.image('snowbank-v2','./assets/snow/snowbank-v2.png');
 }
 plows:Plow[]=[];icicles:Icicle[]=[];flakes!:Phaser.GameObjects.Graphics;whiteout!:Phaser.GameObjects.Rectangle;checkpointIndex=0;previousVelocity=0;
 resetMission(){this.plows=[];this.icicles=[];this.checkpointIndex=0;this.previousVelocity=0;}
 buildWorld(){
  this.cameras.main.setBackgroundColor('#8094a4');this.add.tileSprite(0,200,SNOW.width,600,'thai-street').setOrigin(0).setTileScale(.7).setTint(0xb3d4e3).setDepth(-15);
  for(let x=0;x<SNOW.width;x+=510){this.add.rectangle(x+200,347,350,8,0xe4eff1).setDepth(-10);this.add.rectangle(x+190,538,300,8,0xe4eff1).setDepth(-10);for(let i=0;i<6;i++)this.add.triangle(x+55+i*51,550,0,0,8,0,4,17,0xe4eff1).setDepth(-10);}
  this.platform(0,800,SNOW.width,200,0x9cacbc);this.add.rectangle(SNOW.width/2,804,SNOW.width,8,0xeaf5f7).setDepth(2);
  for(const [a,b] of icePatches){this.add.rectangle((a+b)/2,800,b-a,8,0x7ed6ed).setDepth(3);this.text(a,742,'ICE → BRAKE EARLY',17,'#c3f5ff').setBackgroundColor('#20394c').setPadding(4);}
  for(const x of [500,2050,4270]){
   this.snowbank(x);
   this.text(x+65,563,'SNOWBANK\nHIGH ROUTE',15,'#e3f5ff');
  }
  for(const x of [2450,4600]){
   this.shelter(x,190,96,false);
   this.text(x,666,'WARM BUS STOP\nCHECKPOINT',16,'#f7ddb0').setOrigin(.5).setAlign('center');
  }
  for(const x of [1120,1740,3260,3870,5290,5820]){const warning=this.text(x,610,'!',32,'#ffda76').setOrigin(.5).setVisible(false).setDepth(12);const art=this.add.triangle(x,600,0,0,18,0,9,42,0xd8faff).setStrokeStyle(2,0x6b9cb6).setDepth(7);this.icicles.push({x,floor:800,y:600,vy:0,phase:'waiting',at:0,art,warning});this.add.rectangle(x,573,85,12,0xf0f7f8).setDepth(3);}
  castFrames(this,'winter');for(const [i,x] of [350,2280,4440,6040].entries()){this.hazard('cast-winter',x,762,35,3200,28,60).setFrame(String(i)).setDisplaySize(52,85);this.text(x-50,676,i%2?'“Still shorts weather!”':'“Where is my car?”',12,'#e9e7c8');}
  this.flakes=this.add.graphics().setDepth(20);this.whiteout=this.add.rectangle(0,0,1100,600,0xdfedf5,.04).setOrigin(0).setDepth(22);
  this.shelter(SNOW.exitX,184,142,true);
  this.text(SNOW.exitX,600,'WARMING SHELTER\nF / ACTION',24,'#ffdfa3').setOrigin(.5).setAlign('center');
 }
 private snowbank(x:number){
  const width=360,height=150,ground=SNOW.ground;
  this.add.image(x,ground,'snowbank-v2').setOrigin(0,1).setDisplaySize(width,height).setDepth(1);
  // The shelves are measured from the visible terraces in the trimmed sprite.
  for(const [left,right,rise] of [[.15,.85,64],[.26,.74,105],[.37,.63,148]]){
   const span=width*(right-left);
   const solid=this.add.rectangle(x+left*width+span/2,ground-rise/2,span,rise,0xffffff,0);
   this.platforms.add(solid);
  }
 }
 private shelter(x:number,width:number,height:number,enclosed:boolean){
  const g=this.add.graphics().setPosition(x,SNOW.ground).setDepth(1);
  const left=-width/2,top=-height;
  g.fillStyle(0x283b4b).fillRoundedRect(left,top,width,height,4);
  g.fillStyle(0x7796a4).fillRect(left+8,top+12,width-16,height-20);
  for(let bay=0;bay<3;bay++){
   const w=(width-24)/3,px=left+12+bay*w;
   g.fillStyle(enclosed?0xe6ad65:0x70959f).fillRect(px,top+19,w-5,height-32);
   g.fillStyle(0xeaf7fb,.28).fillTriangle(px+3,top+20,px+w-8,top+20,px+3,top+48);
   g.lineStyle(2,0x394e5a).lineBetween(px,top+height*.52,px+w-5,top+height*.52);
  }
  if(enclosed){
   g.fillStyle(0x344758).fillRect(14,-89,54,89);
   g.fillStyle(0xffcc80).fillRect(21,-80,39,40);
   g.fillStyle(0xd3ba88).fillCircle(57,-29,2);
  }else{
   g.fillStyle(0x524b44).fillRect(left+27,-28,width-53,7).fillRect(left+34,-21,5,21).fillRect(width/2-39,-21,5,21);
  }
  g.fillStyle(0x415562).fillRoundedRect(left-9,top-8,width+18,14,4);
  g.fillStyle(0xf3f9fb).fillRoundedRect(left-10,top-13,width+20,9,5);
  g.fillStyle(0xe2edf1).fillEllipse(0,0,width+16,7);
 }
 afterPlayer(){
  for(const [i,left,right] of [[0,820,1700],[1,3000,3900],[2,5000,5950]]){
   const direction=i%2?-1:1;
   const sprite=this.physics.add.sprite(direction>0?left:right,750,'snowplow-v2')
    .setDisplaySize(236,100).setDepth(6).setImmovable(true);
   const body=sprite.body as Phaser.Physics.Arcade.Body;
   body.setAllowGravity(false).setSize(610,112).setOffset(15,101);
   const roof=this.add.rectangle(sprite.x-direction*44,736,132,28,0xffffff,0);
   this.physics.add.existing(roof);
   const roofBody=roof.body as Phaser.Physics.Arcade.Body;
   roofBody.setAllowGravity(false).setImmovable(true);
   roofBody.checkCollision.left=false;roofBody.checkCollision.right=false;roofBody.checkCollision.down=false;
   this.physics.add.collider(this.player,roof);
   const wall=this.add.rectangle(sprite.x,770,36,60,0xe3f5fa,.8).setStrokeStyle(2,0xc4e2ee).setDepth(8);
   const label=this.text(sprite.x,640,'PLOW →',15,'#ffe0a2').setOrigin(.5);
   const plow={sprite,left,right,direction,roof,wall,label};this.plows.push(plow);
   this.physics.add.collider(this.player,sprite,()=>{
    if(vehicleFrontHurts(body.touching,plow.direction))this.takeHit('Front of the snowplow! Jump onto its roof or let it pass.');
   });
  }
 }
 movementVelocity(direction:number,sprint:boolean,delta:number){const body=this.player.body as Phaser.Physics.Arcade.Body;this.previousVelocity=winterVelocity(body.velocity.x,direction,sprint,onIce(this.player.x,body.bottom),delta);return this.previousVelocity;}
 objectiveText(){const ice=this.player&&onIce(this.player.x,(this.player.body as Phaser.Physics.Arcade.Body).bottom);return `Reach the warming shelter → ${ice?'ICE · Counter-steer to brake':'Snowbanks offer a high route'} · ${this.checkpointIndex?'Warm checkpoint ✓':'Find a warm bus stop'}`;}
 clearMotion(){super.clearMotion();this.previousVelocity=0;}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  for(const [i,x] of [2450,4600].entries())if(this.player.x>x&&this.checkpointIndex<i+1){this.checkpointIndex=i+1;this.checkpoint={x:x+150,bottom:800};this.stamina=100;this.say('Warm checkpoint. Seth: “I should have stayed in the haunted house.”');}
  for(const [i,p] of this.plows.entries()){if(p.sprite.x>=p.right)p.direction=-1;if(p.sprite.x<=p.left)p.direction=1;const speed=p.direction*(130+i*20);
   p.sprite.setFlipX(p.direction<0).setVelocityX(speed);
   const roof=p.roof.body as Phaser.Physics.Arcade.Body;
   roof.reset(p.sprite.x-p.direction*44,736);roof.setVelocityX(speed);
   const throwing=(this.elapsedMs+i*950)%4200>3000;p.wall.setPosition(p.sprite.x+p.direction*150,770).setVisible(throwing);p.label.setPosition(p.sprite.x,640).setText(throwing?'SNOW WALL!':p.direction>0?'PLOW →':'← PLOW');if(throwing&&Math.abs(this.player.x-p.wall.x)<32&&body.bottom>740&&this.player.y<810)this.takeHit('A plow delivered the entire sidewalk. Jump the snow wall!');}
  for(const c of this.icicles){
   const distance=c.x-this.player.x;
   const approaching=distance*body.velocity.x>0&&Math.abs(distance)<=icicleLeadDistance(body.velocity.x);
   if(c.phase==='waiting'&&approaching){
    c.phase='warning';c.at=this.elapsedMs;c.warning.setVisible(true);
   }
   if(c.phase==='warning'&&this.elapsedMs-c.at>=icicleWarningMs){
    c.phase='falling';c.warning.setVisible(false);
   }
   if(c.phase==='falling'){
    c.vy+=950*delta/1000;c.y+=c.vy*delta/1000;
    if(Math.abs(distance)<24&&Math.abs(this.player.y-c.y)<40)this.takeHit('Falling icicle! Watch for the yellow warning.');
    if(c.y>785){c.phase='landed';c.at=this.elapsedMs;}
   }
   if(c.phase==='landed'&&this.elapsedMs-c.at>2000){c.phase='waiting';c.y=600;c.vy=0;}
   c.art.setY(c.y).setVisible(c.phase!=='landed');
  }
  const camera=this.cameras.main,view=camera.worldView;this.flakes.clear().fillStyle(0xf3fbff,.7);for(let i=0;i<90;i++){const x=view.x+((i*137+this.elapsedMs*.08)%1150)-25,y=view.y+((i*83+this.elapsedMs*.12)%650)-25;this.flakes.fillCircle(x,y,i%3?1.4:2.5);}this.whiteout.setPosition(view.x,view.y).setAlpha(blizzardAlpha(this.elapsedMs));
  if(Math.abs(this.player.x-SNOW.exitX)<90&&Math.abs(body.bottom-800)<25){this.prompt.setVisible(true).setText('F / Action · Get warm');if(action)this.finish('SETH THAWED OUT.',`Made it through a Wisconsin “light dusting.”\nThe hot chocolate is medically necessary.`,snowScore(true,this.elapsedMs,this.hits));}
 }
 publishStatus(){super.publishStatus({phase:this.won?'complete':'blizzard',ice:String(this.player&&onIce(this.player.x,(this.player.body as Phaser.Physics.Arcade.Body).bottom)),checkpoint:String(this.checkpointIndex),velocity:String(Math.round((this.player?.body as Phaser.Physics.Arcade.Body)?.velocity.x??0))});}
}
