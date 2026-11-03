import {carryAnchor} from './carry-anchor.mjs';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {HAUNTED,hauntedFloors,hauntedStairs,newHauntedRun,hauntedAction,ghostPhase,escapeRemaining,hauntedScore} from './haunted-mission.mjs';
import {cemeteryFrames} from './haunted-art.mjs';
import {gameAudio} from './audio';
type Book={x:number;floor:number;art:Phaser.GameObjects.Rectangle;warning:Phaser.GameObjects.Text;y:number;vy:number;phase:string;at:number};
export class HauntedHouse extends FootAdventure{
 constructor(){super({key:'haunted',number:5,title:'Haunted House',...HAUNTED,startY:HAUNTED.ground,instructions:'Cross the graveyard. F / Action enters the mansion.\nClimb its four floors to find the attic key, then descend to the first-floor exit.\nGhosts glow before becoming solid. Watch for falling books.\nUnlock the exit with the key, then cross the haunted woods!'});}
 mission=newHauntedRun();entryGate?:Phaser.GameObjects.Rectangle;exitGate?:Phaser.GameObjects.Rectangle;keyArt!:Phaser.GameObjects.Container;keyLabel!:Phaser.GameObjects.Text;carriedKey!:Phaser.GameObjects.Container;boss!:Phaser.GameObjects.Image;books:Book[]=[];enteredBell=false;
 preload(){super.preload();if(!this.textures.exists('haunted-ghosts'))this.load.image('haunted-ghosts','./assets/haunted/ghosts-v1.png');for(const [key,file] of [['haunted-mansion','victorian-mansion-v1.png'],['haunted-cemetery','cemetery-v1.png'],['haunted-woods','woods-v1.png']])if(!this.textures.exists(key))this.load.image(key,'./assets/haunted/'+file);if(!this.textures.exists('haunted-wall'))this.load.image('haunted-wall','./assets/haunted/mansion-wall-v1.png');}
 resetMission(){this.mission=newHauntedRun();this.books=[];this.enteredBell=false;}
 solid(x:number,top:number,width:number,height:number){const body=this.add.rectangle(x+width/2,top+height/2,width,height,0xffffff,0);this.platforms.add(body);return body;}
 woodPlatform(x:number,y:number,width:number){const p=this.platform(x,y,width,18,0x65564d);const b=p.body as Phaser.Physics.Arcade.StaticBody;b.checkCollision.down=false;b.checkCollision.left=false;b.checkCollision.right=false;return p;}
 buildWorld(){
  const atlas=this.textures.get('haunted-ghosts'),cell=atlas.getSourceImage().width/2;
  for(let i=0;i<4;i++){if(!atlas.has(String(i)))atlas.add(String(i),0,(i%2)*cell,Math.floor(i/2)*cell,cell,cell);}
  const g=this.add.graphics().setDepth(-20);g.fillStyle(0x10192b).fillRect(0,0,HAUNTED.width,HAUNTED.height);g.fillStyle(0xb4c9d1,.75).fillCircle(430,650,64);
  // Front elevation and cutaway are two views of the same long Victorian house.
  this.platform(0,HAUNTED.ground,HAUNTED.width,180,0x293744);
  for(let x=40;x<1200;x+=85){g.lineStyle(3,0x5e6871).lineBetween(x,HAUNTED.ground-8,x,HAUNTED.ground-95);g.fillStyle(0x5e6871).fillTriangle(x-5,HAUNTED.ground-91,x,HAUNTED.ground-105,x+5,HAUNTED.ground-91);}
  const cemetery=this.textures.get('haunted-cemetery');
  cemeteryFrames.forEach((crop,i)=>{if(!cemetery.has(String(i)))cemetery.add(String(i),0,...crop as [number,number,number,number]);});
  for(const [i,x,height] of [[0,440,80],[1,740,106],[2,1060,110]]){
   const crop=cemeteryFrames[i],width=height*crop[2]/crop[3];
   this.add.image(x,HAUNTED.ground,'haunted-cemetery',String(i)).setOrigin(.5,1).setDisplaySize(width,height).setDepth(2);
   // Narrow top collision matches rounded stone/urn/ridge; lower stone body is broader.
   this.solid(x-10,HAUNTED.ground-height,20,height);
   this.solid(x-width*.43,HAUNTED.ground-height*.68,width*.86,height*.68);
  }
  this.add.image(1470,HAUNTED.ground,'haunted-mansion').setOrigin(.5,1).setDisplaySize(1500,1030).setDepth(-17);
  this.add.rectangle(HAUNTED.doorX,HAUNTED.ground-63,72,126,0x171925,.45).setStrokeStyle(2,0x9b8972).setDepth(-15);
  this.text(HAUNTED.doorX,HAUNTED.ground-180,'F / ACTION\nENTER MANSION',16,'#c7e8d7').setOrigin(.5).setAlign('center').setDepth(4);
  this.entryGate=this.platform(HAUNTED.houseLeft-30,0,30,HAUNTED.ground,0x352e38);
  this.platform(HAUNTED.houseRight,0,32,HAUNTED.ground-160,0x352e38);
  this.exitGate=this.platform(HAUNTED.houseRight,HAUNTED.ground-160,32,160,0x352e38);
  for(const [i,x] of [600,1000,1670].entries())this.hazard('haunted-ghosts',x,HAUNTED.ground-35,70,3000,32,68).setFrame(String(i%3)).setDisplaySize(82,92).setAlpha(.6);
  // Every floor and both stairwells have interior walls behind them, including descent.
  for(const floor of hauntedFloors){
   for(let x=1860;x<HAUNTED.houseRight;x+=480){this.add.image(x,floor.y,'haunted-wall').setOrigin(0,1).setDisplaySize(Math.min(480,HAUNTED.houseRight-x),320).setDepth(-16);this.add.rectangle(x,floor.y-160,10,320,0x342e36).setDepth(-14);}
   for(const [left,right] of floor.spans)this.woodPlatform(left,floor.y,right-left);
   this.text(1930,floor.y-285,floor.y===290?'ATTIC · KEY → · RETURN DOWN THE INTERIOR STAIRS':floor.y===610?'UPPER HALL · ATTIC STAIRS ←':floor.y===930?'LANDING · EAST STAIRS → · BELL CHECKPOINT':'FOYER · CLIMB FOR THE KEY · LOCKED EXIT →',15,'#cddbb9').setBackgroundColor('#202939').setPadding(5,3);
  }
  // Enclosed stair flights have wood risers/stringers, not unsupported floating slabs.
  const stairArt=this.add.graphics().setDepth(-2);
  for(const step of hauntedStairs){
   stairArt.fillStyle(0x3a2e32).fillTriangle(step.x,step.y+16,step.x+step.width,step.y+16,step.x+step.width,step.y+95);
   this.woodPlatform(step.x,step.y,step.width);
   stairArt.lineStyle(3,0x928273,.7).lineBetween(step.x,step.y-45,step.x+step.width,step.y-45);stairArt.lineBetween(step.x+12,step.y-45,step.x+12,step.y);
  }
  this.add.rectangle(HAUNTED.houseExitX,HAUNTED.ground-70,100,140,0x27332f).setStrokeStyle(4,0xb4d4af).setDepth(-10);
  this.text(HAUNTED.houseExitX-100,HAUNTED.ground-185,'FIRST-FLOOR EXIT\nATTIC KEY REQUIRED',16,'#c9ecca').setOrigin(.5).setAlign('center').setDepth(3);
  this.text(3290,840,'F / ACTION\nRING BELL · CHECKPOINT',14,'#cce8cb').setOrigin(.5).setAlign('center');this.add.circle(3300,910,10,0xc6b077).setDepth(3);
  const inside=[[2200,1250],[3230,930],[3540,930],[2850,610],[3650,610],[3740,290],[4850,1250]];
  inside.forEach(([x,floor],i)=>this.hazard('haunted-ghosts',x,floor-38,70,2800+i*70,28,68).setFrame(String(i%3)).setDisplaySize(82,92).setAlpha(.15));
  for(let x=HAUNTED.houseRight+32;x<HAUNTED.width;x+=1200)this.add.image(x,HAUNTED.ground,'haunted-woods').setOrigin(0,1).setDisplaySize(1200,800).setDepth(-18);
  for(const [i,x] of [5900,6480,7030,7600,7970].entries()){
   this.hazard('haunted-ghosts',x,HAUNTED.ground-35,65,2400+i*120,28,65).setFrame(String(i%3)).setDisplaySize(82,92);
  }
  // Fallen timber is rendered with bark and growth rings, each top matching a solid.
  for(const [x,width,height] of [[6020,135,48],[6730,160,64],[7340,135,52],[7790,140,70]]){
   this.solid(x,HAUNTED.ground-height,width,height);
   const log=this.add.graphics().setDepth(3);log.fillStyle(0x463b32).fillRoundedRect(x,HAUNTED.ground-height,width,height,10);log.lineStyle(3,0x78634a);for(let n=1;n<4;n++)log.lineBetween(x+8,HAUNTED.ground-height+n*height/4,x+width-12,HAUNTED.ground-height+n*height/4);log.fillStyle(0x9a8160).fillEllipse(x+width-12,HAUNTED.ground-height/2,24,height-4);log.lineStyle(2,0x534637).strokeEllipse(x+width-12,HAUNTED.ground-height/2,15,height-18);log.fillStyle(0x455640).fillRect(x+8,HAUNTED.ground-height,width-30,5);
  }
  this.text(5800,HAUNTED.ground-180,'THE WOODS →\nKEEP MOVING',20,'#bdcabb').setAlign('center');
  for(const [x,floor] of [[2600,1250],[3430,930],[2860,610],[3850,290]]){const art=this.add.rectangle(x,floor-160,26,19,0x7d4964).setStrokeStyle(2,0xd1ba8d).setDepth(7);const warning=this.text(x,floor-140,'!',28,'#ffcf8b').setOrigin(.5).setVisible(false).setDepth(8);this.books.push({x,floor,art,warning,y:floor-160,vy:0,phase:'waiting',at:0});}
  this.keyArt=this.add.container(HAUNTED.keyX,HAUNTED.keyY-37,[this.add.circle(-9,0,10,0xd9c67b).setStrokeStyle(3,0xffe9a1),this.add.rectangle(12,0,26,6,0xf3dc8b),this.add.rectangle(22,6,5,12,0xf3dc8b)]).setDepth(8);this.keyLabel=this.text(HAUNTED.keyX,HAUNTED.keyY-102,'F / ACTION · ATTIC KEY',15,'#ffe3a3').setOrigin(.5);

  this.add.rectangle(HAUNTED.exitX,HAUNTED.ground-70,100,140,0x27473f).setStrokeStyle(4,0xb4d4af);this.text(HAUNTED.exitX,HAUNTED.ground-180,'ESCAPE\nF / ACTION',24,'#c9ecca').setOrigin(.5).setAlign('center');
  this.boss=this.add.image(3600,HAUNTED.keyY-60,'haunted-ghosts','3').setDisplaySize(150,150).setAlpha(.55).setDepth(7).setVisible(false);
 }
 closeExitGate(){if(!this.exitGate?.active)this.exitGate=this.platform(HAUNTED.houseRight,HAUNTED.ground-160,32,160,0x352e38);}
 afterPlayer(){this.carriedKey=this.add.container(0,0,[this.add.circle(-6,0,6,0xf0d587),this.add.rectangle(6,0,15,4,0xf0d587),this.add.rectangle(10,4,4,8,0xf0d587)]).setDepth(11).setVisible(false);}
 objectiveText(){return this.mission.complete?'ESCAPED · The house can keep the security deposit.':this.mission.key?`ATTIC KEY ✓ · ${this.mission.outside?'Cross the haunted woods →':'Descend inside · Unlock first-floor exit →'} ${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)}s · ${this.hits} scares`:this.mission.entered?`Explore four floors · Find the attic key · ${this.mission.checkpoint?'Bell checkpoint ✓':'Ring the landing bell for a checkpoint'}`:'Reach the mansion · F / Action at its front door · Ghosts glow before becoming solid';}
 respawn(){super.respawn();if(this.mission.key){this.mission={...this.mission,outside:false,phase:'escape',escapeStarted:this.elapsedMs};this.closeExitGate();this.boss.setPosition(HAUNTED.keyX-300,HAUNTED.keyY-70);}}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body,result=hauntedAction(this.mission,{x:this.player.x,bottom:body.bottom,action,elapsedMs:this.elapsedMs});this.mission=result.state;
  if(result.event==='enter'){this.player.body!.reset(1930,HAUNTED.ground-24);this.checkpoint={x:1930,bottom:HAUNTED.ground};this.say('Seth: “Lovely place. Terrible doorbell.”  Up the stairs →');}
  if(result.event==='checkpoint'){this.checkpoint={x:3300,bottom:930};gameAudio.play('pickup');this.say('BELL CHECKPOINT. Something upstairs rings back.');}
  if(result.event==='key'){this.checkpoint={x:HAUNTED.keyX-80,bottom:HAUNTED.keyY};this.keyArt.setVisible(false);this.keyLabel.setText('KEY TAKEN · DOWN TO THE FIRST-FLOOR EXIT');gameAudio.play('pickup');this.boss.setVisible(true);this.say('THE HOUSE WOKE UP. Descend inside, unlock the first-floor exit, then cross the woods!');}
  if(result.event==='leave'){this.exitGate?.destroy();this.exitGate=undefined;this.player.body!.reset(HAUNTED.houseRight+70,HAUNTED.ground-24);this.say('KEY TURNED. Through the woods — watch for ghosts and fallen timber!');}
  if(result.event==='escape'){this.finish('SETH LEFT THE BUILDING.',`Attic key recovered. Ghostly lease declined.\n${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)} seconds to spare.`,hauntedScore(this.mission,this.elapsedMs,this.hits));return;}
  const door=!this.mission.entered&&Math.abs(this.player.x-HAUNTED.doorX)<90&&Math.abs(body.bottom-HAUNTED.ground)<25;
  const bell=this.mission.entered&&!this.mission.key&&!this.mission.checkpoint&&Math.abs(this.player.x-3300)<80&&Math.abs(body.bottom-930)<25;
  const key=this.mission.entered&&!this.mission.key&&Math.abs(this.player.x-HAUNTED.keyX)<85&&Math.abs(body.bottom-HAUNTED.keyY)<25;
  const leave=this.mission.key&&!this.mission.outside&&Math.abs(this.player.x-HAUNTED.houseExitX)<75&&Math.abs(body.bottom-HAUNTED.ground)<25;
  const exit=this.mission.key&&this.mission.outside&&Math.abs(this.player.x-HAUNTED.exitX)<85&&Math.abs(body.bottom-HAUNTED.ground)<25;
  if(door||bell||key||leave||exit)this.prompt.setVisible(true).setText(door?'F / Action · Enter haunted mansion':bell?'F / Action · Ring checkpoint bell':key?'F / Action · Take attic key':leave?'F / Action · Unlock first-floor exit':'F / Action · ESCAPE WOODS');
  this.hazards.forEach((h,i)=>{const phase=ghostPhase(this.elapsedMs,i*590);h.active=phase==='solid';h.art.setVisible(phase!=='gone').setAlpha(phase==='solid'?.8:phase==='warning'?.32:.15);h.art.y=h.y+h.height/2+Math.sin(this.elapsedMs/650+i)*12;});
  for(const b of this.books){if(b.phase==='waiting'&&Math.abs(this.player.x-b.x)<115&&Math.abs(body.bottom-b.floor)<65){b.phase='warning';b.at=this.elapsedMs;b.warning.setVisible(true);}
   if(b.phase==='warning'&&this.elapsedMs-b.at>800){b.phase='falling';b.warning.setVisible(false);b.vy=0;}
   if(b.phase==='falling'){b.vy+=900*delta/1000;b.y+=b.vy*delta/1000;if(Math.abs(this.player.x-b.x)<30&&Math.abs(this.player.y-b.y)<38)this.takeHit('The house has very aggressive reading recommendations.');if(b.y>=b.floor-10){b.y=b.floor-10;b.phase='landed';b.at=this.elapsedMs;}}
   if(b.phase==='landed'&&this.elapsedMs-b.at>1600){b.phase='waiting';b.y=b.floor-160;}b.art.setY(b.y).setAngle(b.phase==='falling'?this.elapsedMs/8:0);
  }
  if(this.mission.key){const dx=this.player.x-this.boss.x;this.boss.x+=Math.sign(dx)*Math.min(Math.abs(dx),110*delta/1000);this.boss.y+=(body.bottom-70-this.boss.y)*Math.min(1,delta/240);if(Math.abs(dx)<55&&Math.abs(this.player.y-this.boss.y)<75)this.takeHit('The landlord ghost wants a forwarding address.');if(escapeRemaining(this.mission,this.elapsedMs)<=0){this.hits++;this.respawn();this.say('The escape door slammed. Back to the attic checkpoint — try again!');}}
 }
 drawExtras(){const hand=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.carriedKey.setVisible(this.mission.key).setPosition(hand.x+6,hand.y);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,outside:String(this.mission.outside),key:String(this.mission.key),entered:String(this.mission.entered),checkpoint:this.mission.key?'attic':this.mission.checkpoint?'bell':this.mission.entered?'foyer':'street',escapeRemaining:String(Math.round(escapeRemaining(this.mission,this.elapsedMs)))});}
}
