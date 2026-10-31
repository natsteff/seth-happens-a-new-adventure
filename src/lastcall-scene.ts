import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {LASTCALL,lastCallPlatforms,newLastCallRun,lastCallRemaining,lastCallAction,lastCallScore,barChaos} from './lastcall-mission.mjs';
import {gameAudio} from './audio';
import {carryAnchor} from './carry-anchor.mjs';
import {loadCast,castFrames,castPerson} from './cast';
export class LastCall extends FootAdventure{
 constructor(){super({key:'lastcall',number:12,title:'Last Call',...LASTCALL,startY:LASTCALL.ground,instructions:'LAST CALL! Two minutes before the bartender clears the place.\nYour camera bag is on the middle booth’s upper shelf. F / Action to collect it.\nJump tables and stools; dodge rolling kegs and stumbling regulars.\nSpills are slippery. The crowd gets wilder as closing approaches. Bag first, then EXIT →'});}
 mission=newLastCallRun();bag!:Phaser.GameObjects.Container;carry!:Phaser.GameObjects.Container;warningStage=-1;slide=0;
 preload(){super.preload();loadCast(this,'cabin');if(!this.textures.exists('bar-wall'))this.load.image('bar-wall','./assets/lastcall/bar-wall-v1.png');}
 resetMission(){this.mission=newLastCallRun();this.warningStage=-1;this.slide=0;}
 buildWorld(){
  for(let x=0;x<LASTCALL.width;x+=900)this.add.image(x,900,'bar-wall').setOrigin(0,1).setDisplaySize(900,600).setDepth(-20);
  this.platform(0,900,LASTCALL.width,200,0x3d302d);
  for(const p of lastCallPlatforms){this.platform(p.x,p.y,p.w,15,0x976442);const g=this.add.graphics().setDepth(-1);g.fillStyle(0x543f38).fillRect(p.x+10,p.y+15,10,900-p.y-15).fillRect(p.x+p.w-20,p.y+15,10,900-p.y-15);if(p.w>150){g.fillStyle(0x793e48).fillRoundedRect(p.x-3,p.y-40,p.w+6,35,8);}}
  this.text(190,640,'LAST CALL!\nYOUR BAG IS STILL INSIDE →',22,'#ffdb9f');
  const pack=this.add.graphics().fillStyle(0x7b9c94).fillRoundedRect(-23,-31,46,31,5).lineStyle(4,0xd4c2a0).strokeRoundedRect(-18,-46,36,24,5);pack.fillStyle(0x273c45).fillCircle(0,-16,9);this.bag=this.add.container(LASTCALL.bagX,LASTCALL.bagY,[pack,this.text(0,-100,'CAMERA BAG\nF / ACTION',18,'#ffe0a7').setOrigin(.5).setAlign('center')]).setDepth(7);
  castFrames(this,'cabin');castPerson(this,'cabin',1,330,900,92).setDepth(5);this.text(330,730,'“No sleeping at the bar!”',16,'#ffe0a7').setOrigin(.5);
  for(const [i,x] of [700,1530,2630,3700,4690,5740].entries()){const h=this.hazard(i%3===0?'cast-cabin':i%2?'clown':'scruffy',x,866,55,3000+i*130,30,68);if(i%3===0)h.setFrame(String(i%4)).setDisplaySize(54,85);}
  if(!this.textures.exists('rolling-keg')){const g=this.add.graphics().fillStyle(0xa3acaa).fillRoundedRect(4,5,48,50,8).lineStyle(5,0x445963).strokeRoundedRect(4,5,48,50,8);g.lineStyle(4,0xd2d9cb).lineBetween(7,19,49,19).lineBetween(7,42,49,42);g.generateTexture('rolling-keg',56,60);g.destroy();}
  for(const x of [1300,2500,3950,5050])this.hazard('rolling-keg',x,876,150,2500,45,45).setDisplaySize(55,55);
  const g=this.add.graphics().setDepth(2);for(const x of [1700,4500]){g.fillStyle(0x87adad,.45).fillRoundedRect(x,888,300,9,4);this.text(x+150,820,'SLIPPERY SPILL',14,'#f7d99b').setOrigin(.5);}
  this.add.rectangle(LASTCALL.exitX,790,180,220,0x173d3b).setStrokeStyle(5,0xe0c196).setDepth(-2);this.text(LASTCALL.exitX,660,'EXIT\nF / ACTION',27,'#b7f0cd').setOrigin(.5).setAlign('center');
 }
 afterPlayer(){const p=this.add.graphics().fillStyle(0x7b9c94).fillRoundedRect(-19,0,38,25,4).lineStyle(3,0xd4c2a0).strokeRoundedRect(-15,-17,30,24,5);this.carry=this.add.container(0,0,[p]).setDepth(11).setVisible(false);}
 objectiveText(){return `${Math.ceil(lastCallRemaining(this.elapsedMs)/1000)}s UNTIL CLOSING · ${this.mission.bag?'CAMERA BAG ✓ · EXIT →':'FIND CAMERA BAG →'} · ${['Last orders','Lights are coming on','EVERYBODY OUT'][barChaos(this.elapsedMs)]}`;}
 movementVelocity(direction:number,sprint:boolean,delta:number){const target=super.movementVelocity(direction,sprint,delta),x=this.player.x;if(x>1700&&x<2000||x>4500&&x<4800){this.slide=Phaser.Math.Linear((this.player.body as Phaser.Physics.Arcade.Body).velocity.x,target,Math.min(1,delta/360));return this.slide;}return target;}
 tick(_delta:number,action:boolean){const body=this.player.body as Phaser.Physics.Arcade.Body,result=lastCallAction(this.mission,{x:this.player.x,bottom:body.bottom,elapsedMs:this.elapsedMs,action});this.mission=result.state;
  const chaos=barChaos(this.elapsedMs);if(chaos!==this.warningStage){this.warningStage=chaos;for(const h of this.hazards)h.period=Math.max(1000,3000-chaos*650);this.say(['Bartender: “Last call! Find your stuff and head for the door.”','Bartender: “Last orders are over. Keep moving!”','Bartender: “EVERYBODY OUT! That includes your camera bag!”'][chaos]);}
  if(!this.mission.bag&&Math.abs(this.player.x-LASTCALL.bagX)<85&&Math.abs(body.bottom-LASTCALL.bagY)<25)this.prompt.setVisible(true).setText('F / Action · Collect camera bag');
  if(Math.abs(this.player.x-LASTCALL.exitX)<85)this.prompt.setVisible(true).setText('F / Action · Leave the bar');
  for(const h of this.hazards)if(h.kind==='rolling-keg')h.art.setAngle(this.elapsedMs/(12-chaos*2));
  if(result.event==='bag'){this.bag.setVisible(false);gameAudio.play('pickup');this.say('CAMERA BAG ✓ · Now get out before the bartender starts stacking YOU.');}
  if(result.event==='missing')this.say('You forgot the camera bag! Middle booth, upper shelf ←');
  if(result.event==='timeout'){this.failed=true;this.clearMotion();this.physics.world.pause();gameAudio.music.finishRun('failure');this.ui.add(this.add.container(0,0,[this.add.rectangle(550,300,950,360,0x14283a,.97),this.text(550,220,'CLOSING TIME.',42,'#ffd09b').setOrigin(.5),this.text(550,330,'The bartender has cleared the bar.\nHold R or use Menu → Restart to try again.',22).setOrigin(.5).setAlign('center')]));return;}
  if(result.event==='complete')this.finish('LAST CALL. LAST ONE OUT.', 'Camera bag recovered. Tab settled. Dignity debatable.\nAllison: “You remembered the bag this time!”\nENCORE is now available in Choose Level.',lastCallScore(this.mission,this.elapsedMs,this.hits));
 }
 drawExtras(){const h=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.carry.setVisible(this.mission.bag&&!this.won).setPosition(h.x,h.y);}
 publishStatus(){super.publishStatus({bag:String(this.mission.bag),remaining:String(lastCallRemaining(this.elapsedMs)),chaos:String(barChaos(this.elapsedMs)),phase:this.won?'complete':this.failed?'closed':this.mission.bag?'exit':'bag'});}
}
