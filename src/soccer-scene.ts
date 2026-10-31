import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {SOCCER,soccerShots,newSoccerRun,soccerAction,soccerPhotoReady,soccerScore} from './soccer-mission.mjs';
import {gameAudio} from './audio';
export class SoccerHijinx extends FootAdventure{
 constructor(){super({key:'soccer',number:11,title:'Soccer Game Hijinx',...SOCCER,instructions:'A Minnesota United Loons match. Allison is saving your season-ticket seat.\nUp the stands → food / bathroom concourse → down to the locker corridor.\nPhotograph the locker-room players, the team in the tunnel, then TWO big goals.\nF / Action at each marked camera position when READY. Missed moments always repeat.'});}
 mission=newSoccerRun();photoMs=0;photoCue!:Phaser.GameObjects.Text;photoBar!:Phaser.GameObjects.Rectangle;lockerGate?:Phaser.GameObjects.Rectangle;tunnelGate?:Phaser.GameObjects.Rectangle;ball!:Phaser.GameObjects.Container;team:Phaser.GameObjects.Image[]=[];goalPlayers:Phaser.GameObjects.Image[]=[];station=0;enteredConcourse=false;
 preload(){super.preload();if(!this.textures.exists('soccer-star'))this.load.image('soccer-star','./assets/soccer-star.png');}
 resetMission(){this.mission=newSoccerRun();this.photoMs=0;this.station=0;this.team=[];this.goalPlayers=[];this.enteredConcourse=false;}
 oneWay(x:number,y:number,w:number){const p=this.platform(x,y,w,20,0x6b8183);const b=p.body as Phaser.Physics.Arcade.StaticBody;b.checkCollision.left=false;b.checkCollision.right=false;b.checkCollision.down=false;return p;}
 placard(x:number,y:number,copy:string){this.add.rectangle(x,y,330,60,0x244751).setStrokeStyle(2,0x9ccbc4).setDepth(-3);this.text(x,y,copy,19,'#d7eee0').setOrigin(.5).setAlign('center').setDepth(-2);}
 buildWorld(){
  const g=this.add.graphics().setDepth(-20);g.fillStyle(0x152d3f).fillRect(0,0,SOCCER.width,1400);
  g.fillStyle(0x315143).fillRect(0,960,SOCCER.width,440);g.fillStyle(0x566466).fillRect(1400,200,4500,960);
  // Repeated seat rows are decorative. Only clearly marked cream treads carry bodies.
  for(let x=0;x<1500;x+=96)for(let y=440;y<1000;y+=78){g.fillStyle((x/96)%2?0x3e7788:0x326475).fillRoundedRect(x,y,65,30,7);g.fillStyle(0x243d4b).fillRect(x+10,y+30,46,23);}
  this.platform(0,900,460,28,0x64797d);this.add.image(300,900,'allison').setOrigin(.5,1).setDisplaySize(58,85).setDepth(6);this.text(270,765,'“Our seats are HERE, Seth!”',17,'#ffdfa0').setOrigin(.5);
  for(let i=0;i<6;i++)this.oneWay(440+i*160,860-i*40,185);
  this.platform(1400,660,1670,22,0x657779);this.platform(1380,680,25,480,0x53676a); // Blocks the under-stands shortcut.
  this.placard(1800,480,'CONCOURSE · FOOD →');this.placard(2670,480,'BATHROOMS / LOCKERS →');
  for(const [x,label,color] of [[1760,'HOT FOOD',0xa1714d],[2200,'SNACKS',0xa18a4b],[2680,'RESTROOMS',0x417b88]] as const){g.fillStyle(0x253c46).fillRect(x-160,515,320,145);g.fillStyle(color).fillRect(x-160,515,320,30);this.text(x,526,label,17,'#fff0c7').setOrigin(.5);g.fillStyle(0xb6baa1).fillRect(x-160,620,320,16);}
  for(let i=0;i<6;i++)this.oneWay(3020+i*145,740+i*80,180);
  this.platform(3800,1160,4300,200,0x3c6551);this.platform(0,1160,3800,200,0x38464c);
  for(const x of [4000,4150,4300,4450,4600,4750]){g.fillStyle(0x2f5363).fillRoundedRect(x,850,125,240,4);g.lineStyle(2,0x91b3b1).strokeRect(x+5,855,115,230);g.lineStyle(3,0x182f3b).lineBetween(x+15,885,x+105,885).lineBetween(x+15,895,x+105,895);}
  this.placard(4360,900,'LOCKER ROOM · PHOTO 1');
  for(const [i,x] of [4160,4360,4580].entries())this.add.image(x,1160,'soccer-star').setOrigin(.5,1).setDisplaySize(65,96).setFlipX(i%2===1).setDepth(3);
  this.lockerGate=this.platform(4970,650,22,510,0x3f7884);this.text(4980,900,'LOCKER\nPHOTO\nFIRST',17,'#d7eac9').setOrigin(.5).setAlign('center');
  g.fillStyle(0x1a2e38).fillRect(5100,780,830,380);g.lineStyle(13,0x748a89).strokeRect(5110,780,810,380);this.placard(5530,900,'TUNNEL · PHOTO 2');
  for(let i=0;i<5;i++)this.team.push(this.add.image(5300+i*105,1160,'soccer-star').setOrigin(.5,1).setDisplaySize(57,85).setDepth(3));
  this.tunnelGate=this.platform(6020,600,22,560,0x375e66);this.text(6030,900,'TUNNEL\nPHOTO\nFIRST',17,'#d7eac9').setOrigin(.5).setAlign('center');
  // Stadium field, audience and roof use small repeated shapes, never a world-sized texture.
  g.fillStyle(0x203d46).fillRect(6120,690,1980,210);for(let x=6150;x<8100;x+=55)for(let y=725;y<900;y+=38)g.fillStyle((x+y)%3?0x6092a0:0xc0b785).fillCircle(x,y,6);
  g.lineStyle(12,0x7e9698).lineBetween(6100,690,8100,690);for(let x=6200;x<8100;x+=260)g.lineStyle(4,0x71838d).lineBetween(x,690,x+100,590);
  g.fillStyle(0x437a56).fillRect(6150,900,1950,260);for(let x=6150;x<8100;x+=180)g.fillStyle(0x528a60,.6).fillRect(x,900,90,260);
  g.lineStyle(4,0xc6dfc0).strokeRect(6210,930,1830,220).strokeRect(7680,970,320,160);g.lineBetween(6900,930,6900,1150);g.strokeEllipse(6900,1040,160,150);
  // Goal and net sit behind players and ball; floor collision stays at ground.
  g.lineStyle(5,0xe9e5cf).strokeRect(7820,950,150,200);for(let x=7840;x<7970;x+=22)g.lineStyle(1,0xb9d0c3,.6).lineBetween(x,954,x,1150);for(let y=973;y<1150;y+=24)g.lineBetween(7820,y,7970,y);
  this.placard(7000,900,'SIDELINE · PHOTOS 3 & 4');
  for(const [i,x] of [7240,7410,7610,7840].entries())this.goalPlayers.push(this.add.image(x,1160,'soccer-star').setOrigin(.5,1).setDisplaySize(59,88).setFlipX(i%2===1).setTint(i%2?0xe0c494:0xb4e4ed).setDepth(3));
  const b=this.add.graphics().fillStyle(0xeee9d7).fillCircle(0,0,12).lineStyle(2,0x263e45).strokeCircle(0,0,12);b.fillStyle(0x263e45).fillTriangle(-5,-5,5,-5,0,4);this.ball=this.add.container(0,0,[b]).setDepth(5);
  for(const [i,x] of [690,1110,1930,2490,3340,3870].entries())this.hazard(i%2?'clown':'concert-fans',x,x<1400?840-Math.floor((x-440)/160)*40:x<3020?625:x<3800?900:1125,32,2600+i*100,30,64);
  for(const target of [soccerShots[0],soccerShots[1],soccerShots[2]]){this.add.rectangle(target.x,1154,105,8,0xe4c68b).setDepth(3);this.text(target.x,1050,'CAMERA POSITION\nF / ACTION',14,'#ffe2a6').setOrigin(.5).setAlign('center');}
 }
 create(){super.create();this.photoCue=this.screenText(550,133,'',20,'#ffe3aa').setOrigin(.5).setBackgroundColor('#143040').setPadding(12,8).setVisible(false);this.photoBar=this.add.rectangle(350,164,0,6,0xbbe8c9).setOrigin(0,.5);this.ui.add(this.photoBar);this.photoBar.setVisible(false);}
 objectiveText(){return this.mission.complete?'FOUR SHOTS SAVED · Allison still has your seat.':`${this.mission.shots}/4 PHOTOS · ${soccerShots[this.mission.shots].name} ${this.mission.shots<2?'→':'· SIDELINE →'} · ${this.mission.misses} missed moments` ;}
 tick(delta:number,action:boolean){
  this.photoMs+=delta;const body=this.player.body as Phaser.Physics.Arcade.Body,target=soccerShots[this.mission.shots];if(!target)return;
  if(!this.enteredConcourse&&this.player.x>1450&&body.bottom<700){this.enteredConcourse=true;this.checkpoint={x:1510,bottom:660};this.say('Concourse checkpoint. Seth: “Bathroom? Somehow I found the locker room.”');}
  const at=Math.abs(this.player.x-target.x)<95&&Math.abs(body.bottom-target.bottom)<26;
  const ready=soccerPhotoReady(this.photoMs,this.mission.shots);this.photoCue.setVisible(at);this.photoBar.setVisible(at);
  if(at){this.prompt.setVisible(true).setText('F / Action · Photograph when READY');this.photoCue.setText(`${this.mission.shots+1}/4 · ${target.name}\n${ready?'READY — SHOOT!':'WAIT · THE MOMENT WILL REPEAT'}`).setColor(ready?'#b8f1ca':'#ffe3aa');const cycle=this.mission.shots<2?3600:4600;this.photoBar.setSize((this.photoMs%cycle)/cycle*400,6);}
  const result=soccerAction(this.mission,{x:this.player.x,bottom:body.bottom,action,photoMs:this.photoMs});this.mission=result.state;
  if(result.event==='miss'){gameAudio.play('miss');this.say('That is a very sharp photo of nothing happening. Wait for READY and try again.');}
  if(result.event==='shot'||result.event==='complete'){gameAudio.play('photo');this.cameras.main.flash(100,240,255,255);this.photoMs=0;this.say(`PHOTO ${this.mission.shots}/4 SAVED · ${this.mission.shots<4?soccerShots[this.mission.shots].name+' →':'Allison: “Did you see the goals?”'}`);if(this.mission.shots===1){this.lockerGate?.destroy();this.checkpoint={x:5110,bottom:1160};}if(this.mission.shots===2){this.tunnelGate?.destroy();this.checkpoint={x:6250,bottom:1160};}if(this.mission.complete){this.photoCue.setVisible(false);this.photoBar.setVisible(false);this.finish('SETH GOT ALL FOUR SHOTS!', 'Locker-room players ✓   Team tunnel entrance ✓\nFirst goal ✓   Second goal ✓\nAllison: “You missed the entire match from your seat.”',soccerScore(this.mission,this.elapsedMs,this.hits));}}
  const phase=(this.photoMs%3600)/3600;this.team.forEach((p,i)=>p.setX(5240+i*100+phase*380).setY(1160-Math.abs(Math.sin(phase*Math.PI*16+i))*5));
  const kick=(this.photoMs%4600)/4600;this.ball.setPosition(7310+Math.min(1,Math.max(0,(kick-.18)/.26))*550,1140-Math.sin(Math.min(1,Math.max(0,(kick-.18)/.26))*Math.PI)*150);this.goalPlayers.forEach((p,i)=>p.setX(7240+i*190+Math.sin(kick*Math.PI*2+i)*24));
 }
 publishStatus(){super.publishStatus({phase:this.mission.complete?'complete':this.mission.shots===0?'locker':this.mission.shots===1?'tunnel':'goals',shots:String(this.mission.shots),misses:String(this.mission.misses),photoReady:String(soccerPhotoReady(this.photoMs,this.mission.shots)),photoMs:String(Math.round(this.photoMs))});}
}
