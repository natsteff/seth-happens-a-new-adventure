import {StairWalker} from './walk-stairs';
import {mansionStairs} from './stair-art';
import {carryAnchor} from './carry-anchor.mjs';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {HAUNTED,hauntedFloors,hauntedFlights,newHauntedRun,hauntedAction,ghostPhase,escapeRemaining,hauntedScore} from './haunted-mission.mjs';
import {cemeteryFrames,woodsObstacleFrames} from './haunted-art.mjs';
import {gameAudio} from './audio';
export class HauntedHouse extends FootAdventure{
 constructor(){super({key:'haunted',number:5,title:'Haunted House',...HAUNTED,startY:HAUNTED.ground,instructions:'Cross the graveyard. F / Action enters the mansion.\nWalk the stairs up for the attic key, then down to the first-floor exit.\nGhosts glow before becoming solid. Ring the landing bell for a checkpoint.\nUnlock the exit with the key, then cross the haunted woods!'});}
 bellMarker!:Phaser.GameObjects.Container;atticMarker!:Phaser.GameObjects.Container;
 stairs=new StairWalker();mission=newHauntedRun();entryGate?:Phaser.GameObjects.Rectangle;exitGate?:Phaser.GameObjects.Rectangle;keyArt!:Phaser.GameObjects.Container;keyLabel!:Phaser.GameObjects.Text;carriedKey!:Phaser.GameObjects.Container;boss!:Phaser.GameObjects.Image;
 preload(){super.preload();if(!this.textures.exists('haunted-ghosts'))this.load.image('haunted-ghosts','./assets/haunted/ghosts-v1.png');for(const [key,file] of [['haunted-obstacles','woods-obstacles-v1.png'],['haunted-mansion','victorian-mansion-v1.png'],['haunted-cemetery','cemetery-v1.png'],['haunted-woods','woods-v1.png']])if(!this.textures.exists(key))this.load.image(key,'./assets/haunted/'+file);if(!this.textures.exists('haunted-wall'))this.load.image('haunted-wall','./assets/haunted/mansion-wall-v1.png');}
 resetMission(){this.stairs.reset(this);this.mission=newHauntedRun();}
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
  for(const [i,x] of [600,1000,1670].entries())this.hazard('haunted-ghosts',x,HAUNTED.ground-27,70,3000,28,54).setFrame(String(i%3)).setDisplaySize(72,78).setAlpha(.6);
  // Every floor and both stairwells have interior walls behind them, including descent.
  for(const floor of hauntedFloors){
   for(let x=1860;x<HAUNTED.houseRight;x+=480){this.add.image(x,floor.y,'haunted-wall').setOrigin(0,1).setDisplaySize(Math.min(480,HAUNTED.houseRight-x),320).setDepth(-16);this.add.rectangle(x,floor.y-160,10,320,0x342e36).setDepth(-14);}
   for(const [left,right] of floor.spans)this.woodPlatform(left,floor.y,right-left);
   this.text(1930,floor.y-285,floor.y===290?'ATTIC · KEY → · RETURN DOWN THE INTERIOR STAIRS':floor.y===610?'UPPER HALL · ATTIC STAIRS ←':floor.y===930?'LANDING · EAST STAIRS → · BELL CHECKPOINT':'FOYER · CLIMB FOR THE KEY · LOCKED EXIT →',15,'#cddbb9').setBackgroundColor('#202939').setPadding(5,3);
  }
  for(const f of hauntedFlights)mansionStairs(this,f);
  this.add.rectangle(HAUNTED.houseExitX,HAUNTED.ground-70,100,140,0x27332f).setStrokeStyle(4,0xb4d4af).setDepth(-10);
  this.text(HAUNTED.houseExitX-100,HAUNTED.ground-185,'FIRST-FLOOR EXIT\nATTIC KEY REQUIRED',16,'#c9ecca').setOrigin(.5).setAlign('center').setDepth(3);
  this.bellMarker=this.add.container(3300,930,[this.text(0,-90,'F / ACTION\nRING BELL · CHECKPOINT',14,'#cce8cb').setOrigin(.5).setAlign('center'),this.add.circle(0,-20,10,0xc6b077)]).setDepth(3);
  this.atticMarker=this.add.container(HAUNTED.atticCheckpointX,HAUNTED.keyY,[this.text(0,-90,'F / ACTION\nATTIC CHECKPOINT',14,'#cce8cb').setOrigin(.5).setAlign('center'),this.add.circle(0,-20,10,0xc6b077)]).setDepth(3);
  const inside=[[2200,1250],[3230,930],[3540,930],[2850,610],[3650,610],[3740,290],[4850,1250]];
  inside.forEach(([x,floor],i)=>this.hazard('haunted-ghosts',x,floor-27,70,2800+i*70,28,54).setFrame(String(i%3)).setDisplaySize(72,78).setAlpha(.15));
  for(let x=HAUNTED.houseRight+32;x<HAUNTED.width;x+=1200)this.add.image(x,HAUNTED.ground,'haunted-woods').setOrigin(0,1).setDisplaySize(1200,800).setDepth(-18);
  for(const [i,x] of [5900,6480,7030,7600,7970].entries()){
   this.hazard('haunted-ghosts',x,HAUNTED.ground-27,65,2400+i*120,28,54).setFrame(String(i%3)).setDisplaySize(72,78);
  }
  const woodsAtlas=this.textures.get('haunted-obstacles');woodsObstacleFrames.forEach((crop,i)=>{if(!woodsAtlas.has(String(i)))woodsAtlas.add(String(i),0,...crop as [number,number,number,number]);});
  for(const [i,x,width,height] of [[0,6020,135,48],[1,6730,130,64],[2,7340,135,52],[3,7790,140,70]]){
   this.solid(x+width*.05,HAUNTED.ground-height*.65,width*.9,height*.65);
   this.solid(x+width*.3,HAUNTED.ground-height,width*.4,height);
   const bottom=HAUNTED.ground,center=x+width/2;
   for(const [scale,opacity] of [[1.45,.13],[1.18,.18],[.97,.28]]){
    this.add.ellipse(center,bottom-height*.38,width*scale,height*1.8*scale,0x080d17,opacity).setDepth(-17);
   }
   for(const [scale,opacity] of [[1.14,.22],[.97,.34],[.76,.43]]){
    this.add.ellipse(center,bottom-2,width*scale,12*scale,0x06090d,opacity).setDepth(2);
   }
   const obstacle=this.add.image(x,bottom,'haunted-obstacles',String(i)).setOrigin(0,1).setDisplaySize(width,height).setDepth(3);
   const moonlight=i%2===0?0xe9ae78:0xc3d9ff;
   this.add.image(obstacle.x,obstacle.y,obstacle.texture.key,obstacle.frame.name)
    .setOrigin(0,1).setDisplaySize(width,height).setDepth(3).setTintFill(moonlight)
    .setBlendMode(Phaser.BlendModes.ADD).setAlpha(.26,.33,.025,.08);
  }
  this.text(5800,HAUNTED.ground-180,'THE WOODS →\nKEEP MOVING',20,'#bdcabb').setAlign('center');
  this.keyArt=this.add.container(HAUNTED.keyX,HAUNTED.keyY-37,[this.add.circle(-9,0,10,0xd9c67b).setStrokeStyle(3,0xffe9a1),this.add.rectangle(12,0,26,6,0xf3dc8b),this.add.rectangle(22,6,5,12,0xf3dc8b)]).setDepth(8);this.keyLabel=this.text(HAUNTED.keyX,HAUNTED.keyY-102,'F / ACTION · ATTIC KEY',15,'#ffe3a3').setOrigin(.5);

