import {loadCast,castPerson} from './cast';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {CONCERT,concertStairs,newConcertRun,concertAction,photoWindow,photoBlocked,shotNames,concertScore} from './concert-mission.mjs';
import {gameAudio} from './audio';
export class ConcertChaos extends FootAdventure{
 constructor(){super({key:'concert',number:4,title:'Concert Chaos',...CONCERT,startY:CONCERT.ground,instructions:'Get inside → climb the arena stairs → F / Action at press check-in.\nBring your credentials down to the photo pit.\nRun, jump and dodge the crowd. At the pit, time three F / Action shots.\nThe press desk is a checkpoint. Missing a shot lets you try again.'});}
 mission=newConcertRun();pass!:Phaser.GameObjects.Container;stage!:Phaser.GameObjects.Image;gate?:Phaser.GameObjects.Rectangle;photoUi?:Phaser.GameObjects.Container;photoCue?:Phaser.GameObjects.Text;photoBar?:Phaser.GameObjects.Rectangle;photoFrame?:Phaser.GameObjects.Graphics;photoHead?:Phaser.GameObjects.Arc;photoMs=0;signSeen=false;
 preload(){super.preload();loadCast(this,'concert');if(!this.textures.exists('concert-stage'))this.load.image('concert-stage','./assets/concert/stage-v1.png');}
 resetMission(){this.mission=newConcertRun();this.photoMs=0;this.signSeen=false;this.photoUi=undefined;}
 buildWorld(){
  const g=this.add.graphics().setDepth(-20);g.fillStyle(0x142031).fillRect(0,0,CONCERT.width,CONCERT.height);g.fillStyle(0x303342).fillRect(1250,0,CONCERT.width-1250,CONCERT.height);
  const street=this.add.tileSprite(0,CONCERT.ground-600,1250,600,'thai-street').setOrigin(0).setTileScale(.7).setDepth(-18);street.tilePositionY=1024-600/.7;
  this.platform(0,CONCERT.ground,CONCERT.width,180,0x353d49);
  for(let x=20;x<1200;x+=135)g.fillStyle(0xd6ba79).fillRect(x,CONCERT.ground+55,64,4);
  for(const x of [470,820]){this.platform(x,CONCERT.ground-52,95,52,0x45515a).setFillStyle(0x45515a,.12);const metal=this.add.graphics().setDepth(3);metal.lineStyle(3,0xa2aeb0).strokeRect(x,CONCERT.ground-52,95,48);for(let n=0;n<9;n++)metal.lineStyle(1,0x6b8088).lineBetween(x+n*10,CONCERT.ground-48,x+Math.min(95,n*10+30),CONCERT.ground-10);metal.lineStyle(4,0x8b9b9c).lineBetween(x+5,CONCERT.ground-52,x+5,CONCERT.ground).lineBetween(x+90,CONCERT.ground-52,x+90,CONCERT.ground);metal.lineBetween(x-8,CONCERT.ground,x+18,CONCERT.ground).lineBetween(x+78,CONCERT.ground,x+102,CONCERT.ground);}
  this.concertgoer(600,CONCERT.ground,1,35,2900);
  this.concertgoer(710,CONCERT.ground,3,30,3100);
  this.concertgoer(1030,CONCERT.ground,0,100,2800);this.text(950,CONCERT.ground-115,'SCALPER: “PHOTO PASS? I KNOW A GUY.”',12,'#ffd18b');
  g.fillStyle(0x202c40).fillRect(1180,530,155,600);this.text(1240,700,'ARENA\nENTRANCE →',24,'#bbecdc').setOrigin(.5).setAlign('center');
  // Reusable seat rows and horizontal rail sections behind distinct collision treads.
  for(let x=1400;x<4900;x+=150)for(let y=150;y<1080;y+=100){g.fillStyle((Math.round(x/150)+Math.round(y/100))%2?0x633c54:0x50394c).fillRoundedRect(x,y,105,36,7);g.fillStyle(0x252938).fillRect(x+14,y+35,75,24);}
  for(const [i,s] of concertStairs.entries()){
   const column=this.platform(s.x,s.y,s.width,CONCERT.ground-s.y+20,i<10?0x4f5960:0x55505f);
   const face=this.add.graphics().setDepth(2);face.lineStyle(1,0x333a43);for(let y=s.y+14;y<CONCERT.ground;y+=30)face.lineBetween(s.x,y,s.x+s.width,y);face.lineStyle(3,0x9aa7a8).lineBetween(s.x,s.y-46,s.x+s.width,s.y-46);face.lineBetween(s.x+16,s.y-46,s.x+16,s.y);
   if(i%2===1&&i!==9)this.concertgoer(s.x+100,s.y,i%4,32,2600+i*65);

  }
  this.platform(3270,330,80,CONCERT.ground-330+20,0x4f5960);
  this.platform(3318,370,30,CONCERT.ground-370,0x424954);
  this.text(1590,820,'PRESS CHECK-IN ↑\nYES, ALL THE WAY UP',19,'#ffe0a2').setAlign('center');
  this.gate=this.platform(3280,200,28,CONCERT.ground-200,0x536077);this.text(3294,535,'PASS\nREQUIRED',16,'#ffda9d').setOrigin(.5).setAlign('center');
  this.text(2980,100,'PRESS CHECK-IN — LOWER LEVEL',18,'#ffcf87').setBackgroundColor('#293d4b').setPadding(10,5);
  this.text(3020,142,'← Just kidding. Desk is right here.',15,'#a8e6cc');
  this.add.rectangle(CONCERT.deskX,CONCERT.deskY-20,130,40,0x745445).setDepth(4);this.add.image(CONCERT.deskX+25,CONCERT.deskY,'scruffy').setOrigin(.5,1).setDisplaySize(56,80).setDepth(3);
  this.text(CONCERT.deskX-45,CONCERT.deskY-100,'PRESS DESK\nF / ACTION',14,'#ffe0a2').setAlign('center');
  this.text(3650,285,'CREDENTIALS SECURED?\nDOWN TO THE PIT →',18,'#abe9d1');
  this.stage=this.add.image(6550,CONCERT.ground,'concert-stage').setOrigin(.5,1).setDisplaySize(1500,1000).setDepth(-12);
  for(const [i,x] of [5100,5400,5720,6050,6350].entries())this.concertgoer(x,CONCERT.ground,i%4,65,1800+i*100);
  for(const x of [5200,6100])this.hazard('scruffy',x,CONCERT.ground-31,35,2800,28,62).setDisplaySize(50,78);
  // Reused existing fan pair stays upright at adult scale, behind the active crowd.
  for(const x of [5500,5860])this.add.image(x,CONCERT.ground,'concert-fans').setOrigin(.5,1).setDisplaySize(95,78).setDepth(3);
  this.platform(6520,CONCERT.ground-58,35,58,0x77828e);this.text(6600,CONCERT.ground-150,'PHOTO PIT →\nF / ACTION',21,'#c1f1dc');
 }
 concertgoer(x:number,bottom:number,index:number,range=35,period=2600){const art=castPerson(this,'concert',index,x,bottom,78).setDepth(6);this.hazards.push({art,kind:'concert-person',x,y:bottom-31,range,period,width:28,height:62});return art;}
 afterPlayer(){
  this.pass=this.add.container(0,0,[this.add.line(0,0,-8,-28,0,-12,0xe4b578).setLineWidth(2),this.add.rectangle(0,-8,15,20,0xf0d99e).setStrokeStyle(2,0x3c465d),this.text(0,-9,'P',10,'#25323b').setOrigin(.5)]).setDepth(11).setVisible(false);}
 objectiveText(){if(this.mission.complete)return 'PHOTO PIT · 3/3 photographs saved · SETH GOT THE SHOT!';return this.mission.phase==='photo'?`PHOTO PIT · ${this.mission.shots}/3 shots · ${this.mission.misses} misses · F / Action when READY`:this.mission.credentials?`PRESS PASS ✓ · Descend and head right to the photo pit · ${this.hits} mishaps`:'Find the arena entrance, then climb to the upper press desk · F / Action';}
 motionHeld(){return this.mission.phase==='photo'||this.mission.complete;}
 beginPhoto(){
  this.photoMs=0;this.player.setVelocity(0,0);(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  this.photoUi=this.add.container(0,0,[this.add.rectangle(550,330,1100,490,0x0c1723),this.add.image(550,322,'concert-stage').setDisplaySize(850,475)]);this.ui.add(this.photoUi);
  this.photoFrame=this.add.graphics();this.photoUi.add(this.photoFrame);this.photoHead=this.add.circle(550,400,90,0x131821).setVisible(false);this.photoUi.add(this.photoHead);
  this.photoCue=this.text(550,120,'',19).setOrigin(.5).setBackgroundColor('#14263b').setPadding(8,5);this.photoUi.add(this.photoCue);
  this.photoBar=this.add.rectangle(330,560,0,7,0xf0c37a).setOrigin(0,.5);this.photoUi.add(this.photoBar);this.photoUi.add(this.text(550,520,'F / Action · Take the highlighted shot when READY',17,'#ffe2a1').setOrigin(.5));this.toast.setDepth(50);this.say('Three shots. One button. Please keep your head down, front row.');
 }
 tick(delta:number,action:boolean){
  if(this.mission.phase==='photo')this.photoMs+=delta;
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  const atDesk=!this.mission.credentials&&Math.abs(this.player.x-CONCERT.deskX)<85&&Math.abs(body.bottom-CONCERT.deskY)<25;
  const atPit=this.mission.credentials&&this.mission.phase==='floor'&&this.player.x>=CONCERT.pitX-70;
  if(atDesk||atPit)this.prompt.setVisible(true).setText(atDesk?'F / Action · Collect photo credentials · Checkpoint':'F / Action · Enter photo pit');
  if(!this.signSeen&&this.player.x>2840&&body.bottom<550){this.signSeen=true;this.say('Seth: “Lower level?!”  Attendant: “Relax. That sign is from last tour.”');}
  const result=concertAction(this.mission,{x:this.player.x,bottom:body.bottom,action,photoMs:this.photoMs});this.mission=result.state;
  if(result.event==='pass'){this.checkpoint={x:CONCERT.deskX-60,bottom:CONCERT.deskY};this.gate?.destroy();this.say('Attendant: “Try not to photograph your thumb.”  PRESS PASS + CHECKPOINT');gameAudio.playLocation('press-pass');}
  if(result.event==='floor')this.say('Main floor! Jump the crowd surges; the photo pit is ahead →');
  if(result.event==='pit'){this.beginPhoto();for(const h of this.hazards)h.active=false;}
  if(result.event==='shot'){gameAudio.play('photo');this.cameras.main.flash(110,255,255,240);this.say(`SHOT ${this.mission.shots}/3 SAVED. Next: ${shotNames[this.mission.shots]}`);}
  if(result.event==='head'||result.event==='blur'){gameAudio.play('miss');this.say(result.event==='head'?'Perfect portrait of somebody’s head. Wait for a clear view.':'Too early! Wait for READY, then press F / Action.');}
  if(result.event==='complete'){gameAudio.play('photo');this.photoUi?.destroy();this.finish('SETH GOT THE SHOT!',`Singer ✓   Guitarist ✓   Whole band ✓\n${this.mission.misses} missed shots · Credentials still attached.`,concertScore(this.mission,this.elapsedMs,this.hits));}
 }
 drawExtras(){
  this.pass.setVisible(this.mission.credentials).setPosition(this.player.x+this.facing*4,(this.player.body as Phaser.Physics.Arcade.Body).bottom-30);
  if(this.mission.phase==='photo'&&this.photoCue&&this.photoFrame){const ready=photoWindow(this.photoMs)&&!photoBlocked(this.photoMs);this.photoCue.setText(`${this.mission.shots+1}/3 · ${shotNames[this.mission.shots]} · ${ready?'READY — SHOOT!':photoBlocked(this.photoMs)?'HEAD IN THE WAY':'WAIT FOR THE MOMENT'}`).setColor(ready?'#adf4c9':'#ffdaa2');this.photoHead?.setVisible(photoBlocked(this.photoMs));this.photoBar?.setSize((this.photoMs%4000)/4000*440,7).setFillStyle(ready?0xace8c7:0xe5b773);this.photoFrame.clear().lineStyle(4,ready?0xb3f1ca:0xf2c77d);const shot=this.mission.shots;this.photoFrame.strokeRect(shot===0?230:shot===1?685:145,shot<2?240:175,shot<2?190:810,shot<2?235:300);}
 }
 publishStatus(){super.publishStatus({phase:this.mission.phase,credentials:String(this.mission.credentials),shots:String(this.mission.shots),misses:String(this.mission.misses),photoMs:String(Math.round(this.photoMs)),photoReady:String(photoWindow(this.photoMs)&&!photoBlocked(this.photoMs))});}
}
