import {levelControlCopy} from './level-control-copy';
import Phaser from 'phaser';
import {gameAudio} from './audio';
import {ControllerInput,keyboardOrControllerMove} from './controller.mjs';
import {touch} from './touch.mjs';
import {scoresOpen,resetScoreEntry} from './scoreboard';
import {openScooterScores,resetScooterScores} from './scooter-scoreboard';
import {brickBuilding} from './scenery';
import {mobileTrackLabel} from './mobile-track.mjs';
import {SCOOTER,ramps,rideObstacles,reactions,newScooterRun,scooterStep,scooterHit,scooterScore} from './scooter-mission.mjs';
const W=1100,H=600;
type Hazard={art:Phaser.GameObjects.Container|Phaser.GameObjects.Image;x:number;y:number;kind:string;radius:number};
export class ScooterRide extends Phaser.Scene{
 constructor(){super({key:'scooter'});}
 player!:Phaser.Physics.Arcade.Sprite;portrait!:Phaser.GameObjects.Image;keys!:Record<string,Phaser.Input.Keyboard.Key>;
 ui!:Phaser.GameObjects.Container;introOverlay?:Phaser.GameObjects.Container;pauseOverlay?:Phaser.GameObjects.Container;
 hud!:Phaser.GameObjects.Text;objective!:Phaser.GameObjects.Text;radioLabel!:Phaser.GameObjects.Text;toast!:Phaser.GameObjects.Text;
 bubble!:Phaser.GameObjects.Container;bubbleText!:Phaser.GameObjects.Text;progress!:Phaser.GameObjects.Rectangle;
 controller=new ControllerInput();run=newScooterRun();hazards:Hazard[]=[];photos=new Set<number>();
 introActive=true;introStarted=false;paused=false;won=false;failed=false;riding=false;renderScale=1;runVersion=0;restartSince:number|null=null;scorePaused=false;bubbleUntil=0;toastUntil=0;
 preload(){for(const [key,path] of [['scooter-riders','scooter/seth-allison-v1.png'],['thai-street','thai/street-backdrop-v1.png'],['thai-props','thai/street-props-v1.png'],['adventure-brick','scenery/brick-facade-v1.png'],['scruffy','scruffy-pedestrian.png'],['clown','clown.png']])if(!this.textures.exists(key))this.load.image(key,'./assets/'+path);}
 text(x:number,y:number,value:string,size=16,color='#f5e4c8'){return this.add.text(x,y,value,{fontFamily:'Arial',fontSize:`${size}px`,color,stroke:'#132436',strokeThickness:3}).setResolution(this.renderScale);}
 screenText(x:number,y:number,value:string,size=16,color='#f5e4c8'){const t=this.text(x,y,value,size,color);this.ui.add(t);return t;}
 create(){
  this.renderScale=(this.game.config.width as number)/W;this.run=newScooterRun();this.controller=new ControllerInput();this.hazards=[];this.photos=new Set();this.runVersion++;
  this.paused=false;this.introActive=true;this.introStarted=false;this.won=false;this.failed=false;this.riding=false;this.scorePaused=false;this.restartSince=null;this.bubbleUntil=0;this.toastUntil=0;
  document.body.dataset.level='scooter';levelControlCopy('scooter');document.getElementById('current-level')!.textContent='Level 3 · Scooter Ride';document.getElementById('game')!.setAttribute('aria-label','Level 3 · Scooter Ride with Seth and Allison');
  const footer=document.querySelector('footer')!;footer.dataset.rooftopHtml??=footer.innerHTML;footer.textContent='AUTO RIDE → · BRAKE A / Left · ACCELERATE D / Right / Shift · HOP W / Up / Space · RISKY RAMP F / Action · PAUSE P · RESTART hold R';
  document.getElementById('next-level')!.hidden=true;touch.clear();resetScoreEntry();resetScooterScores();(document.getElementById('touch-menu') as HTMLDialogElement).close();gameAudio.beginRun();
  this.cameras.main.setBackgroundColor('#202738').setBounds(0,0,SCOOTER.width,1200).setZoom(this.renderScale);
  const frames=this.textures.get('thai-props');for(const [name,x,y,w,h] of [['bus',20,185,697,266],['car-left',726,263,418,192],['bin',1171,204,339,251],['car-right',497,710,550,226]] as [string,number,number,number,number][])if(!frames.has(name))frames.add(name,0,x,y,w,h);
  const riders=this.textures.get('scooter-riders');if(!riders.has('trim'))riders.add('trim',0,380,8,865,1008);
  this.drawCity();
  if(!this.textures.exists('scooter-body')){const g=this.add.graphics().fillStyle(0xffffff).fillRect(0,0,48,90);g.generateTexture('scooter-body',48,90);g.destroy();}
  this.player=this.physics.add.sprite(this.run.x,this.run.y-45,'scooter-body').setVisible(false);const body=this.player.body as Phaser.Physics.Arcade.Body;body.setAllowGravity(false);body.moves=false;
  this.portrait=this.add.image(this.run.x,this.run.y,'scooter-riders','trim').setOrigin(.5,1).setDisplaySize(104,122).setDepth(10);
  this.cameras.main.startFollow(this.player,true,.12,.12,-180,75);
  this.bubbleText=this.text(0,0,'',15,'#172638').setStroke('#fff1cd',0).setWordWrapWidth(260).setPadding(12,8).setBackgroundColor('#fff1cd').setOrigin(.5,1);
  const tail=this.add.triangle(-27,5,0,0,17,0,17,17,0xfff1cd);this.bubble=this.add.container(0,0,[tail,this.bubbleText]).setDepth(14).setVisible(false);
  this.ui=this.add.container((W*this.renderScale-W)/2,(H*this.renderScale-H)/2).setScrollFactor(0).setDepth(20);
  this.ui.add(this.add.rectangle(W/2,43,W,86,0x111f31,.98));this.hud=this.screenText(18,10,'',19);this.objective=this.screenText(18,44,'',15,'#abe3ce');
  this.radioLabel=this.screenText(760,8,'',11,'#ade2d2').setWordWrapWidth(260);
  this.ui.add(this.add.rectangle(18,82,W-36,3,0x3e5365).setOrigin(0,.5));this.progress=this.add.rectangle(18,82,0,3,0xefbf75).setOrigin(0,.5);this.ui.add(this.progress);
  this.toast=this.screenText(W/2,510,'',17,'#ffdaa2').setOrigin(.5).setBackgroundColor('#172b40').setPadding(10,6);
  this.keys=this.input.keyboard!.addKeys('A,D,W,LEFT,RIGHT,UP,SPACE,F,R,S,SHIFT,P') as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard!.enabled=true;this.input.keyboard!.addCapture(['SPACE','UP','DOWN','LEFT','RIGHT']);
  const pause=document.getElementById('pause-toggle') as HTMLButtonElement,restart=document.getElementById('restart-run') as HTMLButtonElement;pause.textContent='Pause · P';pause.setAttribute('aria-pressed','false');pause.disabled=true;restart.disabled=true;
  pause.onclick=()=>{this.togglePause();pause.blur();};restart.onclick=()=>{restart.blur();this.scene.restart();};
  const blur=()=>{touch.clear();for(const k of Object.values(this.keys))k.reset();if(!this.paused)this.togglePause();};const hidden=()=>{if(document.hidden)blur();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  document.getElementById('radio-volume')!.addEventListener('focus',blur);
  this.events.once('shutdown',()=>{this.runVersion++;touch.clear();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);document.getElementById('radio-volume')!.removeEventListener('focus',blur);});
  this.showIntro();this.updateHud();this.publishStatus();
 }
 drawCity(){
  // Reuse the close-building illustration in modular world-space strips.
  const backdrop=this.add.tileSprite(0,0,SCOOTER.width,SCOOTER.ground,'thai-street').setOrigin(0).setTileScale(1).setDepth(-25);backdrop.tilePositionY=1024-SCOOTER.ground;
  this.add.rectangle(SCOOTER.width/2,550,SCOOTER.width,1100,0x19263a,.28).setDepth(-24);
  const g=this.add.graphics().setDepth(-2);g.fillStyle(0x343d4a).fillRect(0,SCOOTER.ground,SCOOTER.width,250);g.fillStyle(0xb9ac92).fillRect(0,SCOOTER.ground,SCOOTER.width,4);
  for(let x=0;x<SCOOTER.width;x+=130)g.fillStyle(0xd8bc74,.7).fillRect(x,SCOOTER.ground+65,60,5);
  for(const o of rideObstacles){if(o.kind==='building')brickBuilding(this,o.x,SCOOTER.ground-o.height,o.width,SCOOTER.ground,3);else this.add.image(o.x+o.width/2,SCOOTER.ground,'thai-props',o.kind).setOrigin(.5,1).setDisplaySize(o.width,o.height).setDepth(1);g.fillStyle(0xb6e7d1).fillRect(o.x,SCOOTER.ground-o.height,o.width,2);}
  for(const r of ramps){
   g.fillStyle(0x795b43).fillTriangle(r.x,SCOOTER.ground,r.end,SCOOTER.ground-r.height,r.end,SCOOTER.ground);
   g.lineStyle(5,r.optional?0xf1b4e0:0xa7e9d1);g.lineBetween(r.x,SCOOTER.ground,r.end,SCOOTER.ground-r.height);
   for(let x=r.x+25;x<r.end;x+=28)g.lineStyle(2,0xdab786).lineBetween(x,SCOOTER.ground,x+18,SCOOTER.ground-(x-r.x)/(r.end-r.x)*r.height);
   this.text(r.x-100,SCOOTER.ground-160,r.name,16,'#ffe0a2').setBackgroundColor('#182e40').setPadding(6,4);
   if(r.optional)this.text(r.x-190,SCOOTER.ground-120,'F / Action: toggle HIGH ramp · +750 sky bonus',14,'#f6c3ea').setBackgroundColor('#182e40').setPadding(5,4);
  }
  this.text(100,SCOOTER.ground-190,'RIDE TOGETHER →',25,'#b9eacb');this.text(120,SCOOTER.ground-152,'Left = brake · Right = accelerate · Jump = hop',15);
  for(const [x,kind] of [[1580,'scruffy'],[3070,'clown'],[5790,'scruffy']] as [number,string][]){const art=this.add.image(x,SCOOTER.ground,kind).setOrigin(.5,1).setDisplaySize(46,85).setDepth(4);this.hazards.push({art,x,y:SCOOTER.ground-42,kind:'person',radius:30});this.text(x-80,SCOOTER.ground-112,'WATCH THE WALKER',12,'#ffd398');}
  for(const [x,y] of [[2810,710],[4110,545],[5250,515],[6830,510]]){
   const bird=this.add.container(x,y,[this.add.arc(-8,0,11,190,350,false,0xd7d1bd),this.add.arc(10,0,11,190,350,false,0xd7d1bd)]).setDepth(5);this.hazards.push({art:bird,x,y,kind:'bird',radius:24});
  }
  const signX=5560,signY=680;g.lineStyle(5,0x5b6876).lineBetween(signX,SCOOTER.ground,signX,signY-65);
  const sign=this.add.container(signX,signY,[this.add.rectangle(0,0,120,42,0x9e604d).setStrokeStyle(3,0xffca7e),this.text(0,0,'LOW SIGN',14).setOrigin(.5)]).setDepth(4);this.hazards.push({art:sign,x:signX,y:signY,kind:'sign',radius:55});
  this.text(5230,485,'✦ HIGH ROUTE +750',18,'#ffd481').setOrigin(.5);
  for(let x=SCOOTER.finish-80;x<SCOOTER.finish+100;x+=20)g.fillStyle(Math.round(x/20)%2?0xf6d9a2:0x172638).fillRect(x,SCOOTER.ground,20,22);
  this.text(SCOOTER.finish-140,SCOOTER.ground-190,'END RIDE · BOTH RIDERS',22,'#b4e8c6');
 }
 showIntro(){
  this.introOverlay=this.add.container(0,0,[this.add.rectangle(W/2,H/2,W,H,0x112235,.96),this.text(W/2,105,'LEVEL 3 · SCOOTER RIDE',36,'#ffce8a').setOrigin(.5),this.add.image(W/2,255,'scooter-riders','trim').setDisplaySize(170,200),this.text(W/2,398,'One scooter. Two riders. Several questionable ramps.\nAuto-forward · Left: brake · Right: accelerate · Jump: hop\nRamps launch automatically. F / Action toggles the optional high ramp.\nAvoid walkers, birds and signs. Finish with Allison’s grip above zero.',19).setOrigin(.5).setAlign('center')]);this.ui.add(this.introOverlay);
  document.getElementById('start-game')!.hidden=false;(document.getElementById('touch-menu-open') as HTMLButtonElement).disabled=false;window.dispatchEvent(new Event('game-layout'));
 }
 async startIntro(){if(this.introStarted||!this.introActive||document.querySelector('dialog[open]'))return;this.introStarted=true;document.getElementById('start-game')!.hidden=true;const version=this.runVersion;try{await gameAudio.playIntro();}catch{}if(version!==this.runVersion||!this.sys.isActive())return;this.introActive=false;this.introOverlay?.destroy();touch.clear();for(const k of Object.values(this.keys))k.reset();gameAudio.music.startRun();for(const id of ['pause-toggle','restart-run','touch-menu-open'])(document.getElementById(id) as HTMLButtonElement).disabled=false;this.say(reactions.start);if(document.hidden||!document.hasFocus())this.togglePause();}
 say(line:string){this.bubbleText.setText('Allison: “'+line+'”');this.bubble.setVisible(true);this.bubbleUntil=this.run.elapsedMs+4600;}
 notice(line:string){this.toast.setText(line).setVisible(true);this.toastUntil=this.run.elapsedMs+3200;}
 refreshControlCopy(){if(this.radioLabel)this.radioLabel.setText(touch.enabled?`SETH FM · ${mobileTrackLabel(gameAudio.music)}\nMenu: music / restart · Left: brake · Action: high ramp`:'AUTO-FORWARD · Left: brake · Right: accelerate\nJump: hop · F: optional high ramp');}
 togglePause(){if(this.introActive||this.won||this.failed||scoresOpen())return;this.paused=!this.paused;touch.clear();this.controller.armed=false;for(const k of Object.values(this.keys))k.reset();void gameAudio.setPaused(this.paused);const b=document.getElementById('pause-toggle')!;b.textContent=this.paused?'Resume · P':'Pause · P';b.setAttribute('aria-pressed',String(this.paused));if(this.paused){this.pauseOverlay=this.add.container(0,0,[this.add.rectangle(W/2,H/2,W,H,0x102137,.94),this.text(W/2,280,'PARKED. MIRACULOUSLY.',36,'#ffd08b').setOrigin(.5)]);this.ui.add(this.pauseOverlay);}else{this.pauseOverlay?.destroy();this.pauseOverlay=undefined;}this.publishStatus();}
 endRun(){
  if(this.won||this.failed)return;this.won=this.run.won;this.failed=this.run.failed;this.updateHud();gameAudio.music.finishRun(this.won?'success':'failure');if(this.won)gameAudio.play('win');(document.getElementById('pause-toggle') as HTMLButtonElement).disabled=true;
  this.bubble.setVisible(false);this.toast.setVisible(false);
  const score=scooterScore(this.run),line=this.won?reactions.finish:reactions.fail;
  this.ui.add(this.add.container(0,0,[this.add.rectangle(W/2,H/2,960,400,0x12263b,.98).setStrokeStyle(2,0xa7e6cb),this.text(W/2,175,this.won?'TWO RIDERS. ONE SURVIVOR OF A SCOOTER.':(this.run.grip<=0?'ALLISON HAS LEFT THE SCOOTER.':'RENTAL EXPIRED. WALK OF SHAME.'),28,'#ffd08b').setOrigin(.5),this.text(W/2,290,this.won?`SCORE ${score.toLocaleString()} · Grip ${this.run.grip}%\n${this.run.jumps} jumps · ${this.run.hits} bumps · ${(this.run.elapsedMs/1000).toFixed(1)}s\n\nAllison: “${line}”`:`${line}\n\nGrip reached zero or the rental expired.\nRestart to ride together again.`,21).setOrigin(.5).setAlign('center').setWordWrapWidth(870),this.text(W/2,455,touch.enabled?'Menu → Restart / Choose Level':'Hold R to restart · Choose Level to replay',17,'#b2e6d0').setOrigin(.5)]));
  if(this.won)openScooterScores({score,grip:this.run.grip,hits:this.run.hits,elapsedMs:Math.round(this.run.elapsedMs)});
 }
 updateHud(){this.hud.setText(`LEVEL 3 · SCOOTER RIDE   Allison’s grip ${this.run.grip}%`);this.objective.setText(`${Math.min(100,Math.round(this.run.x/SCOOTER.finish*100))}% of route · ${this.run.jumps} jumps · ${this.run.hits} bumps · High ramp ${this.run.risky?'ON':'OFF'} · Bonus ${this.run.bonus}`);this.progress.setSize((W-36)*Math.min(1,this.run.x/SCOOTER.finish),3);this.refreshControlCopy();}
 publishStatus(){const live=document.getElementById('live-status');if(!live)return;Object.assign(live.dataset,{level:'scooter',intro:String(this.introActive),paused:String(this.paused),won:String(this.won),failed:String(this.failed),riding:String(!this.failed),x:String(Math.round(this.run.x)),y:String(Math.round(this.run.y)),elapsed:String(Math.round(this.run.elapsedMs)),grip:String(this.run.grip),hits:String(this.run.hits),jumps:String(this.run.jumps),grounded:String(this.run.grounded),speed:String(Math.round(this.run.vx)),biggest:String(Math.round(this.run.biggest)),bonus:String(this.run.bonus),risky:String(this.run.risky),muted:String(gameAudio.muted),reaction:this.bubbleText?.text??''});live.textContent=`Scooter Ride. ${this.hud?.text??''}. ${this.objective?.text??''}. ${this.paused?'Paused.':this.won?'Ride complete.':this.failed?'Ride failed.':this.introActive?'Select Start Game.':this.bubble.visible?this.bubbleText.text:''}`;}
 update(time:number,delta:number){
  if(!this.player)return;const dialog=!!document.querySelector('dialog[open]'),focus=document.hasFocus()&&!dialog&&document.activeElement?.id!=='radio-volume';let pads:readonly(Gamepad|null)[]=[];try{pads=navigator.getGamepads?.()??[];}catch{}
  const c=this.controller.sample(Array.from(pads),focus),m=touch.sample(dialog||document.hidden);gameAudio.music.setHold('scores',scoresOpen());
  if(c.disconnected&&!this.paused)this.togglePause();if(Phaser.Input.Keyboard.JustDown(this.keys.P)||c.pause||m.pause)this.togglePause();if(Phaser.Input.Keyboard.JustDown(this.keys.S))gameAudio.toggle();
  if(this.paused||dialog){this.publishStatus();return;}
  if(this.introActive){if(c.jump||c.interact||m.jump||m.interact)void this.startIntro();this.publishStatus();return;}
  if(this.keys.R.isDown||m.restart){this.restartSince??=time;if(time-this.restartSince>=650){this.scene.restart();return;}}else this.restartSince=null;
  if(this.won||this.failed){this.publishStatus();return;}
  const action=Phaser.Input.Keyboard.JustDown(this.keys.F)||c.interact||m.interact;if(action){this.run.risky=!this.run.risky;this.notice(this.run.risky?'HIGH RAMP ARMED · Optional sky bonus +750':'LOWER RAMP · Easier landing');if(this.run.risky)this.say(reactions.risk);}
  const move=keyboardOrControllerMove(this.keys.A.isDown||this.keys.LEFT.isDown,this.keys.D.isDown||this.keys.RIGHT.isDown,c.move||m.move);
  const next=scooterStep(this.run,{move,boost:this.keys.SHIFT.isDown||c.sprint||m.sprint,jump:c.jump||m.jump||['W','UP','SPACE'].some(k=>Phaser.Input.Keyboard.JustDown(this.keys[k]))},delta);this.run=next.state;
  for(const event of next.events){if(event.type==='ramp'){this.say(event.risky?reactions.risk:reactions.ramps[event.index!]);this.notice(`${ramps[event.index!].name} · AIRBORNE`);gameAudio.play('jump');}else if(event.type==='hop')gameAudio.play('jump');else if(event.type==='hit'||event.type==='hard'){this.say(event.type==='hard'?reactions.landing:reactions.hit[this.run.hits%3]);gameAudio.play('impact');this.cameras.main.shake(110,.002);}else if(event.type==='bonus'){this.say('We are not getting the security deposit back.');this.notice('SKY ROUTE · +750');gameAudio.play('pickup');}}
  for(const h of this.hazards){const t=this.run.elapsedMs/1000;h.art.x=h.x+(h.kind==='person'?Math.sin(t*1.1)*65:h.kind==='bird'?Math.sin(t*1.7)*65:0);h.art.y=h.y+(h.kind==='bird'?Math.sin(t*2.1+h.x)*24:0)+(h.kind==='person'?42:0);const hx=h.art.x,hy=h.kind==='person'?h.art.y-42:h.art.y;if(Math.abs(this.run.x-hx)<h.radius+25&&Math.abs(this.run.y-55-hy)<(h.kind==='bird'?37:58)){const hit=scooterHit(this.run);if(hit.hits>this.run.hits){this.say(reactions.hit[hit.hits%3]);gameAudio.play('impact');this.cameras.main.shake(100,.002);}this.run=hit;}}
  this.cameras.main.followOffset.y=this.run.grounded?75:-35;
  this.player.setPosition(this.run.x,this.run.y-45);(this.player.body as Phaser.Physics.Arcade.Body).reset(this.player.x,this.player.y);
  this.portrait.setPosition(this.run.x,this.run.y).setAngle(this.run.grounded?0:Phaser.Math.Clamp(this.run.vy/45,-17,18)).setAlpha(this.run.immuneMs>0?(Math.floor(time/110)%2?.45:1):1);
  this.bubble.setPosition(this.run.x+65,this.run.y-154).setVisible(this.run.elapsedMs<this.bubbleUntil);this.toast.setVisible(this.run.elapsedMs<this.toastUntil);
  this.updateHud();if(this.run.won||this.run.failed)this.endRun();this.publishStatus();
 }
}
