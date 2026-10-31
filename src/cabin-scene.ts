import {loadCast,castPerson} from './cast';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {gameAudio} from './audio';
import {CABIN,cabinLandings,cabinBoats,cabinBoatPosition,newCabinRun,cabinAction,cabinCheckpoints,cabinRecovery,cabinScore} from './cabin-mission.mjs';
type Deck={art:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body;trim:Phaser.GameObjects.Rectangle;hull:Phaser.GameObjects.Graphics;label:Phaser.GameObjects.Text};
export class CabinFever extends FootAdventure{
 constructor(){super({key:'cabin',number:9,title:'Cabin Fever',...CABIN,startY:CABIN.ground,instructions:'A cooler full of beer. Naturally, it is on the OTHER shore.\nHead right through the woods. Jump between boats, islands and the wobbly dock.\nCream edges are landing surfaces. Wait for boats to come closer.\nF / Action at the cooler, then bring the beer LEFT to the cabin. Water returns you to a checkpoint.'});}
 preload(){super.preload();loadCast(this,'cabin');}
 mission=newCabinRun();decks:Deck[]=[];support:number|null=null;supportOffset=0;returnHazards=false;beerArt!:Phaser.GameObjects.Container;coolerLid!:Phaser.GameObjects.Rectangle;
 resetMission(){this.mission=newCabinRun();this.decks=[];this.support=null;this.supportOffset=0;this.returnHazards=false;}
 buildWorld(){
  // Decorative scenery has no bodies and allocates no world-sized bitmap textures.
  const g=this.add.graphics().setDepth(-25);
  g.fillStyle(0x30495c).fillRect(0,0,CABIN.width,1100);g.fillStyle(0xd4b396).fillRect(0,300,CABIN.width,260);
  g.fillStyle(0x547b7b).fillRect(0,560,CABIN.width,540);
  for(let x=0;x<CABIN.width;x+=165){g.fillStyle(x%330?0x35595c:0x406669).fillTriangle(x-90,640,x+40,300+(x%7)*19,x+170,640);}
  g.fillStyle(0x2b637e).fillRect(2200,835,2600,265);
  for(let x=2220;x<4770;x+=85)g.lineStyle(2,0xa6d0cf,.3).lineBetween(x,866+(x%4)*23,x+43,866+(x%4)*23);
  for(const p of cabinLandings){this.platform(p.x,p.y,p.width,300,0x595b46);for(let x=p.x+20;x<p.x+p.width;x+=36)g.fillStyle(0x769074).fillRect(x,p.y+5,20,7);}
  this.cabin(230);this.text(230,595,'CABIN FEVER',30,'#ffe2a5').setOrigin(.5);this.text(230,630,'ALLISON’S ONLY REQUEST:\n“BRING THE BEER BACK.”',17,'#e4edcd').setOrigin(.5).setAlign('center');
  for(const [x,y,w] of [[660,750,120],[1040,710,130],[1370,745,130],[1790,740,100],[5220,730,120],[5540,700,140]]){this.platform(x,y,w,24,0x77664e);const wood=this.add.graphics().setDepth(2);wood.lineStyle(3,0xa38860).lineBetween(x+8,y+10,x+w-8,y+10);}
  for(const x of [420,900,1500,1900,5100,5500,6380])this.tree(x,800,x%3?1:.8);
  for(const [x,line] of [[1990,'LAKE AHEAD · CHECKPOINT\nWAIT, JUMP, RIDE →'],[2830,'TINY ISLAND · CHECKPOINT\nNO, THIS IS NOT THE CABIN.'],[4200,'ALMOST THE OTHER SHORE →'],[5030,'FAR SHORE · CHECKPOINT\nCOOLER →'] ] as const)this.text(x,625,line,17,'#dcecc8').setOrigin(.5).setAlign('center');
  const dock=this.add.graphics().setDepth(3);for(let x=2130;x<2300;x+=24)dock.lineStyle(2,0xb6a58b).lineBetween(x,800,x,850);
  const cooler=this.add.graphics().setDepth(4);cooler.fillStyle(0xe5e1c9).fillRoundedRect(CABIN.coolerX-43,751,86,49,7);cooler.fillStyle(0x498a8d).fillRect(CABIN.coolerX-38,762,76,30);cooler.lineStyle(4,0xe9dfb4).strokeRoundedRect(CABIN.coolerX-48,760,96,25,7);
  this.coolerLid=this.add.rectangle(CABIN.coolerX,749,94,10,0xf2e8c6).setDepth(5);this.text(CABIN.coolerX,655,'THE COOLER\nF / ACTION · PICK UP BEER',21,'#ffe0a0').setOrigin(.5).setAlign('center');
  this.add.image(CABIN.homeX+75,800,'allison').setOrigin(.5,1).setDisplaySize(58,84).setDepth(6);
  for(const [i,x] of [600,1290,5480,6100].entries()){castPerson(this,'cabin',i,x,800,90).setDepth(5);this.text(x,680,['“Fish are judging you.”','“Bring the cooler back!”','“Other shore, son.”','“Geese own this dock.”'][i],13,'#f2dfb2').setOrigin(.5);}
  this.animalTextures();for(const [i,x] of [750,1240,1830,5320,5740].entries())this.hazard(i%2?'cabin-raccoon':'cabin-goose',x,784,60+i*9,2500+i*210,38,32);
 }
 tree(x:number,bottom:number,scale=1){const g=this.add.graphics().setDepth(-8);g.fillStyle(0x5c493e).fillRect(x-12*scale,bottom-210*scale,24*scale,210*scale);for(let i=0;i<3;i++)g.fillStyle(i%2?0x3f654f:0x294c43).fillTriangle(x-95*scale,bottom-(65+i*55)*scale,x,bottom-(240+i*35)*scale,x+95*scale,bottom-(65+i*55)*scale);}
 cabin(x:number){const g=this.add.graphics().setDepth(-5);g.fillStyle(0x735445).fillRect(x-130,650,260,150);g.fillStyle(0x3a3b41).fillTriangle(x-155,650,x,550,x+155,650);for(let y=666;y<800;y+=23)g.lineStyle(2,0xa7835f).lineBetween(x-130,y,x+130,y);g.fillStyle(0xffd794).fillRect(x-92,683,50,48);g.fillStyle(0x4b4545).fillRect(x+20,680,60,120);g.lineStyle(3,0x4b4545).lineBetween(x-67,683,x-67,731).lineBetween(x-92,707,x-42,707);}
 animalTextures(){
  if(!this.textures.exists('cabin-goose')){const g=this.add.graphics();g.fillStyle(0xe5e2d5).fillEllipse(32,37,46,25).fillRoundedRect(47,11,12,28,5).fillCircle(56,13,10);g.fillStyle(0xe5a35d).fillTriangle(63,10,79,15,63,19);g.fillStyle(0x23333b).fillCircle(59,10,2);g.lineStyle(3,0xe5a35d).lineBetween(23,47,20,57).lineBetween(42,47,45,57);g.generateTexture('cabin-goose',80,60);g.destroy();}
  if(!this.textures.exists('cabin-raccoon')){const g=this.add.graphics();g.fillStyle(0x8a8c8b).fillEllipse(37,37,44,25).fillCircle(60,28,14);g.lineStyle(10,0x747d7e).lineBetween(18,37,3,26);g.lineStyle(4,0x323b44).lineBetween(13,33,8,28);g.fillStyle(0x323b44).fillRoundedRect(48,23,26,10,4).fillTriangle(48,18,49,8,57,16).fillTriangle(63,14,71,8,73,21);g.fillStyle(0xf2e5b9).fillCircle(55,27,2).fillCircle(65,27,2);g.lineStyle(4,0x323b44).lineBetween(26,46,24,56).lineBetween(48,46,50,56);g.generateTexture('cabin-raccoon',80,60);g.destroy();}
 }
 afterPlayer(){
  cabinBoats.forEach((boat,i)=>{const p=cabinBoatPosition(boat,0),art=this.add.rectangle(p.x,p.y+9,boat.width,18,0x8a7358).setDepth(3);this.physics.add.existing(art);const body=art.body as Phaser.Physics.Arcade.Body;body.setAllowGravity(false).setImmovable(true);body.friction.x=0;body.checkCollision.left=false;body.checkCollision.right=false;body.checkCollision.down=false;
   const trim=this.add.rectangle(p.x,p.y,boat.width,4,0xffe6b2).setDepth(4),hull=this.add.graphics().setDepth(2);hull.fillStyle(boat.kind==='pontoon'?0x476f78:boat.kind==='wobbly dock'?0x6e6051:0x8b5e52).fillRoundedRect(-boat.width/2,12,boat.width,27,10);if(boat.kind!=='wobbly dock'){hull.fillStyle(0xb6b8a0).fillRoundedRect(-boat.width/2+12,27,boat.width-24,12,5);}const label=this.text(p.x,p.y+47,boat.kind==='wobbly dock'?'WOBBLY DOCK':i===0?'FISHING BOAT':'',12,'#d9e8d4').setOrigin(.5);hull.setPosition(p.x,p.y);this.decks.push({art,body,trim,hull,label});
   this.physics.add.collider(this.player,art,()=>{const rider=this.player.body as Phaser.Physics.Arcade.Body;if(body.touching.up&&rider.velocity.y<0)rider.setVelocityY(0);});
  });
  const pack=this.add.graphics();pack.fillStyle(0xbe7d42).fillRoundedRect(-17,-19,34,22,3);for(let i=0;i<3;i++){pack.fillStyle(0xdec67a).fillRect(-14+i*10,-28,7,13);pack.fillStyle(0xf5e8bd).fillRect(-14+i*10,-30,7,3);}this.beerArt=this.add.container(0,0,[pack]).setDepth(10).setVisible(false);
 }
 objectiveText(){return this.mission.complete?'BEER DELIVERED · The cabin weekend can finally begin.':this.mission.beer?`← RETURN TO CABIN · Beer ${this.mission.condition}% · Checkpoint: ${this.mission.checkpoint}`:'COOLER ON THE FAR SHORE → · Woods, docks, boats. What could go wrong?';}
 respawn(){this.support=null;this.mission=cabinRecovery(this.mission);super.respawn();}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  if(body.bottom>910&&this.player.x>2300&&this.player.x<4700){this.hits++;this.respawn();this.say(this.mission.beer?'Lake checkpoint. The beer survived. Your dignity did not.':'Lake checkpoint. Swimming was not in the weekend itinerary.');return;}
  const result=cabinAction(this.mission,{x:this.player.x,bottom:body.bottom,action});this.mission=result.state;
  if(result.event){this.checkpoint={...cabinCheckpoints[this.mission.checkpoint as keyof typeof cabinCheckpoints]};if(result.event==='checkpoint'){this.stamina=100;this.say('Dry land checkpoint. Geese still have right of way.');}else if(result.event==='pickup'){this.coolerLid.setAngle(-18);this.returnHazards=true;for(const h of this.hazards)h.period*=.7;this.say('Beer acquired. Allison: “Great. Now bring it BACK.” The wildlife is less patient.');gameAudio.play('pickup');}else if(result.event==='delivery'){this.finish('CABIN FEVER: CURED.',`Allison: “You were gone so long I nearly drank water.”\nBeer delivered · Condition ${this.mission.condition}%`,cabinScore(this.mission,this.elapsedMs,this.hits));return;}}
  if(!this.mission.beer&&Math.abs(this.player.x-CABIN.coolerX)<95&&Math.abs(body.bottom-800)<22)this.prompt.setVisible(true).setText('F / Action · Collect the beer');else if(this.mission.beer&&Math.abs(this.player.x-CABIN.homeX)<95&&Math.abs(body.bottom-800)<22)this.prompt.setVisible(true).setText('F / Action · Deliver the beer');
  let seat=this.support===null?undefined:this.decks[this.support];
  if(seat&&(body.velocity.y < -180||Math.abs(body.bottom-seat.body.top)>18||Math.abs(this.supportOffset)>seat.body.width/2+10)){seat=undefined;this.support=null;}
  if(!seat&&body.velocity.y>=-180){const i=this.decks.findIndex(d=>Math.abs(body.bottom-d.body.top)<8&&Math.abs(body.center.x-d.body.center.x)<d.body.width/2+10);if(i>=0){this.support=i;seat=this.decks[i];this.supportOffset=body.center.x-seat.body.center.x;}}
  if(seat){this.supportOffset+=body.velocity.x*delta/1000;body.position.x=seat.body.center.x+this.supportOffset-body.halfWidth;body.position.y=seat.body.top-body.height;body.setVelocityY(Math.max(0,seat.body.velocity.y));body.blocked.down=true;body.blocked.none=false;body.updateCenter();}
  for(const [i,d] of this.decks.entries()){const p=cabinBoatPosition(cabinBoats[i],this.elapsedMs);d.body.setVelocity((p.x-d.art.x)*1000/Math.max(delta,1),(p.y+9-d.art.y)*1000/Math.max(delta,1));d.trim.setPosition(d.art.x,d.art.y-9);d.hull.setPosition(d.art.x,d.art.y-9);d.label.setPosition(d.art.x,d.art.y+38);}
 }
 drawExtras(){this.beerArt.setVisible(this.mission.beer&&!this.won).setPosition(this.player.x+this.facing*25,(this.player.body as Phaser.Physics.Arcade.Body).bottom-37);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,beer:String(this.mission.beer),condition:String(this.mission.condition),checkpoint:this.mission.checkpoint,support:String(this.support??''),boatX:String(Math.round(this.decks[0]?.art.x??0))});}
}
