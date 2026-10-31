import {carryAnchor} from './carry-anchor.mjs';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {HAUNTED,hauntedStairs,newHauntedRun,hauntedAction,ghostPhase,escapeRemaining,hauntedScore} from './haunted-mission.mjs';
import {brickBuilding} from './scenery';
import {gameAudio} from './audio';
type Book={x:number;floor:number;art:Phaser.GameObjects.Rectangle;warning:Phaser.GameObjects.Text;y:number;vy:number;phase:string;at:number};
export class HauntedHouse extends FootAdventure{
 constructor(){super({key:'haunted',number:5,title:'Haunted House',...HAUNTED,startY:HAUNTED.ground,instructions:'Cross the graveyard. F / Action enters the mansion.\nClimb its four floors to find the attic key, then escape down the east stairs.\nGhosts glow before becoming solid. Watch for falling books.\nThe landing bell is a checkpoint. The attic key awakens the house!'});}
 mission=newHauntedRun();entryGate?:Phaser.GameObjects.Rectangle;keyArt!:Phaser.GameObjects.Container;keyLabel!:Phaser.GameObjects.Text;carriedKey!:Phaser.GameObjects.Container;boss!:Phaser.GameObjects.Image;books:Book[]=[];enteredBell=false;
 preload(){super.preload();if(!this.textures.exists('haunted-wall'))this.load.image('haunted-wall','./assets/haunted/mansion-wall-v1.png');}
 resetMission(){this.mission=newHauntedRun();this.books=[];this.enteredBell=false;}
 woodPlatform(x:number,y:number,width:number){const p=this.platform(x,y,width,18,0x65564d);const b=p.body as Phaser.Physics.Arcade.StaticBody;b.checkCollision.down=false;b.checkCollision.left=false;b.checkCollision.right=false;return p;}
 buildWorld(){
  const g=this.add.graphics().setDepth(-20);g.fillStyle(0x10192b).fillRect(0,0,HAUNTED.width,HAUNTED.height);g.fillStyle(0xb4c9d1,.75).fillCircle(430,650,64);
  // Cemetery approach: scenery has no bodies; monument tops align with obstacles.
  g.fillStyle(0x142b29).fillRect(0,HAUNTED.ground-80,1200,80);
  for(let x=40;x<1190;x+=85){g.lineStyle(3,0x5e6871).lineBetween(x,HAUNTED.ground-8,x,HAUNTED.ground-100);g.fillStyle(0x5e6871).fillTriangle(x-5,HAUNTED.ground-96,x,HAUNTED.ground-110,x+5,HAUNTED.ground-96);}
  for(let x=60;x<1200;x+=160){g.fillStyle(0x526269).fillRoundedRect(x,HAUNTED.ground-74,45,74,18);g.lineStyle(2,0x89948d).lineBetween(x+10,HAUNTED.ground-48,x+35,HAUNTED.ground-48);}
  this.platform(0,HAUNTED.ground,HAUNTED.width,180,0x293744);
  for(const [i,x] of [440,770,1080].entries()){
   this.platform(x,HAUNTED.ground-50,70,50,0x65716c);
   const art=this.add.graphics().setDepth(2);art.lineStyle(2,0xaeb5a3).strokeRect(x+3,HAUNTED.ground-48,64,46);
   if(i===1){art.fillStyle(0xc3c4ab).fillRect(x+25,HAUNTED.ground-44,10,38).fillRect(x+12,HAUNTED.ground-32,46,8);}
   else{art.fillStyle(0x65716c).fillEllipse(x+35,HAUNTED.ground-38,64,22);this.text(x+35,HAUNTED.ground-40,'RIP',16,'#d0d1b8').setOrigin(.5).setDepth(3);}
  }
  brickBuilding(this,1240,620,470,HAUNTED.ground,3);g.fillStyle(0x353344).fillTriangle(1200,620,1470,430,1750,620);this.text(1330,720,'OPEN HOUSE\nFOREVER',28,'#d4bce2').setAlign('center');
  this.add.rectangle(HAUNTED.doorX,HAUNTED.ground-70,90,140,0x192335).setStrokeStyle(4,0x929389);this.text(HAUNTED.doorX,HAUNTED.ground-179,'F / ACTION\nENTER MANSION',16,'#c7e8d7').setOrigin(.5).setAlign('center');
  this.entryGate=this.platform(1740,100,35,HAUNTED.ground-100,0x2b3140);
  for(const [i,x] of [600,1000,1570].entries())this.hazard(i%2?'clown':'scruffy',x,HAUNTED.ground-35,90,3000,32,68).setTint(0x9eddea).setAlpha(.6);
  // Repeat room-wall sections horizontally and by floor; wood posts hide image joins.
  for(const floor of [1250,930,610,290]){
   for(let x=1860;x<4300;x+=480){this.add.image(x,floor,'haunted-wall').setOrigin(0,1).setDisplaySize(480,320).setDepth(-16);this.add.rectangle(x,floor-160,10,320,0x342e36).setDepth(-14);}
   this.woodPlatform(1860,floor,2440);this.text(1930,floor-285,floor===290?'ATTIC · DO NOT TOUCH ANYTHING':floor===610?'UPPER HALL · ATTIC STAIRS →':floor===930?'LANDING · WEST STAIRS ← · BELL CHECKPOINT':'FOYER · UP THE EAST STAIRS →',17,'#cddbb9').setBackgroundColor('#202939').setPadding(5,3);
  }
  for(const s of hauntedStairs){this.woodPlatform(s.x,s.y,s.width);g.lineStyle(3,0x928273,.7).lineBetween(s.x,s.y-45,s.x+s.width,s.y-45);g.lineBetween(s.x+12,s.y-45,s.x+12,s.y);}
  this.text(3290,840,'F / ACTION\nRING BELL · CHECKPOINT',14,'#cce8cb').setOrigin(.5).setAlign('center');this.add.circle(3300,910,10,0xc6b077).setDepth(3);
  const inside=[[2200,1250],[2830,930],[3540,930],[2850,610],[3650,610],[3740,290],[4700,530],[5300,850],[5900,1170]];
  inside.forEach(([x,floor],i)=>this.hazard(i%3===0?'allison':i%2?'clown':'scruffy',x,floor-38,70,2800+i*70,28,68).setTint(0xaadce9).setAlpha(.15));
  for(const [x,floor] of [[2600,1250],[3430,930],[2860,610],[3850,290]]){const art=this.add.rectangle(x,floor-160,26,19,0x7d4964).setStrokeStyle(2,0xd1ba8d).setDepth(7);const warning=this.text(x,floor-140,'!',28,'#ffcf8b').setOrigin(.5).setVisible(false).setDepth(8);this.books.push({x,floor,art,warning,y:floor-160,vy:0,phase:'waiting',at:0});}
  this.keyArt=this.add.container(HAUNTED.keyX,HAUNTED.keyY-37,[this.add.circle(-9,0,10,0xd9c67b).setStrokeStyle(3,0xffe9a1),this.add.rectangle(12,0,26,6,0xf3dc8b),this.add.rectangle(22,6,5,12,0xf3dc8b)]).setDepth(8);this.keyLabel=this.text(HAUNTED.keyX,HAUNTED.keyY-102,'F / ACTION · ATTIC KEY',15,'#ffe3a3').setOrigin(.5);
  this.text(4460,275,'THE EAST STAIRS →\nKEEP GOING DOWN',18,'#c6e9d5').setAlign('center');
  this.add.rectangle(HAUNTED.exitX,HAUNTED.ground-70,100,140,0x27473f).setStrokeStyle(4,0xb4d4af);this.text(HAUNTED.exitX,HAUNTED.ground-180,'ESCAPE\nF / ACTION',24,'#c9ecca').setOrigin(.5).setAlign('center');
  this.boss=this.add.image(3600,HAUNTED.keyY-60,'clown').setDisplaySize(115,150).setTint(0xf4b6e6).setAlpha(.55).setDepth(7).setVisible(false);
 }
 afterPlayer(){this.carriedKey=this.add.container(0,0,[this.add.circle(-6,0,6,0xf0d587),this.add.rectangle(6,0,15,4,0xf0d587),this.add.rectangle(10,4,4,8,0xf0d587)]).setDepth(11).setVisible(false);}
 objectiveText(){return this.mission.complete?'ESCAPED · The house can keep the security deposit.':this.mission.key?`ATTIC KEY ✓ · Escape via east stairs → ${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)}s · ${this.hits} scares`:this.mission.entered?`Explore four floors · Find the attic key · ${this.mission.checkpoint?'Bell checkpoint ✓':'Ring the landing bell for a checkpoint'}`:'Reach the mansion · F / Action at its front door · Ghosts glow before becoming solid';}
 respawn(){super.respawn();if(this.mission.key){this.mission={...this.mission,escapeStarted:this.elapsedMs};this.boss.setPosition(HAUNTED.keyX-300,HAUNTED.keyY-70);}}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body,result=hauntedAction(this.mission,{x:this.player.x,bottom:body.bottom,action,elapsedMs:this.elapsedMs});this.mission=result.state;
  if(result.event==='enter'){this.entryGate?.destroy();this.player.body!.reset(1930,HAUNTED.ground-24);this.checkpoint={x:1930,bottom:HAUNTED.ground};this.say('Seth: “Lovely place. Terrible doorbell.”  Up the stairs →');}
  if(result.event==='checkpoint'){this.checkpoint={x:3300,bottom:930};gameAudio.play('pickup');this.say('BELL CHECKPOINT. Something upstairs rings back.');}
  if(result.event==='key'){this.checkpoint={x:HAUNTED.keyX-80,bottom:HAUNTED.keyY};this.keyArt.setVisible(false);this.keyLabel.setText('KEY TAKEN · EAST STAIRS →');gameAudio.play('pickup');this.boss.setVisible(true);this.say('THE HOUSE WOKE UP. East stairs → Get out in 90 seconds!');}
  if(result.event==='escape'){this.finish('SETH LEFT THE BUILDING.',`Attic key recovered. Ghostly lease declined.\n${Math.ceil(escapeRemaining(this.mission,this.elapsedMs)/1000)} seconds to spare.`,hauntedScore(this.mission,this.elapsedMs,this.hits));return;}
  const door=!this.mission.entered&&Math.abs(this.player.x-HAUNTED.doorX)<90&&Math.abs(body.bottom-HAUNTED.ground)<25;
  const bell=this.mission.entered&&!this.mission.key&&!this.mission.checkpoint&&Math.abs(this.player.x-3300)<80&&Math.abs(body.bottom-930)<25;
  const key=this.mission.entered&&!this.mission.key&&Math.abs(this.player.x-HAUNTED.keyX)<85&&Math.abs(body.bottom-HAUNTED.keyY)<25;
  const exit=this.mission.key&&Math.abs(this.player.x-HAUNTED.exitX)<85&&Math.abs(body.bottom-HAUNTED.ground)<25;
  if(door||bell||key||exit)this.prompt.setVisible(true).setText(door?'F / Action · Enter haunted mansion':bell?'F / Action · Ring checkpoint bell':key?'F / Action · Take attic key':'F / Action · ESCAPE');
  this.hazards.forEach((h,i)=>{const phase=ghostPhase(this.elapsedMs,i*590);h.active=phase==='solid';h.art.setVisible(phase!=='gone').setAlpha(phase==='solid'?.8:phase==='warning'?.32:.15);h.art.y=h.y+h.height/2+Math.sin(this.elapsedMs/650+i)*12;});
  for(const b of this.books){if(b.phase==='waiting'&&Math.abs(this.player.x-b.x)<115&&Math.abs(body.bottom-b.floor)<65){b.phase='warning';b.at=this.elapsedMs;b.warning.setVisible(true);}
   if(b.phase==='warning'&&this.elapsedMs-b.at>800){b.phase='falling';b.warning.setVisible(false);b.vy=0;}
   if(b.phase==='falling'){b.vy+=900*delta/1000;b.y+=b.vy*delta/1000;if(Math.abs(this.player.x-b.x)<30&&Math.abs(this.player.y-b.y)<38)this.takeHit('The house has very aggressive reading recommendations.');if(b.y>=b.floor-10){b.y=b.floor-10;b.phase='landed';b.at=this.elapsedMs;}}
   if(b.phase==='landed'&&this.elapsedMs-b.at>1600){b.phase='waiting';b.y=b.floor-160;}b.art.setY(b.y).setAngle(b.phase==='falling'?this.elapsedMs/8:0);
  }
  if(this.mission.key){const dx=this.player.x-this.boss.x;this.boss.x+=Math.sign(dx)*Math.min(Math.abs(dx),110*delta/1000);this.boss.y+=(body.bottom-70-this.boss.y)*Math.min(1,delta/240);if(Math.abs(dx)<55&&Math.abs(this.player.y-this.boss.y)<75)this.takeHit('The landlord ghost wants a forwarding address.');if(escapeRemaining(this.mission,this.elapsedMs)<=0){this.hits++;this.respawn();this.say('The escape door slammed. Back to the attic checkpoint — try again!');}}
 }
 drawExtras(){const hand=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.carriedKey.setVisible(this.mission.key).setPosition(hand.x+6,hand.y);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,key:String(this.mission.key),entered:String(this.mission.entered),checkpoint:this.mission.key?'attic':this.mission.checkpoint?'bell':this.mission.entered?'foyer':'street',escapeRemaining:String(Math.round(escapeRemaining(this.mission,this.elapsedMs)))});}
}