  this.add.rectangle(HAUNTED.exitX,HAUNTED.ground-70,100,140,0x27473f).setStrokeStyle(4,0xb4d4af);this.text(HAUNTED.exitX,HAUNTED.ground-180,'ESCAPE\nF / ACTION',24,'#c9ecca').setOrigin(.5).setAlign('center');
  this.boss=this.add.image(3600,HAUNTED.keyY,'haunted-ghosts','3').setOrigin(.5,1).setDisplaySize(72,78).setAlpha(.55).setDepth(7).setVisible(false);
 }
 closeExitGate(){if(!this.exitGate?.active)this.exitGate=this.platform(HAUNTED.houseRight,HAUNTED.ground-160,32,160,0x352e38);}
 afterPlayer(){this.carriedKey=this.add.container(0,0,[this.add.circle(-6,0,6,0xf0d587),this.add.rectangle(6,0,15,4,0xf0d587),this.add.rectangle(10,4,4,8,0xf0d587)]).setDepth(11).setVisible(false);}
 objectiveText(){return this.mission.complete?'ESCAPED · The house can keep the security deposit.':this.mission.key?`ATTIC KEY ✓ · ${this.mission.outside?'Cross the haunted woods →':`Descend stairs ${[1,2,4].filter(bit=>this.mission.descended&bit).length}/3 · Unlock first-floor exit →`} ${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)}s · ${this.hits} scares`:this.mission.entered?`Explore four floors · Find the attic key · ${this.mission.checkpoint?'Bell checkpoint ✓':'Ring the landing bell for a checkpoint'}`:'Reach the mansion · F / Action at its front door · Ghosts glow before becoming solid';}
 respawn(){this.stairs.reset(this);super.respawn();if(this.mission.key){this.mission={...this.mission,outside:false,descended:0,phase:'escape',escapeStarted:this.elapsedMs};this.closeExitGate();this.boss.setPosition(HAUNTED.keyX-300,HAUNTED.keyY);}}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body,result=hauntedAction(this.mission,{x:this.player.x,bottom:body.bottom,action,elapsedMs:this.elapsedMs});this.mission=result.state;
  if(result.event==='enter'){this.player.body!.reset(1930,HAUNTED.ground-24);this.checkpoint={x:1930,bottom:HAUNTED.ground};this.say('Seth: “Lovely place. Terrible doorbell.”  Up the stairs →');}
  if(result.event==='checkpoint'){this.bellMarker.setVisible(false);this.checkpoint={x:3300,bottom:930};gameAudio.playLocation('checkpoint-bell');this.say('BELL CHECKPOINT. Something upstairs rings back.');}
  if(result.event==='attic-checkpoint'){this.checkpoint={x:HAUNTED.atticCheckpointX,bottom:HAUNTED.keyY};this.atticMarker.setVisible(false);gameAudio.playLocation('checkpoint-bell');this.say('ATTIC CHECKPOINT. Head down the interior stairs.');}
  if(result.event==='key'){this.checkpoint={x:HAUNTED.keyX-80,bottom:HAUNTED.keyY};this.keyArt.setVisible(false);this.keyLabel.setText('KEY TAKEN · DOWN TO THE FIRST-FLOOR EXIT');gameAudio.playLocation('attic-key');this.boss.setVisible(true);this.say('THE HOUSE WOKE UP. Descend inside, unlock the first-floor exit, then cross the woods!');}
  if(result.event==='stairs-required')this.say('Take all three stair flights down before unlocking the first-floor door.');
  if(result.event==='leave'){this.exitGate?.destroy();this.exitGate=undefined;this.player.body!.reset(HAUNTED.houseRight+70,HAUNTED.ground-24);this.say('KEY TURNED. Through the woods — watch for ghosts and fallen timber!');}
  if(result.event==='escape'){this.finish('SETH LEFT THE BUILDING.',`Attic key recovered. Ghostly lease declined.\n${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)} seconds to spare.`,hauntedScore(this.mission,this.elapsedMs,this.hits));return;}
  const door=!this.mission.entered&&Math.abs(this.player.x-HAUNTED.doorX)<90&&Math.abs(body.bottom-HAUNTED.ground)<25;
  const bell=this.mission.entered&&!this.mission.key&&!this.mission.checkpoint&&Math.abs(this.player.x-3300)<80&&Math.abs(body.bottom-930)<25;
  const key=this.mission.entered&&!this.mission.key&&Math.abs(this.player.x-HAUNTED.keyX)<85&&Math.abs(body.bottom-HAUNTED.keyY)<25;
  const attic=this.mission.key&&!this.mission.atticCheckpoint&&Math.abs(this.player.x-HAUNTED.atticCheckpointX)<70&&Math.abs(body.bottom-HAUNTED.keyY)<25;
  const leave=this.mission.key&&!this.mission.outside&&Math.abs(this.player.x-HAUNTED.houseExitX)<75&&Math.abs(body.bottom-HAUNTED.ground)<25;
  const exit=this.mission.key&&this.mission.outside&&Math.abs(this.player.x-HAUNTED.exitX)<85&&Math.abs(body.bottom-HAUNTED.ground)<25;
  if(door||bell||key||attic||leave||exit)this.prompt.setVisible(true).setText(door?'F / Action · Enter haunted mansion':bell?'F / Action · Ring checkpoint bell':key?'F / Action · Take attic key':attic?'F / Action · Set attic checkpoint':leave?'F / Action · Unlock first-floor exit':'F / Action · ESCAPE WOODS');
  this.hazards.forEach((h,i)=>{const phase=ghostPhase(this.elapsedMs,i*590);h.active=phase==='solid'&&this.stairs.active===null;h.art.setVisible(phase!=='gone').setAlpha(phase==='solid'?.8:phase==='warning'?.32:.15);h.art.y=h.y+h.height/2+Math.sin(this.elapsedMs/650+i)*5;});
  if(this.mission.key){const dx=this.player.x-this.boss.x;this.boss.x+=Math.sign(dx)*Math.min(Math.abs(dx),110*delta/1000);const floor=body.bottom<450?290:body.bottom<770?610:body.bottom<1090?930:1250;this.boss.y+=(floor-this.boss.y)*Math.min(1,delta/240);const solid=ghostPhase(this.elapsedMs,1700)==='solid';this.boss.setAlpha(solid?.7:.25);if(solid&&this.stairs.active===null&&Math.abs(dx)<28&&Math.abs(this.player.y-(this.boss.y-30))<45)this.takeHit('The landlord ghost wants a forwarding address.');if(escapeRemaining(this.mission,this.elapsedMs)<=0){this.hits++;this.respawn();this.say('The escape door slammed. Back to the attic checkpoint — try again!');}}
 }
 update(time:number,delta:number){super.update(time,delta);if(!this.introActive&&!this.paused&&!this.won&&!this.failed&&!document.querySelector('dialog[open]'))this.stairs.update(this,hauntedFlights,delta,index=>{if(this.mission.key)this.mission.descended|=1<<index;});}
 takeHit(line?:string){if(this.stairs.active===null)super.takeHit(line);}
 drawExtras(){const hand=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.carriedKey.setVisible(this.mission.key).setPosition(hand.x+6,hand.y);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,stairs:String(this.stairs.active??'none'),descended:String(this.mission.descended),outside:String(this.mission.outside),key:String(this.mission.key),entered:String(this.mission.entered),checkpoint:this.mission.atticCheckpoint?'attic-bell':this.mission.key?'attic':this.mission.checkpoint?'bell':this.mission.entered?'foyer':'street',escapeRemaining:String(Math.round(escapeRemaining(this.mission,this.elapsedMs)))});}
}
