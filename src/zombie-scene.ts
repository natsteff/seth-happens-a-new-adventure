import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {ZOMBIE,zombiePlatforms,newZombieRun,zombieAction,zombieContact,zombieScore} from './zombie-mission.mjs';
import {gameAudio} from './audio';
type Undead={art:Phaser.GameObjects.Image;home:number;floor:number;speed:number;alive:boolean};
export class ZombieApocalypse extends FootAdventure{
 constructor(){super({key:'zombie',number:6,title:'Zombie Apocalypse',...ZOMBIE,startY:ZOMBIE.ground,instructions:'Survive the neighborhood. Jump over zombies and climb bins and buses.\nAllison fights her own way ahead — she is not waiting to be rescued.\nF / Action by the truck: climb in. Then drive forward and flatten the horde!\nTruck: auto-forward · Left brakes · Right accelerates · Jump clears barricades.'});}
 mission=newZombieRun();undead:Undead[]=[];truck!:Phaser.GameObjects.Container;ally!:Phaser.GameObjects.Image;allyText!:Phaser.GameObjects.Text;barriers:Phaser.GameObjects.Rectangle[]=[];allyWins=0;
 resetMission(){this.mission=newZombieRun();this.undead=[];this.barriers=[];this.allyWins=0;}
 buildWorld(){
  this.cameras.main.setBackgroundColor('#233437');this.add.tileSprite(0,200,ZOMBIE.width,600,'thai-street').setOrigin(0).setTileScale(.7).setTint(0x779685).setDepth(-15);
  this.platform(0,ZOMBIE.ground,ZOMBIE.width,200,0x35413e);
  for(let x=0;x<ZOMBIE.width;x+=160)this.add.rectangle(x,840,75,5,0xc4bd84);
  for(const [x,y,w,h] of zombiePlatforms){this.platform(x,y,w,h,0x52635c);this.text(x+12,y-32,w>150?'OUT OF SERVICE':'BIN',15);if(w>150)for(let i=0;i<4;i++)this.add.rectangle(x+35+i*70,y+36,50,43,0x9da899);}
  for(let i=0;i<25;i++){const x=i<9?440+i*240:3250+(i-9)*190;const floor=(x>=940&&x<=1250||x>=1800&&x<=2110)?670:800;const art=this.add.image(x,floor,i%3?'scruffy':'clown').setOrigin(.5,1).setDisplaySize(49,73).setTint(i%2?0x99bd76:0x87b8a0).setDepth(6);this.undead.push({art,home:x,floor,speed:i%3?40:90,alive:true});}
  this.truck=this.makeTruck(ZOMBIE.truckX,ZOMBIE.ground);this.text(ZOMBIE.truckX,640,'F / ACTION · TAKE THE TRUCK',18,'#f2d496').setOrigin(.5);
  for(const x of [3720,4570,5540,6100]){const b=this.add.rectangle(x,780,55,40,0xd79758).setStrokeStyle(4,0xf7d798).setDepth(7);this.barriers.push(b);this.text(x,708,'JUMP!',17,'#ffd7a0').setOrigin(.5);}
  this.add.rectangle(ZOMBIE.exitX+100,650,20,300,0xa8c0a5);this.text(ZOMBIE.exitX-140,570,'SAFE ZONE →',34,'#d0efb5');
 }
 makeTruck(x:number,y:number){const parts:Phaser.GameObjects.GameObject[]=[];const rect=(px:number,py:number,w:number,h:number,c:number)=>parts.push(this.add.rectangle(px,py,w,h,c).setStrokeStyle(2,0x203136));rect(-35,-65,130,60,0x8b5946);rect(58,-77,60,85,0xa77151);rect(67,-94,38,32,0xaed5cc);parts.push(this.add.image(57,-94,'seth-walk',1).setDisplaySize(23,30));parts.push(this.add.image(78,-94,'allison').setDisplaySize(18,30));rect(100,-48,38,32,0xa77151);rect(119,-44,10,13,0xffdf8c);rect(-30,-100,115,8,0xc89f70);for(const px of [-67,70]){parts.push(this.add.circle(px,-20,22,0x192b30));parts.push(this.add.circle(px,-20,10,0x9ca9a3));}return this.add.container(x,y,parts).setDepth(8);}
 afterPlayer(){this.ally=this.add.image(400,800,'allison').setOrigin(.5,1).setDisplaySize(57,82).setDepth(8);this.allyText=this.text(400,670,'Allison: “I packed a tire iron.”',16,'#e6f0bc').setOrigin(.5).setDepth(10);}
 movementVelocity(direction:number,sprint:boolean,delta:number){return this.mission.truck?(direction<0?170:direction>0?430:340):super.movementVelocity(direction,sprint,delta);}
 jumpVelocity(){return this.mission.truck?-430:super.jumpVelocity();}
 objectiveText(){return this.mission.truck?`TRUCK RAMPAGE → Safe zone · ${this.mission.crushed} flattened · Jump marked barricades`:`SURVIVE → Find the truck · Allison has cleared ${this.allyWins} zombies herself`;}
 respawn(){super.respawn();if(this.mission.truck)this.say('Truck checkpoint. The warranty was already void.');}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body,r=zombieAction(this.mission,{x:this.player.x,bottom:body.bottom,action});this.mission=r.state;
  if(r.event==='truck'){this.checkpoint={x:ZOMBIE.truckX+160,bottom:800};this.player.setPosition(ZOMBIE.truckX+160,776);this.player.setMaxVelocity(470,850);this.say('Allison: “Finally. A vehicle with doors. Please use the road.”');gameAudio.play('pickup');}
  if(r.event==='escape'){this.finish('THE DEAD CAN WALK HOME.',`Seth and Allison made it out.\n${this.mission.crushed} zombies flattened; Allison handled ${this.allyWins} herself.`,zombieScore(this.mission,this.elapsedMs,this.hits));return;}
  if(!this.mission.truck&&Math.abs(this.player.x-ZOMBIE.truckX)<110){this.prompt.setVisible(true).setText('F / Action · Take the truck');}
  const allyX=this.mission.truck?this.player.x-20:Math.min(ZOMBIE.truckX-130,this.player.x+210);this.ally.setPosition(allyX,this.mission.truck?body.bottom-82:800).setVisible(!this.mission.truck);this.allyText.setPosition(allyX,this.mission.truck?body.bottom-165:674).setText(this.mission.truck?'Allison: “This is NOT the carpool lane!”':'Allison: “I have my side covered.”');
  for(const z of this.undead){if(!z.alive)continue;if(Math.abs(z.art.x-this.player.x)<480)z.art.x+=Math.sign(this.player.x-z.art.x)*z.speed*delta/1000;else z.art.x=z.home+Math.sin(this.elapsedMs/900+z.home)*25;if(z.floor===670)z.art.x=Phaser.Math.Clamp(z.art.x,z.home<1500?940:1800,z.home<1500?1250:2110);const contact=zombieContact({truck:this.mission.truck,playerX:this.player.x,playerY:this.player.y,zombieX:z.art.x,zombieY:z.floor-30,allyX:this.mission.truck?-9999:allyX,allyY:770});if(contact==='crush'||contact==='allison'){z.alive=false;z.art.setVisible(false);if(contact==='crush')this.mission.crushed++;else this.allyWins++;}else if(contact==='hit')this.takeHit('Zombie personal space is terrible. Jump or use the bus roofs!');}
  if(this.mission.truck)for(const b of this.barriers)if(Math.abs(this.player.x-b.x)<65&&body.bottom>b.y-10)this.takeHit('Barricade! Jump when you see the sign.');
 }
 drawExtras(){this.portrait.setVisible(!this.mission.truck);if(this.mission.truck)this.truck.setPosition(this.player.x,(this.player.body as Phaser.Physics.Arcade.Body).bottom);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,truck:String(this.mission.truck),crushed:String(this.mission.crushed),allisonCleared:String(this.allyWins)});}
}
