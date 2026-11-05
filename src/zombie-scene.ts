import {streetVehicle} from './street-vehicles';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {ZOMBIE,zombieBreakdownMs,zombiePlatforms,newZombieRun,zombieAction,zombieContact,zombieScore,zombieBatTarget,zombieCheckpointPositions} from './zombie-mission.mjs';
import {gameAudio} from './audio';
const truckScale=250/768;
const batSwingMs=380;
const walkGrip=[[175,134],[148,137],[146,143],[141,141]];
const airGrip=[[160,43],[161,54],[159,55],[145,35]];
type Undead={art:Phaser.GameObjects.Image;home:number;floor:number;speed:number;alive:boolean};
export class ZombieApocalypse extends FootAdventure{
 constructor(){super({key:'zombie',number:6,title:'Zombie Apocalypse',...ZOMBIE,startY:ZOMBIE.ground,instructions:'Survive the neighborhood. Jump over zombies and climb bins and buses.\nAllison follows behind and handles zombies that touch her.\nF / Action: swing the bat. Hits require a zombie within reach.\nF / Action by the truck: climb in. Then drive forward and flatten the horde!\nTruck: auto-forward · Left brakes · Right accelerates · Jump clears barricades.'});}
 mission=newZombieRun();undead:Undead[]=[];truck!:Phaser.GameObjects.Image;bat!:Phaser.GameObjects.Container;batUntil=0;batDirection=1;batPending=false;stride=0;breakdownAt=0;wheels:Phaser.GameObjects.Image[]=[];batUsed=0;ally!:Phaser.GameObjects.Image;allyText!:Phaser.GameObjects.Text;barriers:Phaser.GameObjects.Rectangle[]=[];allyWins=0;
 resetMission(){this.mission=newZombieRun();this.undead=[];this.barriers=[];this.allyWins=0;this.batUsed=0;this.batUntil=0;this.batPending=false;this.stride=0;this.breakdownAt=0;}
 preload(){
  super.preload();
  if(!this.textures.exists('thai-road-vehicles'))this.load.image('thai-road-vehicles','./assets/thai/street-vehicles-v1.png');
  for(const [key,file] of [['zombie-baja','baja-truck-v1'],['zombie-chassis','baja-chassis'],['zombie-wheel-rear','baja-wheel-rear'],['zombie-wheel-front','baja-wheel-front']]){
   if(!this.textures.exists(key))this.load.image(key,`./assets/zombie/${file}.png`);
  }
 }
 buildWorld(){
  this.cameras.main.setBackgroundColor('#233437');for(let x=0;x<ZOMBIE.width;x+=3600)this.add.tileSprite(x,200,Math.min(3600,ZOMBIE.width-x),600,'thai-street').setOrigin(0).setTileScale(.7).setTilePosition(x/.7,0).setTint(0x779685).setDepth(-15);
  this.platform(0,ZOMBIE.ground,ZOMBIE.width,200,0x35413e);
  for(let x=0;x<ZOMBIE.width;x+=160)this.add.rectangle(x,840,75,5,0xc4bd84);
  const props=this.textures.get('thai-props');
  if(!props.has('bin'))props.add('bin',0,1171,204,339,251);
  const obstacles=['bin','double-decker','bin','semi-trailer','bin'];
  for(const [i,[x,y,w,h]] of zombiePlatforms.entries()){
   this.platforms.add(this.add.rectangle(x+w/2,y+h/2,w,h,0xffffff,0));
   const kind=obstacles[i];
   if(kind==='bin')this.add.image(x,y+h,'thai-props',kind).setOrigin(0,1).setDisplaySize(w,h).setDepth(1);
   else streetVehicle(this,x,y+h,w,h,kind);
  }
  for(let i=0;i<65;i++){const x=i<9?440+i*240:3250+(i-9)*190;const floor=(x>=940&&x<=1250||x>=1800&&x<=2110)?670:800;const art=this.add.image(x,floor,i%3?'scruffy':'clown').setOrigin(.5,1).setDisplaySize(49,73).setTint(i%2?0x99bd76:0x87b8a0).setDepth(6);this.undead.push({art,home:x,floor,speed:i%3?40:90,alive:true});}
  this.truck=this.add.image(ZOMBIE.truckX,ZOMBIE.ground,'zombie-baja').setOrigin(.5,1).setScale(truckScale).setDepth(8);this.text(ZOMBIE.truckX,640,'F / ACTION · TAKE THE TRUCK',18,'#f2d496').setOrigin(.5);
  this.wheels=['rear','front'].map(end=>this.add.image(0,0,`zombie-wheel-${end}`).setScale(truckScale).setDepth(9).setVisible(false));
  for(const [i,x] of [3720,4570,5540,6100,7190,8110].entries()){
   this.barriers.push(this.add.rectangle(x,780,55,40,0xffffff,0));
   this.drawBarricade(x,i%2===1);
   this.text(x,708,'JUMP!',17,'#ffd7a0').setOrigin(.5);
  }
  this.add.rectangle(ZOMBIE.exitX+100,650,20,300,0xa8c0a5);this.text(ZOMBIE.exitX-140,570,'SAFE ZONE →',34,'#d0efb5');
 }
 private drawBarricade(x:number,crossed:boolean){
  const g=this.add.graphics().setPosition(x,ZOMBIE.ground).setDepth(7);
  g.fillStyle(0x1d2b2b,.6).fillEllipse(0,0,66,8);
  if(crossed){
   g.lineStyle(10,0x333b3f).lineBetween(-23,-3,23,-39).lineBetween(-23,-39,23,-3);
   g.lineStyle(3,0xa4aba6).lineBetween(-22,-7,23,-41).lineBetween(-23,-41,22,-7);
   g.fillStyle(0x8f9693).fillCircle(0,-21,6);
   g.fillStyle(0x41474a).fillCircle(0,-21,2);
  }else{
   g.lineStyle(5,0x39464b).strokeRoundedRect(-27,-38,54,32,4);
   g.lineStyle(2,0xadb7b6).strokeRoundedRect(-27,-39,54,30,4);
   for(let bar=-18;bar<=18;bar+=9)g.lineBetween(bar,-37,bar,-9);
   g.fillStyle(0x7c8889).fillRect(-28,-7,8,7).fillRect(20,-7,8,7);
   g.fillStyle(0xc8854b).fillRect(-24,-36,8,4).fillRect(16,-36,8,4);
  }
 }
 afterPlayer(){
  this.ally=this.add.image(ZOMBIE.startX-70,800,'allison').setOrigin(.5,1).setDisplaySize(57,82).setDepth(8);
  this.allyText=this.text(this.ally.x,674,'Allison: “I’m right behind you.”',16,'#e6f0bc').setOrigin(.5).setDepth(10);
  const batArt=this.add.graphics();
  batArt.lineStyle(2,0x34251c).fillStyle(0xb7834f)
   .fillPoints([{x:-7,y:-2},{x:10,y:-2},{x:41,y:-5},{x:47,y:-3},{x:47,y:3},{x:41,y:5},{x:10,y:2},{x:-7,y:2}],true)
   .strokePoints([{x:-7,y:-2},{x:10,y:-2},{x:41,y:-5},{x:47,y:-3},{x:47,y:3},{x:41,y:5},{x:10,y:2},{x:-7,y:2}],true)
   .fillStyle(0x47342a).fillRect(-6,-2,13,4).fillStyle(0xc7977c).fillEllipse(0,0,6,5);
  this.bat=this.add.container(0,0,[batArt]).setDepth(10);
 }
 motionHeld(){return this.mission.phase==='breakdown';}
 movementVelocity(direction:number,sprint:boolean,delta:number){return this.mission.truck?(direction<0?170:direction>0?430:340):super.movementVelocity(direction,sprint,delta);}
 jumpVelocity(){return this.mission.truck?-430:super.jumpVelocity();}
 objectiveText(){if(this.mission.truck)return `TRUCK RAMPAGE · ${this.mission.crushed} flattened · Jump marked barricades`;
  if(this.motionHeld())return 'TRUCK BREAKDOWN';
  if(this.mission.phase==='on-foot')return 'ON FOOT → Reach the safe zone · Action swings the bat';
  return 'SURVIVE → Find the truck · Action swings the bat';}
 respawn(){
  super.respawn();
  if(this.mission.phase==='on-foot')this.clearDismountArea();
  if(this.mission.truck)this.say('Truck checkpoint. The warranty was already void.');
 }
 private clearDismountArea(){
  const {x,bottom}=this.checkpoint;
  this.facing=1;
  this.ally.setPosition(x-78,bottom);
  this.batPending=false;this.batUntil=0;
  for(const {zombie,x:clearX} of zombieCheckpointPositions(x,this.undead)){
   zombie.art.setX(clearX);
   zombie.home=clearX;
  }
 }
 private removeZombie(z:Undead){z.alive=false;z.art.setVisible(false);}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  const r=zombieAction(this.mission,{x:this.player.x,bottom:body.bottom,action,breakdownFinished:this.elapsedMs-this.breakdownAt>=zombieBreakdownMs});this.mission=r.state;
  if(r.event==='truck'){
   this.batPending=false;this.batUntil=0;
   this.checkpoint={x:ZOMBIE.truckStartX,bottom:800};
   body.reset(ZOMBIE.truckStartX,776);this.player.setMaxVelocity(470,850);
   this.say('Allison: “Finally. A vehicle with doors. Please use the road.”');gameAudio.playLocation('smash-zombies');
  }
  if(r.event==='breakdown'){
   this.breakdownAt=this.elapsedMs;
   this.facing=1;
   body.reset(ZOMBIE.breakdownX,ZOMBIE.ground-24);
   this.truck.setTexture('zombie-chassis').setPosition(ZOMBIE.breakdownX,ZOMBIE.ground).setOrigin(.5,1);
   this.ally.setVisible(false);this.allyText.setVisible(false);
   this.say('Allison: “There go the wheels. Back on foot!”');
   gameAudio.play('impact');
  }
  if(this.motionHeld())return;
  if(r.event==='dismount'){
   this.checkpoint={x:ZOMBIE.breakdownX+140,bottom:ZOMBIE.ground};
   body.reset(this.checkpoint.x,this.checkpoint.bottom-24);
   this.player.setMaxVelocity(450,850);
   this.clearDismountArea();
   this.allyText.setText('Allison: “Keep that bat handy.”');
   this.immuneMs=1400;
  }
  if(r.event==='escape'){
   this.finish('THE DEAD CAN WALK HOME.',`Seth and Allison made it out.\n${this.mission.crushed} flattened · ${this.batUsed} batted away · ${this.allyWins} ran into Allison`,zombieScore(this.mission,this.elapsedMs,this.hits));
   return;
  }
  this.ally.setVisible(!this.mission.truck);this.allyText.setVisible(!this.mission.truck);
  if(!this.mission.truck){
   const trailX=Phaser.Math.Clamp(this.player.x-78*this.facing,28,ZOMBIE.exitX);
   this.ally.x+=Phaser.Math.Clamp(trailX-this.ally.x,-.48*delta,.48*delta);
   const roof=zombiePlatforms.find(([x,y,w])=>this.ally.x>=x&&this.ally.x<=x+w&&body.bottom<=y+20);
   const trailY=roof?.[1]??ZOMBIE.ground;
   this.ally.y+=Phaser.Math.Clamp(trailY-this.ally.y,-.48*delta,.48*delta);
   this.ally.setFlipX(this.facing<0);
   this.allyText.setPosition(this.ally.x,this.ally.y-122);
   if(this.mission.phase==='survival'&&Math.abs(this.player.x-ZOMBIE.truckX)<110&&Math.abs(body.bottom-ZOMBIE.ground)<30){
    this.prompt.setVisible(true).setText('F / Action · Take the truck');
   }else if(action&&this.elapsedMs>=this.batUntil){
    this.batDirection=this.facing;
    this.batUntil=this.elapsedMs+batSwingMs;
    this.batPending=true;
   }
  }
  if(this.batPending&&this.elapsedMs>=this.batUntil-batSwingMs*.5){
   this.batPending=false;
   const target=zombieBatTarget(this.player.x,this.player.y,this.undead.filter(z=>(z.art.x-this.player.x)*this.batDirection>=0));
   if(target){this.removeZombie(target);this.batUsed++;gameAudio.speak('Squish!','squish');}
  }
  for(const z of this.undead){
   if(!z.alive)continue;
   if(Math.abs(z.art.x-this.player.x)<480)z.art.x+=Math.sign(this.player.x-z.art.x)*z.speed*delta/1000;
   else z.art.x=z.home+Math.sin(this.elapsedMs/900+z.home)*25;
   if(z.floor===670)z.art.x=Phaser.Math.Clamp(z.art.x,z.home<1500?940:1800,z.home<1500?1250:2110);
   const contact=zombieContact({truck:this.mission.truck,playerX:this.player.x,playerY:this.player.y,zombieX:z.art.x,zombieY:z.floor-30,allyX:this.ally.x,allyY:this.ally.y-30});
   if(contact==='crush'){this.removeZombie(z);this.mission.crushed++;gameAudio.playLocation('truck-splat');}
   else if(contact==='allison'){this.removeZombie(z);this.allyWins++;}
   else if(contact==='hit')this.takeHit('Zombie! Use Action to swing the bat or jump clear.');
  }
  if(this.mission.truck)for(const b of this.barriers)if(Math.abs(this.player.x-b.x)<65&&body.bottom>b.y-10)this.takeHit('Barricade! Jump when you see the sign.');
 }
 drawExtras(){
  const onFoot=!this.mission.truck&&!this.motionHeld();
  this.portrait.setVisible(onFoot);
  this.bat.setVisible(onFoot);
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  if(this.mission.truck)this.truck.setPosition(this.player.x,body.bottom);
  if(this.mission.phase==='breakdown'||this.mission.phase==='on-foot'||this.mission.phase==='complete'){
   const t=Phaser.Math.Clamp((this.elapsedMs-this.breakdownAt)/zombieBreakdownMs,0,1);
   this.truck.setY(ZOMBIE.ground+16*Phaser.Math.Easing.Quadratic.Out(t));
   this.wheels.forEach((wheel,i)=>{
    const offset=(i===0?128:540)-384;
    const travel=(i===0?-82:174)*Phaser.Math.Easing.Quadratic.Out(t);
    const bounce=20*Math.abs(Math.sin(t*Math.PI*3))*(1-t);
    wheel.setVisible(true).setPosition(ZOMBIE.breakdownX+offset*truckScale+travel,ZOMBIE.ground-21-bounce)
     .setRotation(travel/21);
   });
  }
  if(!onFoot)return;
  const swinging=this.elapsedMs<this.batUntil;
  const direction=swinging?this.batDirection:this.facing;
  const airborne=!body.blocked.down&&Math.abs(body.velocity.y)>20;
  const walking=body.blocked.down&&Math.abs(body.velocity.x)>1;
  if(walking)this.stride+=Math.abs(body.deltaX());
  else this.stride=0;
  const progress=swinging?1-(this.batUntil-this.elapsedMs)/batSwingMs:0;
  const frame=swinging?(progress<.32?1:2):airborne
   ?(body.velocity.y<0?1:Math.floor(this.elapsedMs/110)%4)
   :walking?Math.floor(this.stride/18)%4:1;
  const [handX,handY]=(airborne&&!swinging?airGrip:walkGrip)[frame];
  const windup=Phaser.Math.Easing.Sine.InOut(Math.min(progress/.32,1));
  const follow=Phaser.Math.Easing.Cubic.Out(Phaser.Math.Clamp((progress-.32)/.4,0,1));
  const recover=Phaser.Math.Easing.Sine.InOut(Phaser.Math.Clamp((progress-.72)/.28,0,1));
  const lean=swinging?(-.11*windup+.3*follow)*(1-recover):walking?.04:0;
  const angle=airborne&&!swinging?-1.1:-.86+(swinging?(-1.7*windup+3.9*follow)*(1-recover):walking?.16*Math.sin(this.stride/11):0);
  this.portrait.stop().setTexture(airborne&&!swinging?'seth-fall':'seth-walk',frame)
   .setFlipX(direction<0).setRotation(lean*direction);
  const grip=new Phaser.Math.Vector2(direction*(handX-96)*62/192,(handY-256)*82/256).rotate(lean*direction);
  this.bat.setPosition(this.player.x+grip.x,body.bottom+grip.y)
   .setRotation(direction>0?angle+lean:Math.PI-angle-lean).setAlpha(this.portrait.alpha);
 }
 publishStatus(){super.publishStatus({phase:this.mission.phase,truck:String(this.mission.truck),crushed:String(this.mission.crushed),allisonCleared:String(this.allyWins),batted:String(this.batUsed)});}
}
