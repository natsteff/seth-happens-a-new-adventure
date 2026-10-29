import {modalNavigation} from './modal-navigation.mjs';
import {levelControlCopy} from './level-control-copy';
import Phaser from 'phaser';
import { gameAudio } from './audio';
import { ControllerInput, keyboardOrControllerMove } from './controller.mjs';
import { touch } from './touch.mjs';
import { scoresOpen, resetScoreEntry } from './scoreboard';
import { openTakeoutScores, resetTakeoutScores } from './thai-scoreboard';
import { walkLayout, fallLayout } from './art-layout';
import { REGULAR_JUMP_SPEED, SPRINT_SPEED, megaJumpVelocity, RESTART_HOLD_MS } from './mission.mjs';
import { mobileTrackLabel } from './mobile-track.mjs';
import { brickBuilding } from './scenery';
import { THAI, streetObstacles, trafficZones, newTakeoutRun, collectTakeout, foodWarmth, hitTakeout, canUseElevator, takeoutScore, trafficSpeed, vehicleFrontHurts } from './thai-mission.mjs';

const W=1100,H=600;
type Traffic={body:Phaser.GameObjects.Rectangle;roof:Phaser.GameObjects.Rectangle;art:Phaser.GameObjects.Image;left:number;right:number;waiting:boolean;direction:number};
type Pedestrian={body:Phaser.GameObjects.Rectangle;art:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text;left:number;right:number;phase:number;thief:boolean};
export class ThaiTakeout extends Phaser.Scene {
  constructor(){super({key:'thai'});}
  player!:Phaser.Physics.Arcade.Sprite;
  portrait!:Phaser.GameObjects.Sprite; bag!:Phaser.GameObjects.Image;
  keys!:Record<string,Phaser.Input.Keyboard.Key>;
  controller=new ControllerInput();
  ui!:Phaser.GameObjects.Container;introOverlay?:Phaser.GameObjects.Container;pauseOverlay?:Phaser.GameObjects.Container;
  hud!:Phaser.GameObjects.Text;objective!:Phaser.GameObjects.Text;timerText!:Phaser.GameObjects.Text;radioLabel!:Phaser.GameObjects.Text;
  prompt!:Phaser.GameObjects.Text;toast!:Phaser.GameObjects.Text;progress!:Phaser.GameObjects.Rectangle;
  order!:Phaser.GameObjects.Image;allison!:Phaser.GameObjects.Image;
  homePier!:Phaser.GameObjects.Image;
  traffic:Traffic[]=[];pedestrians:Pedestrian[]=[];
  run=newTakeoutRun();elapsedMs=0;paused=false;pauseStarted=0;introActive=true;introStarted=false;won=false;failed=false;riding=false;
  photos=new Set<number>(); // Shared menu contract; Level 2 has no photo objectives.
  renderScale=1;facing=1;lastGround=-1000;jumpUntil=0;jumpStarted=-1;megaUsed=false;immuneUntil=0;restartSince:number|null=null;
  toastUntil=0;lastBeep=0;runVersion=0;scorePaused=false;deliveryElapsed=0;rideTween?:Phaser.Tweens.Tween;

