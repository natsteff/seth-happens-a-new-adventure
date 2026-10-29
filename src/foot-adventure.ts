import Phaser from 'phaser';
import {gameAudio} from './audio';
import {touch} from './touch.mjs';
import {ControllerInput,keyboardOrControllerMove} from './controller.mjs';
import {scoresOpen,resetScoreEntry} from './scoreboard';
import {resetAdventureScores,openAdventureScores} from './adventure-scoreboard';
import {walkLayout,fallLayout} from './art-layout';
import {megaJumpVelocity} from './mission.mjs';
import {mobileTrackLabel} from './mobile-track.mjs';
import {levelControlCopy} from './level-control-copy';
export type AdventureConfig={key:string;number:number;title:string;width:number;height:number;ground:number;startX:number;startY:number;instructions:string};
type Hazard={art:Phaser.GameObjects.Image;kind:string;x:number;y:number;range:number;period:number;width:number;height:number;active?:boolean};
const W=1100,H=600;
// Shared only by the new on-foot adventures. Earlier released scenes retain their behavior.
export abstract class FootAdventure extends Phaser.Scene{
 constructor(public config:AdventureConfig){super({key:config.key});}
 player!:Phaser.Physics.Arcade.Sprite;portrait!:Phaser.GameObjects.Sprite;keys!:Record<string,Phaser.Input.Keyboard.Key>;platforms!:Phaser.Physics.Arcade.StaticGroup;
 ui!:Phaser.GameObjects.Container;hud!:Phaser.GameObjects.Text;objective!:Phaser.GameObjects.Text;radioLabel!:Phaser.GameObjects.Text;toast!:Phaser.GameObjects.Text;prompt!:Phaser.GameObjects.Text;
 introOverlay?:Phaser.GameObjects.Container;pauseOverlay?:Phaser.GameObjects.Container;hazards:Hazard[]=[];controller=new ControllerInput();photos=new Set<number>();
 elapsedMs=0;introActive=true;introStarted=false;paused=false;won=false;failed=false;riding=false;renderScale=1;runVersion=0;hits=0;stamina=100;immuneMs=0;restartSince:number|null=null;facing=1;lastGround=-1000;jumpUntil=0;jumpStarted=-1;megaUsed=false;toastUntil=0;checkpoint={x:160,bottom:1130};
 preload(){
  for(const [key,path] of [['adventure-logo','adventure-logo.png'],['thai-street','thai/street-backdrop-v1.png'],['thai-props','thai/street-props-v1.png'],['adventure-brick','scenery/brick-facade-v1.png'],['scruffy','scruffy-pedestrian.png'],['clown','clown.png'],['allison','allison.png'],['concert-fans','concert-fans.png']])if(!this.textures.exists(key))this.load.image(key,'./assets/'+path);
  if(!this.textures.exists('seth-walk'))this.load.spritesheet('seth-walk','./assets/seth-walk.png',walkLayout);
  if(!this.textures.exists('seth-fall'))this.load.spritesheet('seth-fall','./assets/seth-fall-v1.png',fallLayout);
 }
 text(x:number,y:number,value:string,size=16,color='#f3e0c2'){return this.add.text(x,y,value,{fontFamily:'Arial',fontSize:`${size}px`,color,stroke:'#172337',strokeThickness:3}).setResolution(this.renderScale);}
 screenText(x:number,y:number,value:string,size=16,color='#f3e0c2'){const t=this.text(x,y,value,size,color);this.ui.add(t);return t;}
 platform(x:number,top:number,width:number,height=20,color=0x566372){const art=this.add.rectangle(x+width/2,top+height/2,width,height,color).setDepth(0);this.platforms.add(art);this.add.rectangle(x+width/2,top,width,3,0xc9dcb9).setDepth(1);return art;}
 hazard(kind:string,x:number,y:number,range=65,period=2600,width=30,height=65){const art=this.add.image(x,y+height/2,kind).setOrigin(.5,1).setDisplaySize(width+18,height+12).setDepth(6);this.hazards.push({art,kind,x,y,range,period,width,height});return art;}
 abstract buildWorld():void;
 abstract objectiveText():string;
 abstract tick(delta:number,action:boolean):void;
 resetMission(){} afterPlayer(){} drawExtras(){} motionHeld(){return false;}
 create(){
  const c=this.config;this.renderScale=(this.game.config.width as number)/W;this.runVersion++;this.elapsedMs=0;this.hits=0;this.stamina=100;this.immuneMs=0;this.paused=false;this.won=false;this.failed=false;this.introActive=true;this.introStarted=false;this.restartSince=null;this.hazards=[];this.controller=new ControllerInput();this.photos=new Set();this.facing=1;this.lastGround=-1000;this.jumpUntil=0;this.jumpStarted=-1;this.megaUsed=false;this.checkpoint={x:c.startX,bottom:c.startY};this.resetMission();
  document.body.dataset.level=c.key;levelControlCopy(c.key);document.getElementById('current-level')!.textContent=`Level ${c.number} · ${c.title}`;document.getElementById('game')!.setAttribute('aria-label',`${c.title} platform adventure`);document.getElementById('next-level')!.hidden=true;
  const footer=document.querySelector('footer')!;footer.dataset.rooftopHtml??=footer.innerHTML;footer.textContent='MOVE A/D or arrows · JUMP W / Up / Space · Double-tap: Mega Jump · SPRINT Shift · ACTION F · PAUSE P · RESTART hold R';
  touch.clear();resetScoreEntry();resetAdventureScores();(document.getElementById('touch-menu') as HTMLDialogElement).close();gameAudio.beginRun(c.key);
  this.cameras.main.setZoom(this.renderScale).setBackgroundColor('#152334').setBounds(0,0,c.width,c.height);this.physics.world.setBounds(0,0,c.width,c.height+200);this.platforms=this.physics.add.staticGroup();this.buildWorld();
  if(!this.textures.exists('foot-body')){const g=this.add.graphics().fillStyle(0xffffff).fillRect(0,0,26,48);g.generateTexture('foot-body',26,48);g.destroy();}
  this.player=this.physics.add.sprite(c.startX,c.startY-24,'foot-body').setVisible(false).setMaxVelocity(450,850).setCollideWorldBounds(true);this.physics.add.collider(this.player,this.platforms);
  this.portrait=this.add.sprite(this.player.x,c.startY,'seth-walk',1).setOrigin(.5,1).setDisplaySize(62,82).setDepth(9);
  for(const [key,texture] of [['walk-empty','seth-walk'],['fall-empty','seth-fall']])if(!this.anims.exists(key))this.anims.create({key,frames:[0,1,2,3].map(frame=>({key:texture,frame})),frameRate:8,repeat:-1});
  this.cameras.main.startFollow(this.player,true,.13,.13,-110,65);this.afterPlayer();
  this.ui=this.add.container((W*this.renderScale-W)/2,(H*this.renderScale-H)/2).setScrollFactor(0).setDepth(30);this.ui.add(this.add.rectangle(W/2,42,W,84,0x112237,.98));
  this.hud=this.screenText(18,10,'',18);this.objective=this.screenText(18,44,'',15,'#b3e8d0');this.radioLabel=this.screenText(760,8,'',11,'#acdbce').setWordWrapWidth(265);
  this.toast=this.screenText(W/2,110,'',17).setOrigin(.5).setWordWrapWidth(850).setAlign('center').setBackgroundColor('#193149').setPadding(10,7).setVisible(false);
  this.prompt=this.screenText(W/2,530,'',18,'#182b37').setOrigin(.5).setBackgroundColor('#b7e8d0').setStroke('#b7e8d0',0).setPadding(10,8).setVisible(false);
  this.keys=this.input.keyboard!.addKeys('A,D,W,LEFT,RIGHT,UP,SPACE,F,R,S,SHIFT,P') as Record<string,Phaser.Input.Keyboard.Key>;this.input.keyboard!.enabled=true;this.input.keyboard!.addCapture(['SPACE','UP','DOWN','LEFT','RIGHT']);
  const pause=document.getElementById('pause-toggle') as HTMLButtonElement,restart=document.getElementById('restart-run') as HTMLButtonElement;pause.textContent='Pause · P';pause.setAttribute('aria-pressed','false');pause.disabled=true;restart.disabled=true;pause.onclick=()=>{this.togglePause();pause.blur();};restart.onclick=()=>{restart.blur();this.scene.restart();};
  const blur=()=>{this.clearMotion();if(!this.paused)this.togglePause();};const hidden=()=>{if(document.hidden)blur();};const focus=()=>this.clearMotion();window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);for(const id of ['radio-volume','radio-select'])document.getElementById(id)!.addEventListener('focus',focus);
  this.events.once('shutdown',()=>{this.runVersion++;touch.clear();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);for(const id of ['radio-volume','radio-select'])document.getElementById(id)!.removeEventListener('focus',focus);});
  this.showIntro();this.refreshHud();this.publishStatus();
 }
 clearMotion(){touch.clear();this.player?.setVelocityX(0);if(this.keys)for(const k of Object.values(this.keys))k.reset();}
 showIntro(){this.physics.world.pause();this.introOverlay=this.add.container(0,0,[this.add.rectangle(W/2,H/2,W,H,0x112237,.97),this.text(W/2,100,`LEVEL ${this.config.number} · ${this.config.title.toUpperCase()}`,34,'#ffd18b').setOrigin(.5),this.add.image(W/2,225,'adventure-logo').setDisplaySize(300,200),this.text(W/2,390,this.config.instructions,19).setOrigin(.5).setAlign('center').setWordWrapWidth(940)]);this.ui.add(this.introOverlay);document.getElementById('start-game')!.hidden=false;(document.getElementById('touch-menu-open') as HTMLButtonElement).disabled=false;window.dispatchEvent(new Event('game-layout'));}
 async startIntro(){if(this.introStarted||!this.introActive||document.querySelector('dialog[open]'))return;this.introStarted=true;document.getElementById('start-game')!.hidden=true;const v=this.runVersion;try{await gameAudio.playIntro();}catch{}if(v!==this.runVersion||!this.sys.isActive())return;this.introActive=false;this.introOverlay?.destroy();this.introOverlay=undefined;this.clearMotion();this.physics.world.resume();gameAudio.music.startRun();for(const id of ['pause-toggle','restart-run','touch-menu-open'])(document.getElementById(id) as HTMLButtonElement).disabled=false;if(document.hidden||!document.hasFocus())this.togglePause();}
 say(line:string){this.toast.setText(line).setVisible(true);this.toastUntil=this.elapsedMs+4500;}
 refreshControlCopy(){if(this.radioLabel)this.radioLabel.setText(touch.enabled?`SETH FM · ${mobileTrackLabel(gameAudio.music)}\nMusic / settings: Menu`:'Move · Jump · F / Action\nPause P · Restart hold R');}
 refreshHud(){this.hud.setText(`LEVEL ${this.config.number} · ${this.config.title.toUpperCase()}   ${Math.floor(this.elapsedMs/1000)}s`);this.objective.setText(this.objectiveText());this.refreshControlCopy();}
 togglePause(){if(this.introActive||this.won||this.failed||scoresOpen())return;this.paused=!this.paused;this.clearMotion();this.controller.armed=false;const b=document.getElementById('pause-toggle')!;b.textContent=this.paused?'Resume · P':'Pause · P';b.setAttribute('aria-pressed',String(this.paused));void gameAudio.setPaused(this.paused);if(this.paused){this.physics.world.pause();this.pauseOverlay=this.add.container(0,0,[this.add.rectangle(W/2,H/2,W,H,0x112237,.94),this.text(W/2,280,'TAKE A BREATHER',40,'#ffd18b').setOrigin(.5)]);this.ui.add(this.pauseOverlay);}else{this.pauseOverlay?.destroy();this.pauseOverlay=undefined;this.physics.world.resume();}this.publishStatus();}
 takeHit(line='Watch the crowd!'){if(this.introActive||this.paused||this.won||this.failed||this.immuneMs>0)return;this.hits++;this.stamina=Math.max(0,this.stamina-18);this.immuneMs=1400;this.player.setVelocityY(-170);gameAudio.play('impact');this.say(line);this.cameras.main.shake(80,.002);if(this.stamina===0)this.respawn();}
 respawn(){this.stamina=100;this.immuneMs=1800;this.player.setPosition(this.checkpoint.x,this.checkpoint.bottom-24).setVelocity(0,0);(this.player.body as Phaser.Physics.Arcade.Body).reset(this.player.x,this.player.y);this.lastGround=-1000;this.jumpStarted=-1;this.say('Back to the checkpoint. Pride takes longer to recover.');}
 finish(title:string,body:string,score:number){if(this.won)return;this.won=true;this.clearMotion();this.physics.world.pause();gameAudio.music.finishRun('success');gameAudio.play('win');(document.getElementById('pause-toggle') as HTMLButtonElement).disabled=true;this.toast.setVisible(false);this.prompt.setVisible(false);this.ui.add(this.add.container(0,0,[this.add.rectangle(W/2,H/2,950,390,0x12283c,.98).setStrokeStyle(2,0xb6e8cd),this.text(W/2,180,title,36,'#ffd18b').setOrigin(.5),this.text(W/2,300,body+`\n\nScore ${score.toLocaleString()} · ${this.hits} mishaps`,21).setOrigin(.5).setAlign('center').setWordWrapWidth(860),this.text(W/2,452,touch.enabled?'Menu → Restart / Choose Level':'Hold R to restart · Choose Level to replay',17,'#b2e6d0').setOrigin(.5)]));window.dispatchEvent(new CustomEvent('adventure-completed',{detail:{level:this.config.key}}));this.publishStatus();openAdventureScores(this.config.key,this.config.title,{score,elapsedMs:Math.round(this.elapsedMs),hits:this.hits});}
 publishStatus(extra:Record<string,string>={}){const live=document.getElementById('live-status');if(!live||!this.player)return;Object.assign(live.dataset,{level:this.config.key,intro:String(this.introActive),paused:String(this.paused),won:String(this.won),failed:String(this.failed),x:String(Math.round(this.player.x)),y:String(Math.round(this.player.y)),elapsed:String(Math.round(this.elapsedMs)),hits:String(this.hits),stamina:String(this.stamina),grounded:String((this.player.body as Phaser.Physics.Arcade.Body).blocked.down),muted:String(gameAudio.muted)},extra);live.textContent=`${this.config.title}. ${this.objectiveText()}. ${this.introActive?'Select Start Game.':this.paused?'Paused.':this.won?'Complete.':this.prompt.visible?this.prompt.text:''}`;}
 update(time:number,delta:number){
  if(!this.player)return;const dialog=!!document.querySelector('dialog[open]');let pads:readonly(Gamepad|null)[]=[];try{pads=navigator.getGamepads?.()??[];}catch{}const c=this.controller.sample(Array.from(pads),document.hasFocus()&&!dialog&&!['radio-volume','radio-select'].includes(document.activeElement?.id??'')),m=touch.sample(dialog||document.hidden);gameAudio.music.setHold('scores',scoresOpen());
  if(c.disconnected&&!this.paused)this.togglePause();if(Phaser.Input.Keyboard.JustDown(this.keys.P)||c.pause||m.pause)this.togglePause();if(Phaser.Input.Keyboard.JustDown(this.keys.S))gameAudio.toggle();if(this.paused||dialog){this.publishStatus();return;}
  if(this.introActive){if(c.jump||c.interact||m.jump||m.interact)void this.startIntro();this.publishStatus();return;}
  if(this.keys.R.isDown||m.restart){this.restartSince??=time;if(time-this.restartSince>=650){this.scene.restart();return;}}else this.restartSince=null;
  if(this.won||this.failed){this.publishStatus();return;}const dt=Math.min(delta,100);this.elapsedMs+=dt;this.immuneMs=Math.max(0,this.immuneMs-dt);
  const body=this.player.body as Phaser.Physics.Arcade.Body;let direction=keyboardOrControllerMove(this.keys.A.isDown||this.keys.LEFT.isDown,this.keys.D.isDown||this.keys.RIGHT.isDown,c.move||m.move);if(this.motionHeld())direction=0;const crowd=this.hazards.some(h=>h.kind==='concert-fans'&&Math.abs(this.player.x-h.art.x)<85&&Math.abs(body.bottom-(h.art.y))<90);
  this.player.setVelocityX(direction*((this.keys.SHIFT.isDown||c.sprint||m.sprint)?385:275)*(crowd?.55:1));if(direction)this.facing=direction;
  if(body.blocked.down){this.lastGround=time;if(body.velocity.y>=0){this.jumpStarted=-1;this.megaUsed=false;}}
  const pressed=!this.motionHeld()&&(c.jump||m.jump||['W','UP','SPACE'].some(k=>Phaser.Input.Keyboard.JustDown(this.keys[k]))),mega=pressed&&!this.megaUsed&&this.jumpStarted>=0?megaJumpVelocity(this.elapsedMs-this.jumpStarted,body.velocity.y):null;
  if(mega!==null){this.player.setVelocityY(mega);this.megaUsed=true;}else{if(pressed)this.jumpUntil=time+130;if(this.jumpUntil>time&&time-this.lastGround<110){this.player.setVelocityY(-490);this.jumpUntil=0;this.lastGround=-1000;this.jumpStarted=this.elapsedMs;this.megaUsed=false;gameAudio.play('jump');}}
  for(const h of this.hazards){h.art.x=h.x+Math.sin(this.elapsedMs/h.period*2*Math.PI)*h.range;const x=h.art.x,y=h.art.y-h.height/2;if(h.active!==false&&Math.abs(this.player.x-x)<(26+h.width)/2&&Math.abs(this.player.y-y)<(48+h.height)/2)this.takeHit(h.kind==='concert-fans'?'Crowd surge! Jump over the crush.':'Another obstacle with terrible timing.');}
  if(body.bottom>this.config.height+100){this.hits++;this.respawn();}
  this.prompt.setVisible(false);this.tick(dt,Phaser.Input.Keyboard.JustDown(this.keys.F)||c.interact||m.interact);
  const walking=Math.abs(body.velocity.x)>1&&body.blocked.down;this.portrait.setPosition(this.player.x,body.bottom).setFlipX(this.facing<0).setAlpha(this.immuneMs>0?(Math.floor(time/110)%2?.4:1):1);if(walking)this.portrait.play('walk-empty',true);else if(!body.blocked.down&&body.velocity.y>150)this.portrait.play('fall-empty',true);else this.portrait.stop().setTexture('seth-walk',1);
  this.drawExtras();this.toast.setVisible(!this.won&&this.elapsedMs<this.toastUntil);this.refreshHud();this.publishStatus();
 }
}