  preload(){
    const image=(key:string,path:string)=>{if(!this.textures.exists(key))this.load.image(key,path);};
    image('thai-street','./assets/thai/street-backdrop-v1.png');image('thai-props','./assets/thai/street-props-v1.png');
    image('thai-home','./assets/thai/home-lower-facade-v1.png');
    image('adventure-brick','./assets/scenery/brick-facade-v1.png');
    image('scruffy','./assets/scruffy-pedestrian.png');image('clown','./assets/clown.png');
    image('allison','./assets/allison.png');image('concert-fans','./assets/concert-fans.png');image('seth-timeout','./assets/seth-timeout-v1.png');
    if(!this.textures.exists('seth-walk'))this.load.spritesheet('seth-walk','./assets/seth-walk.png',walkLayout);
    if(!this.textures.exists('seth-fall'))this.load.spritesheet('seth-fall','./assets/seth-fall-v1.png',fallLayout);
  }
  text(x:number,y:number,value:string,size=16,color='#f1e0c5'){
    return this.add.text(x,y,value,{fontFamily:'Arial',fontSize:`${size}px`,color,stroke:'#17202d',strokeThickness:3}).setResolution(this.renderScale);
  }
  screenText(x:number,y:number,value:string,size=16,color='#f1e0c5'){
    const item=this.text(x,y,value,size,color);this.ui.add(item);return item;
  }
  create(){
    this.renderScale=(this.game.config.width as number)/W;
    document.body.dataset.level='thai';levelControlCopy('thai');for(const key of ['grip','jumps','speed','biggest','bonus','risky','reaction'])delete document.getElementById('live-status')!.dataset[key];document.getElementById('current-level')!.textContent='Level 2 · Thai Takeout Run';
    document.getElementById('game')!.setAttribute('aria-label','Level 2 · Thai Takeout Run platform game');
    const footer=document.querySelector('footer')!;footer.dataset.rooftopHtml??=footer.innerHTML;
    footer.textContent='MOVE A/D or arrows · JUMP W / Up / Space · Double-tap for Mega Jump · SPRINT Shift · PICKUP / FRONT DOOR F · PAUSE P · RESTART hold R';
    document.getElementById('next-level')!.hidden=true;
    touch.clear();resetScoreEntry();resetTakeoutScores();modalNavigation.reset();(document.getElementById('touch-menu') as HTMLDialogElement).close();
    this.run=newTakeoutRun();this.elapsedMs=0;this.deliveryElapsed=0;this.paused=false;this.introActive=true;this.introStarted=false;
    this.won=false;this.failed=false;this.riding=false;this.scorePaused=false;this.controller=new ControllerInput();this.photos=new Set();
    this.facing=1;this.lastGround=-1000;this.jumpUntil=0;this.jumpStarted=-1;this.megaUsed=false;this.immuneUntil=0;this.restartSince=null;this.lastBeep=0;
    this.traffic=[];this.pedestrians=[];this.runVersion++;this.input.keyboard!.enabled=true;
    gameAudio.beginRun('thai');
    this.cameras.main.setZoom(this.renderScale).setBackgroundColor('#1b2436').setBounds(0,0,THAI.width,H);
    this.drawStreet();
    const frames=this.textures.get('thai-props');
    // Frames trim transparent margins at runtime; supplied image originals are untouched.
    for(const [name,x,y,w,h] of [
      ['bus',20,185,697,266],['car-left',726,263,418,192],['bin',1171,204,339,251],
      ['bag',90,564,334,384],['car-right',497,710,550,226],['cart',1088,616,418,329]
    ] as [string,number,number,number,number][]){if(!frames.has(name))frames.add(name,0,x,y,w,h);}
    const platforms=this.physics.add.staticGroup();
    const ground=this.add.rectangle(THAI.width/2,THAI.ground+60,THAI.width,120,0xffffff,0);platforms.add(ground);
    for(const obstacle of streetObstacles){
      const {x,width,height,kind}=obstacle;
      if(kind==='shop'||kind==='building')brickBuilding(this,x,THAI.ground-height,width,THAI.ground,kind==='shop'?2:3);
      else this.add.image(x+width/2,THAI.ground,'thai-props',kind).setOrigin(.5,1).setDisplaySize(width,kind==='bus'?height+8:height).setDepth(1);
      const solid=this.add.rectangle(x+width/2,THAI.ground-height/2,width,height,0xffffff,0);platforms.add(solid);
      // The fine highlight is exactly at the collision top, including bus main roof.
      this.add.rectangle(x+width/2,THAI.ground-height,width,2,0xbcd4bd,.8).setDepth(2);
    }
    if(!this.textures.exists('thai-body')){const g=this.add.graphics().fillStyle(0xffffff).fillRect(0,0,26,48);g.generateTexture('thai-body',26,48);g.destroy();}
    this.player=this.physics.add.sprite(THAI.homeX,THAI.ground-24,'thai-body').setVisible(false).setMaxVelocity(SPRINT_SPEED,850).setCollideWorldBounds(true);
    this.physics.world.setBounds(0,0,THAI.width,H+100);this.physics.add.collider(this.player,platforms);
    this.portrait=this.add.sprite(this.player.x,this.player.y+24,'seth-walk',1).setOrigin(.5,1).setDisplaySize(62,82).setDepth(7);
    this.textures.get('seth-walk').setFilter(Phaser.Textures.FilterMode.NEAREST);
    for(const [key,texture] of [['walk-empty','seth-walk'],['fall-empty','seth-fall']]){
      if(!this.anims.exists(key))this.anims.create({key,frames:[0,1,2,3].map(frame=>({key:texture,frame})),frameRate:8,repeat:-1});
    }
    this.bag=this.add.image(0,0,'thai-props','bag').setOrigin(.5,.4).setDisplaySize(21,25).setDepth(8).setVisible(false);
    this.order=this.add.image(THAI.restaurantX,THAI.ground-52,'thai-props','bag').setDisplaySize(35,41).setDepth(6);
    this.add.image(THAI.restaurantX-110,THAI.ground,'concert-fans').setOrigin(.5,1).setDisplaySize(76,91).setDepth(3);
    this.buildTraffic();this.buildPedestrians();
    this.cameras.main.startFollow(this.player,true,.13,.13,-100,0);
    this.ui=this.add.container((W*this.renderScale-W)/2,(H*this.renderScale-H)/2).setScrollFactor(0).setDepth(20);
    this.ui.add(this.add.rectangle(W/2,44,W,88,0x111f31,.98));
    this.hud=this.screenText(18,10,'',17);this.objective=this.screenText(18,43,'',15,'#aee6d2');
    this.timerText=this.screenText(900,9,'180s',31,'#ffd08b');this.screenText(900,47,'TIME LEFT',10,'#c9b48e');
    this.radioLabel=this.screenText(590,8,'',11,'#aee0d7').setWordWrapWidth(235).setPadding(6,3).setBackgroundColor('#193542');
    this.ui.add(this.add.rectangle(W/2,83,W-36,3,0x3d5266));
    this.progress=this.add.rectangle(18,83,0,3,0xe7b65e).setOrigin(0,.5);this.ui.add(this.progress);
    this.prompt=this.screenText(W/2,548,'',17,'#152e38').setOrigin(.5).setBackgroundColor('#a8e4cc').setStroke('#a8e4cc',0).setPadding(14,9).setVisible(false);
    this.toast=this.screenText(W/2,112,'',17).setOrigin(.5).setBackgroundColor('#15263b').setPadding(12,8).setWordWrapWidth(850);
    this.keys=this.input.keyboard!.addKeys('A,D,W,LEFT,RIGHT,UP,SPACE,F,R,B,S,SHIFT,P') as Record<string,Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['SPACE','UP','DOWN','LEFT','RIGHT']);
    const pause=document.getElementById('pause-toggle') as HTMLButtonElement,restart=document.getElementById('restart-run') as HTMLButtonElement;
    pause.textContent='Pause · P';pause.setAttribute('aria-pressed','false');pause.disabled=true;restart.disabled=true;
    pause.onclick=()=>{this.togglePause();pause.blur();};restart.onclick=()=>{restart.blur();this.scene.restart();};
    const blur=()=>{touch.clear();this.player.setVelocityX(0);for(const key of Object.values(this.keys))key.reset();if(!this.paused)this.togglePause();};
    const hidden=()=>{if(document.hidden)blur();};
    window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
    const focus=()=>{this.player.setVelocityX(0);for(const key of Object.values(this.keys))key.reset();};
    for(const id of ['radio-volume','radio-select'])document.getElementById(id)!.addEventListener('focus',focus);
    this.events.once('shutdown',()=>{
      this.runVersion++;touch.clear();gameAudio.cancelRide();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);
      for(const id of ['radio-volume','radio-select'])document.getElementById(id)!.removeEventListener('focus',focus);
    });
    this.showIntro();this.refreshControlCopy();this.publishStatus();
  }
  drawStreet(){
    // One reusable image section repeated in world space, then quietened behind play.
    const backdrop=this.add.tileSprite(0,0,THAI.width,H,'thai-street').setOrigin(0).setTileScale(.65).setDepth(-25);
    backdrop.tilePositionY=0;
    this.add.rectangle(THAI.width/2,H/2,THAI.width,H,0x142136,.18).setDepth(-24);
    const g=this.add.graphics().setDepth(-2);
    g.fillStyle(0x444653).fillRect(0,THAI.ground,THAI.width,15);
    g.fillStyle(0xa6a092).fillRect(0,THAI.ground,THAI.width,3);
    g.fillStyle(0x171f2c).fillRect(0,THAI.ground+15,THAI.width,100);
    g.lineStyle(1,0x78717a,.4);for(let x=0;x<THAI.width;x+=46)g.lineBetween(x,THAI.ground+3,x,THAI.ground+14);
    for(let x=0;x<THAI.width;x+=115)g.fillStyle(0xc2a765,.7).fillRect(x,THAI.ground+55,52,4);
    // Clear foreground destinations, separate from the repeating background storefronts.
    this.drawHomeBuilding();
    this.allison=this.add.image(80,THAI.ground,'allison').setOrigin(.5,1).setDisplaySize(62,100).setDepth(3);
    this.text(42,THAI.ground-127,'Allison: “Dinner is your mission.”',13,'#ffe2a4').setBackgroundColor('#172638').setPadding(4,3);
    brickBuilding(this,5160,235,290,THAI.ground,3);
    this.add.rectangle(THAI.restaurantX,293,253,56,0x76382f).setStrokeStyle(2,0xe8bd78).setDepth(0);
    this.text(THAI.restaurantX,281,'THAI TAKEOUT',22,'#ffe3a1').setOrigin(.5,0).setDepth(1);
    this.text(THAI.restaurantX,319,'HOT FOOD · OPEN LATE',12,'#f4d2a1').setOrigin(.5,0).setDepth(1);
    this.add.rectangle(THAI.restaurantX,THAI.ground-72,79,144,0x253c48).setStrokeStyle(3,0xc8a46c);
    this.text(THAI.restaurantX-28,THAI.ground-136,'PICKUP',13,'#ffe4ac');
    for(const zone of trafficZones){
      this.text(zone.left,THAI.ground-104,'⚠ TRAFFIC CROSSING',12,'#ffce8b').setBackgroundColor('#28313d').setPadding(5,3);
      for(let x=zone.left;x<zone.right;x+=38)g.fillStyle(0xc5c6b3,.28).fillRect(x,THAI.ground+20,21,60);
    }
    this.text(900,THAI.ground-155,'PARKED BUS · ROOF ROUTE',12,'#ffe0a1');
    this.text(2940,THAI.ground-211,'UP AND OVER THE BLOCK →',13,'#ffe0a1');
  }
  drawHomeBuilding(){
    // The tower continues above the street camera. Reuse small vector floor
    // sections rather than allocating a thirty-story bitmap or TileSprite.
    // The entrance in the supplied facade stays centered on the home trigger.
    const width=500,left=THAI.homeX-185,facadeHeight=820*width/1485;
    const seam=THAI.ground-facadeHeight;
    const tower=this.add.graphics().setDepth(-1);
    const floorHeight=42,upperFloors=27,top=seam-upperFloors*floorHeight;
    tower.fillStyle(0x99472e).fillRect(left,top,width,seam-top+2);
    // Brick/tan piers and dark teal glazing echo the lower facade. The cropped
    // upper edge is a continuation, never a low-building roof/collision ledge.
    for(let y=top;y<seam;y+=floorHeight){
      tower.fillStyle(0x273544).fillRect(left+4,y+5,width-8,34);
      for(let x=left+16;x<left+width-10;x+=29){
        tower.fillStyle(0x126174).fillRect(x,y+8,18,26);
        tower.fillStyle(0x338698).fillRect(x+2,y+9,4,22);
        tower.fillStyle(0x9c472d).fillRect(x+19,y+4,8,36);
      }
      tower.fillStyle(0xc47745).fillRect(left,y+38,width,4);
      for(const [offset,pierWidth] of [[0,60],[150,44],[215,44],[410,60],[478,22]]){
        tower.fillStyle(0xc36938).fillRect(left+offset,y,pierWidth,floorHeight);
        tower.fillStyle(0xe7954f).fillRect(left+offset+2,y+2,3,floorHeight-2);
      }
      tower.fillStyle(0xe3bb78).fillRect(left,y,width,3);
    }
    const texture=this.textures.get('thai-home');
    if(!texture.has('lower'))texture.add('lower',0,30,100,1485,820);
    this.add.image(left,THAI.ground,'thai-home','lower').setOrigin(0,1)
      .setDisplaySize(width,facadeHeight).setDepth(-1);
    // Foreground middle pier hides the pair as they enter the left-hand door.
    if(!texture.has('entry-pier'))texture.add('entry-pier',0,480,220,145,680);
    this.homePier=this.add.image(left+450*width/1485,THAI.ground-20*width/1485,'thai-home','entry-pier')
      .setOrigin(0,1).setDisplaySize(145*width/1485,680*width/1485).setDepth(5);
  }
  buildTraffic(){
    trafficZones.forEach((zone,index)=>{
      const x=zone.right-20-index*35;
      const body=this.add.rectangle(x,THAI.ground-25,124,50,0xffffff,0);this.physics.add.existing(body);
      const physics=body.body as Phaser.Physics.Arcade.Body;physics.setAllowGravity(false).setImmovable(true);
      const roof=this.add.rectangle(x+9,THAI.ground-59.5,68,19,0xffffff,0);this.physics.add.existing(roof);
      const roofPhysics=roof.body as Phaser.Physics.Arcade.Body;roofPhysics.setAllowGravity(false).setImmovable(true);
      roofPhysics.checkCollision.left=false;roofPhysics.checkCollision.right=false;roofPhysics.checkCollision.down=false;
      const art=this.add.image(x,THAI.ground,'thai-props','car-left').setOrigin(.5,1).setDisplaySize(150,69).setDepth(4);
      const car={body,roof,art,left:zone.left,right:zone.right,waiting:false,direction:-1};this.traffic.push(car);
      this.physics.add.collider(this.player,roof);
      this.physics.add.collider(this.player,body,()=>{
        if(vehicleFrontHurts(physics.touching,car.direction))this.takeHit(false,'Front bumper collision — jump onto the vehicle or clear its nose.');
      });
    });
  }
  buildPedestrians(){
    for(const [index,left,right,texture,thief] of [[0,1740,2190,'scruffy',false],[1,4470,4840,'clown',false],[2,1830,2310,'scruffy',true],[3,5120,5205,'clown',false]] as [number,number,number,string,boolean][]){
      const body=this.add.rectangle(left+80,THAI.ground-33,30,66,0xffffff,0);this.physics.add.existing(body);
      (body.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setImmovable(true);
      const art=this.add.image(body.x,THAI.ground,texture).setOrigin(.5,1).setDisplaySize(texture==='clown'?46:51,80).setDepth(5);
      const label=this.text(body.x,THAI.ground-98,thief?'FOOD SNATCHER':'LATE-NIGHT WANDERER',10,thief?'#ffb5ab':'#d4c8ad').setOrigin(.5).setDepth(5).setBackgroundColor('#172638').setPadding(3,2);
      this.pedestrians.push({body,art,label,left,right,phase:index*137,thief});
      this.physics.add.overlap(this.player,body,()=>this.takeHit(thief,thief?'Hands off the takeout! Food condition −20.':'Pedestrian bump — watch your dinner.'));
    }
  }
  showIntro(){
    this.physics.world.pause();
    this.introOverlay=this.add.container(0,0);this.ui.add(this.introOverlay);
    const panel=this.add.rectangle(W/2,H/2,W,H,0x111f31,.95);
    const title=this.text(W/2,172,'THAI TAKEOUT RUN',42,'#ffcf8a').setOrigin(.5).setFontStyle('bold');
    const level=this.text(W/2,119,'LEVEL 2 · DINNER WON’T FETCH ITSELF',17,'#abe3cf').setOrigin(.5);
    const art=this.add.image(W/2,280,'thai-props','bag').setDisplaySize(92,106);
    const instructions=this.text(W/2,381,`Head right to the Thai restaurant. Press ${touch.enabled?'Action':'F / Action'} to collect dinner.\nClimb bins, buses and low roofs to avoid traffic.\nBring the food LEFT to the apartment front door. Protect its condition and warmth.`,20).setOrigin(.5).setAlign('center').setWordWrapWidth(930);
    this.introOverlay.add([panel,level,title,art,instructions]);
    document.getElementById('start-game')!.hidden=false;(document.getElementById('touch-menu-open') as HTMLButtonElement).disabled=false;
    window.dispatchEvent(new Event('game-layout'));
  }
  async startIntro(){
    if(this.introStarted||!this.introActive||document.querySelector('dialog[open]'))return;
    this.introStarted=true;document.getElementById('start-game')!.hidden=true;(document.getElementById('touch-menu-open') as HTMLButtonElement).disabled=true;
    const version=this.runVersion;
    try{await gameAudio.playIntro();}catch{/* The level remains playable if an audio file is unavailable. */}
    if(version!==this.runVersion||!this.sys.isActive())return;
    this.introActive=false;this.introOverlay?.destroy();this.introOverlay=undefined;touch.clear();
    for(const key of Object.values(this.keys))key.reset();
    this.physics.world.resume();gameAudio.music.startRun();
    for(const id of ['pause-toggle','restart-run','touch-menu-open'])(document.getElementById(id) as HTMLButtonElement).disabled=false;
    this.say('Thai food is waiting → Land on vehicles. Watch their front bumpers.');
  }
  say(message:string){this.toast.setText(message).setVisible(true);this.toastUntil=this.elapsedMs+4200;}
  refreshControlCopy(){
    if(!this.hud)return;
    this.timerText.setX(touch.enabled?850:900);this.radioLabel.setX(590).setVisible(touch.enabled);
    this.radioLabel.setText(`SETH FM · MUSIC\n${mobileTrackLabel(gameAudio.music)}\nChange music: Menu`);
  }
  togglePause(){
    if(this.introActive||this.won||this.failed||this.riding||scoresOpen())return;
    this.paused=!this.paused;touch.clear();this.controller.armed=false;this.player.setVelocityX(0);this.jumpStarted=-1;this.megaUsed=false;
    const button=document.getElementById('pause-toggle')!;button.textContent=this.paused?'Resume · P':'Pause · P';button.setAttribute('aria-pressed',String(this.paused));
    if(this.paused){
      this.pauseStarted=this.time.now;this.physics.world.pause();this.tweens.pauseAll();void gameAudio.setPaused(true);
      this.pauseOverlay=this.add.container(0,0,[this.add.rectangle(W/2,H/2,W,H,0x102137,.9),this.text(W/2,270,'DINNER BREAK',44,'#ffd08b').setOrigin(.5),this.text(W/2,330,'Resume when you’re ready.',20).setOrigin(.5)]);this.ui.add(this.pauseOverlay);
    }else{
      this.immuneUntil+=this.time.now-this.pauseStarted;this.pauseOverlay?.destroy();this.pauseOverlay=undefined;
      this.tweens.resumeAll();void gameAudio.setPaused(false);for(const key of Object.values(this.keys))key.reset();this.lastGround=-1000;this.jumpUntil=0;
      if(!this.riding)this.physics.world.resume();
    }
    this.publishStatus();
  }
  takeHit(thief:boolean,message:string){
    if(this.introActive||this.paused||this.riding||this.won||this.failed||this.time.now<this.immuneUntil)return;
    this.run=hitTakeout(this.run,thief);this.immuneUntil=this.time.now+1600;
    this.player.setVelocityX(0);this.player.setVelocityY(-180);gameAudio.play('impact');
    gameAudio.speak(thief?'Well, excuse you.':'Ouch!',thief?'person':'ouch');
    this.cameras.main.shake(90,.002);this.say(this.run.food?message+' Keep going — the order is still yours.':message);
  }
  updateTraffic(delta:number){
    const returning=this.run.food,direction=returning?1:-1;
    for(const car of this.traffic){
      const body=car.body.body as Phaser.Physics.Arcade.Body,roof=car.roof.body as Phaser.Physics.Arcade.Body;
      const spawn=direction<0?car.right:car.left;
      if(car.body.x<car.left||car.body.x>car.right||car.waiting){
        if(Math.abs(spawn-this.player.x)<225){car.waiting=true;body.enable=false;roof.enable=false;car.art.setVisible(false);continue;}
        body.enable=true;roof.enable=true;body.reset(spawn,THAI.ground-25);roof.reset(spawn-direction*9,THAI.ground-59.5);car.waiting=false;car.art.setVisible(true);
      }
      if(car.direction!==direction)roof.reset(car.body.x-direction*9,THAI.ground-59.5);
      car.direction=direction;roof.setVelocityX(direction*trafficSpeed(returning));
      body.setVelocityX(direction*trafficSpeed(returning));
      car.art.setPosition(car.body.x,THAI.ground).setFrame(returning?'car-right':'car-left');
    }
    for(const person of this.pedestrians){
      const active=!person.thief||returning,body=person.body.body as Phaser.Physics.Arcade.Body;
      body.enable=active;person.art.setVisible(active);person.label.setVisible(active);if(!active)continue;
      let x=person.body.x;
      if(person.thief&&Math.abs(this.player.x-x)<440)x=Phaser.Math.Clamp(x+Math.sign(this.player.x-x)*105*delta/1000,person.left,person.right);
      else{x=person.left+(Math.sin((this.elapsedMs+person.phase*11)/2100)+1)/2*(person.right-person.left);}
      person.art.setFlipX(x<person.body.x);body.reset(x,THAI.ground-33);person.art.setX(x);person.label.setX(x);
    }
  }
  enterHome(){
    if(this.riding||!canUseElevator(this.run,this.player.x,(this.player.body as Phaser.Physics.Arcade.Body).bottom))return;
    this.riding=true;this.deliveryElapsed=this.elapsedMs;this.run={...this.run,phase:'entering'};touch.clear();
    (document.getElementById('pause-toggle') as HTMLButtonElement).disabled=true;
    this.player.setVelocity(0,0);this.physics.world.pause();this.prompt.setVisible(false);this.say('HOME. Dinner is secured. Let’s eat.');
    const version=this.runVersion;
    this.facing=-1;this.portrait.setFlipX(true).play('walk-empty',true);
    this.homePier.setDepth(10);
    this.allison.setFlipX(false);
    // Both approach the pedestrian door behind the middle pier. No lift/audio.
    this.rideTween=this.tweens.add({targets:[this.player,this.allison],x:170,duration:1200,ease:'Sine.easeInOut',
      onUpdate:()=>{
        const fade=(x:number)=>Phaser.Math.Clamp(Math.abs(x-170)/30,0,1);
        this.portrait.setPosition(this.player.x,THAI.ground).setAlpha(fade(this.player.x));
        this.bag.setPosition(this.player.x-25,THAI.ground-20).setAlpha(fade(this.player.x));
        this.allison.setAlpha(fade(this.allison.x));
      },
      onComplete:()=>{
        if(version!==this.runVersion||!this.sys.isActive())return;
        this.portrait.setVisible(false);this.bag.setVisible(false);this.allison.setVisible(false);this.finishRun();
      }});
  }
  finishRun(){
    if(this.won)return;
    this.riding=false;this.won=true;this.run={...this.run,phase:'complete'};this.physics.world.pause();
    window.dispatchEvent(new Event('takeout-completed'));
    gameAudio.music.finishRun('success');gameAudio.play('win');
    (document.getElementById('pause-toggle') as HTMLButtonElement).disabled=true;
    const warmth=foodWarmth(this.run,this.deliveryElapsed),score=takeoutScore(this.run,this.deliveryElapsed);
    this.endPanel('DINNER. DELIVERED.',`SCORE ${score.toLocaleString()}\nFood condition ${this.run.condition}% · Warmth ${warmth}%\n${(this.deliveryElapsed/1000).toFixed(1)} seconds · ${this.run.hits} hits\n\nAllison: “You even remembered the spring rolls.”`);
    this.publishStatus();
    openTakeoutScores({score,condition:this.run.condition,warmth,hits:this.run.hits,elapsedMs:Math.min(THAI.limitMs-1,Math.round(this.deliveryElapsed))});
  }
  failRun(){
    this.failed=true;this.physics.world.pause();this.player.setVelocity(0,0);this.prompt.setVisible(false);
    gameAudio.music.finishRun('failure');(document.getElementById('pause-toggle') as HTMLButtonElement).disabled=true;
    this.endPanel('TAKEOUT TIMEOUT',`Dinner took a detour. No score saved.\n\n${this.run.food?'The food is safe, but Allison already ordered a backup.':'The restaurant can’t hold your order forever.'}\n\nRestart this level or choose another adventure.`);
    this.updateHud();this.publishStatus();
  }
  endPanel(title:string,body:string){
    const panel=this.add.container(0,0,[this.add.rectangle(W/2,H/2,920,390,0x13263b,.98).setStrokeStyle(2,0x9be0c6),this.text(W/2,180,title,36,'#ffd08b').setOrigin(.5).setFontStyle('bold'),this.text(W/2,310,body,21).setOrigin(.5).setAlign('center').setWordWrapWidth(850),this.text(W/2,455,touch.enabled?'Menu → Restart / Choose Level':'Hold R to restart · Choose Level for another route',16,'#ffd08b').setOrigin(.5)]);
    this.ui.add(panel);this.toast.setVisible(false);this.prompt.setVisible(false);
  }
  updateHud(){
    const remaining=Math.max(0,Math.ceil((THAI.limitMs-this.elapsedMs)/1000));
    const heat=foodWarmth(this.run,this.riding||this.won?this.deliveryElapsed:this.elapsedMs);
    this.hud.setText(this.run.food?`LEVEL 2 · HOMEWARD ←   Food ${this.run.condition}% · Warmth ${heat}%`:'LEVEL 2 · THAI TAKEOUT RUN →   Collect dinner');
    this.objective.setText(this.run.food?`Protect the food · ${this.run.hits} hits · Return to the apartment front door`:'Restaurant ahead → · Bins, buses and roofs are safe routes');
    this.timerText.setText(`${remaining}s`).setColor(remaining<=30?'#ff8e82':'#ffd08b');
    const distance=Phaser.Math.Clamp((this.player.x-THAI.homeX)/(THAI.restaurantX-THAI.homeX),0,1);
    this.progress.setSize((W-36)*(this.run.food ? .5+(1-distance)/2 : distance/2),3);
    if(!this.won&&!this.failed)gameAudio.music.updateRemaining(remaining);
    this.refreshControlCopy();
  }
  publishStatus(){
    const live=document.getElementById('live-status');if(!live||!this.player)return;
    Object.assign(live.dataset,{level:'thai',intro:String(this.introActive),paused:String(this.paused),won:String(this.won),failed:String(this.failed),riding:String(this.riding),phase:this.run.phase,x:String(Math.round(this.player.x)),y:String(Math.round(this.player.y)),elapsed:String(Math.round(this.elapsedMs)),food:String(this.run.food),condition:String(this.run.condition),warmth:String(foodWarmth(this.run,this.riding||this.won?this.deliveryElapsed:this.elapsedMs)),hits:String(this.run.hits),grounded:String((this.player.body as Phaser.Physics.Arcade.Body).blocked.down),megaJump:String(this.megaUsed),muted:String(gameAudio.muted)});
    const summary=this.introActive?'Thai Takeout Run. Select Start Game.':`${this.hud?.text??''}. ${this.objective?.text??''}. ${this.paused?'Paused.':this.won?'Delivery complete.':this.failed?'Time expired.':this.prompt?.visible?this.prompt.text:''}`;
    if(live.textContent!==summary)live.textContent=summary;
  }
  update(time:number,delta:number){
    if(!this.player)return;
    const dialogOpen=!!document.querySelector('dialog[open]');
    gameAudio.music.setHold('scores',scoresOpen());
    let pads:readonly (Gamepad|null)[]=[];try{pads=navigator.getGamepads?.()??[];}catch{/* Keyboard stays available. */}
    const controller=this.controller.sample(Array.from(pads),document.hasFocus()&&!dialogOpen&&!['radio-volume','radio-select'].includes(document.activeElement?.id??''));
    const mobile=touch.sample(dialogOpen||document.hidden);
    const move=controller.move||mobile.move,jump=controller.jump||mobile.jump,action=controller.interact||mobile.interact;
    if(controller.disconnected&&!this.paused)this.togglePause();
    if(Phaser.Input.Keyboard.JustDown(this.keys.P)||controller.pause||mobile.pause)this.togglePause();
    if(Phaser.Input.Keyboard.JustDown(this.keys.S))gameAudio.toggle();
    if(this.paused){this.publishStatus();return;}
    if(scoresOpen()){
      this.physics.world.pause();this.input.keyboard!.enabled=false;this.scorePaused=true;return;
    }
    if(this.scorePaused){this.input.keyboard!.enabled=true;this.scorePaused=false;for(const key of Object.values(this.keys))key.reset();if(!this.introActive&&!this.won&&!this.failed&&!this.riding)this.physics.world.resume();}
    if(this.introActive){if(jump||action||move)void this.startIntro();this.publishStatus();return;}
    if(!dialogOpen&&(this.keys.R.isDown||mobile.restart)){this.restartSince??=time;if(time-this.restartSince>=RESTART_HOLD_MS){this.scene.restart();return;}}else this.restartSince=null;
    if(dialogOpen)return;
    if(!this.won&&!this.failed&&!this.riding)this.elapsedMs+=Math.min(delta,250);
    if(!this.won&&!this.failed&&this.elapsedMs>=THAI.limitMs)this.failRun();
    if(this.won||this.failed){this.publishStatus();return;}
    if(this.riding){this.updateHud();this.publishStatus();return;}
    const remaining=Math.ceil((THAI.limitMs-this.elapsedMs)/1000);
    if(remaining<=30&&remaining>0&&remaining!==this.lastBeep){this.lastBeep=remaining;gameAudio.play('timer',remaining<=10);}
    const body=this.player.body as Phaser.Physics.Arcade.Body;
    const direction=keyboardOrControllerMove(this.keys.A.isDown||this.keys.LEFT.isDown,this.keys.D.isDown||this.keys.RIGHT.isDown,move);
    this.player.setVelocityX(direction*((this.keys.SHIFT.isDown||controller.sprint||mobile.sprint)?SPRINT_SPEED:275));if(direction)this.facing=direction;
    if(body.blocked.down){this.lastGround=time;if(body.velocity.y>=0){this.jumpStarted=-1;this.megaUsed=false;}}
    const pressed=jump||['W','UP','SPACE'].some(k=>Phaser.Input.Keyboard.JustDown(this.keys[k]));
    const boost=pressed&&!this.megaUsed&&this.jumpStarted>=0?megaJumpVelocity(this.elapsedMs-this.jumpStarted,body.velocity.y):null;
    if(boost!==null){this.player.setVelocityY(boost);this.megaUsed=true;this.jumpUntil=0;gameAudio.speak('Mega jump','mega');}
    else{if(pressed)this.jumpUntil=time+130;if(this.jumpUntil>time&&time-this.lastGround<110){this.player.setVelocityY(-REGULAR_JUMP_SPEED);this.jumpUntil=0;this.lastGround=-1000;this.jumpStarted=this.elapsedMs;this.megaUsed=false;gameAudio.play('jump');gameAudio.speak('Quick hop','quick');}}
    this.updateTraffic(Math.min(delta,50));
    const atRestaurant=this.run.phase==='outbound'&&Math.abs(this.player.x-THAI.restaurantX)<65&&Math.abs(body.bottom-THAI.ground)<18;
    const atHome=canUseElevator(this.run,this.player.x,body.bottom);
    this.prompt.setVisible(atRestaurant||atHome);
    if(atRestaurant)this.prompt.setText(touch.enabled?'[ Action ] Collect Thai takeout':'[ F / Action ] Collect Thai takeout');
    if(atHome)this.prompt.setText(touch.enabled?'[ Action ] Enter front door · deliver dinner':'[ F / Action ] Enter front door · deliver dinner');
    if(action||Phaser.Input.Keyboard.JustDown(this.keys.F)){
      if(atRestaurant){
        this.run=collectTakeout(this.run,this.elapsedMs);this.order.setVisible(false);this.immuneUntil=time+1800;gameAudio.play('takeout');
        this.say('DINNER SECURED. Head LEFT to the apartment. Traffic is faster; watch for food snatchers.');
      }else if(atHome)this.enterHome();
    }
    this.toast.setVisible(this.elapsedMs<this.toastUntil);
    this.drawPlayer();this.updateHud();this.publishStatus();
  }
  drawPlayer(){
    const body=this.player.body as Phaser.Physics.Arcade.Body,walking=Math.abs(body.velocity.x)>1&&body.blocked.down;
    this.portrait.setPosition(this.player.x,this.player.y+24).setFlipX(this.facing<0);
    if(!body.blocked.down&&body.velocity.y>100)this.portrait.play('fall-empty',true);
    else if(walking)this.portrait.play('walk-empty',true);
    else this.portrait.stop().setTexture('seth-walk',1);
    this.portrait.anims.timeScale=walking&&Math.abs(body.velocity.x)>275?1.4:1;
    const alpha=this.time.now<this.immuneUntil?(Math.floor(this.time.now/100)%2?.4:1):1;
    this.portrait.setAlpha(alpha);
    this.bag.setVisible(this.run.food).setPosition(this.player.x+this.facing*25,this.player.y+4+(walking?Math.sin(this.elapsedMs/65)*1.5:0)).setFlipX(this.facing<0).setAlpha(alpha);
  }
}
