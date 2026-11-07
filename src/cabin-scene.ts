import {carryAnchor} from './carry-anchor.mjs';
import {loadCast,walkingCastPerson} from './cast';
import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {gameAudio} from './audio';
import {CABIN,cabinLandings,cabinBoats,cabinBoatPosition,newCabinRun,cabinAction,cabinCheckpoints,cabinRecovery,cabinCollision,cabinScore} from './cabin-mission.mjs';
type Deck={art:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body;hull:Phaser.GameObjects.Graphics};
type CabinWalker=ReturnType<typeof walkingCastPerson>&{home:number;phase:number};
export class CabinFever extends FootAdventure{
 constructor(){super({key:'cabin',number:9,title:'Cabin Fever',...CABIN,startY:CABIN.ground,instructions:'A cooler full of beer. Naturally, it is on the OTHER shore.\nHead right through the woods. Jump between boats, islands and the wobbly dock.\nLand on the deck or canoe rim. Wait for boats to come closer. Dodge walkers.\nF / Action at the cooler, then bring the beer LEFT to the cabin. Water returns you to a checkpoint.'});}
 preload(){super.preload();loadCast(this,'cabin');this.load.image('cabin-unicorn-beer','./assets/cabin/unicorn-haze-v1.png');}
 private recoveries=0;
 mission=newCabinRun();decks:Deck[]=[];walkers:CabinWalker[]=[];support:number|null=null;supportOffset=0;returnHazards=false;beerArt!:Phaser.GameObjects.Container;pickupBeer!:Phaser.GameObjects.Image;coolerLid!:Phaser.GameObjects.Rectangle;
 resetMission(){this.recoveries=0;this.mission=newCabinRun();this.decks=[];this.walkers=[];this.support=null;this.supportOffset=0;this.returnHazards=false;}
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
  const beerTexture=this.textures.get('cabin-unicorn-beer');if(!beerTexture.has('pack'))beerTexture.add('pack',0,158,16,1025,1173);
  this.pickupBeer=this.add.image(CABIN.coolerX,751,'cabin-unicorn-beer','pack').setOrigin(.5,1).setDisplaySize(64.5,64.5*1173/1025).setDepth(7);
  this.coolerLid=this.add.rectangle(CABIN.coolerX,749,94,10,0xf2e8c6).setDepth(5);this.text(CABIN.coolerX,655,'THE COOLER\nF / ACTION · PICK UP BEER',21,'#ffe0a0').setOrigin(.5).setAlign('center');
  this.add.image(CABIN.homeX+75,800,'allison').setOrigin(.5,1).setDisplaySize(58,84).setDepth(6);
  for(const [i,x] of [600,1290,5480,6240].entries()){
   const walker=walkingCastPerson(this,'cabin',i,x,CABIN.ground,90);
   walker.art.setDepth(5);
   this.walkers.push({...walker,home:x,phase:i*1.7});
  }
  this.animalTextures();for(const [i,x] of [750,1240,1830,5320,5740].entries())this.hazard(i%2?'cabin-raccoon':'cabin-goose',x,784,60+i*9,2500+i*210,38,32);
  this.hazard('cabin-deer',1650,769,67,3200,77,62);
  this.hazard('cabin-black-bear',5960,776,68,3600,92,48);
 }
 tree(x:number,bottom:number,scale=1){const g=this.add.graphics().setDepth(-8);g.fillStyle(0x5c493e).fillRect(x-12*scale,bottom-210*scale,24*scale,210*scale);for(let i=0;i<3;i++)g.fillStyle(i%2?0x3f654f:0x294c43).fillTriangle(x-95*scale,bottom-(65+i*55)*scale,x,bottom-(240+i*35)*scale,x+95*scale,bottom-(65+i*55)*scale);}
 cabin(x:number){const g=this.add.graphics().setDepth(-5);g.fillStyle(0x735445).fillRect(x-130,650,260,150);g.fillStyle(0x3a3b41).fillTriangle(x-155,650,x,550,x+155,650);for(let y=666;y<800;y+=23)g.lineStyle(2,0xa7835f).lineBetween(x-130,y,x+130,y);g.fillStyle(0xffd794).fillRect(x-92,683,50,48);g.fillStyle(0x4b4545).fillRect(x+20,680,60,120);g.lineStyle(3,0x4b4545).lineBetween(x-67,683,x-67,731).lineBetween(x-92,707,x-42,707);}
 animalTextures(){
  if(!this.textures.exists('cabin-goose')){const g=this.add.graphics();g.fillStyle(0xe5e2d5).fillEllipse(32,37,46,25).fillRoundedRect(47,11,12,28,5).fillCircle(56,13,10);g.fillStyle(0xe5a35d).fillTriangle(63,10,79,15,63,19);g.fillStyle(0x23333b).fillCircle(59,10,2);g.lineStyle(3,0xe5a35d).lineBetween(23,47,20,57).lineBetween(42,47,45,57);g.generateTexture('cabin-goose',80,60);g.destroy();}
  if(!this.textures.exists('cabin-raccoon')){const g=this.add.graphics();g.fillStyle(0x8a8c8b).fillEllipse(37,37,44,25).fillCircle(60,28,14);g.lineStyle(10,0x747d7e).lineBetween(18,37,3,26);g.lineStyle(4,0x323b44).lineBetween(13,33,8,28);g.fillStyle(0x323b44).fillRoundedRect(48,23,26,10,4).fillTriangle(48,18,49,8,57,16).fillTriangle(63,14,71,8,73,21);g.fillStyle(0xf2e5b9).fillCircle(55,27,2).fillCircle(65,27,2);g.lineStyle(4,0x323b44).lineBetween(26,46,24,56).lineBetween(48,46,50,56);g.generateTexture('cabin-raccoon',80,60);g.destroy();}

  if(!this.textures.exists('cabin-deer')){
   const g=this.add.graphics();
   g.lineStyle(5,0x685342).lineBetween(28,44,23,72).lineBetween(58,45,60,71);
   g.lineStyle(5,0xa97d54).lineBetween(21,44,28,71).lineBetween(64,43,72,71);
   g.fillStyle(0x3b332f).fillRect(23,69,8,4).fillRect(67,69,8,4);
   g.fillStyle(0xa97d54).fillEllipse(42,40,55,28).fillTriangle(55,41,66,18,76,37);
   g.fillStyle(0xd8b886).fillEllipse(53,49,26,9).fillEllipse(77,22,22,15);
   g.fillStyle(0x77523d).fillTriangle(67,18,59,10,73,14).fillTriangle(76,16,84,9,84,18);
   g.fillStyle(0x4f3b31).fillCircle(84,24,3).fillCircle(79,20,1.8);
   g.fillStyle(0xeee4ca).fillTriangle(16,39,9,30,12,44);
   g.lineStyle(2,0xa98c6e).lineBetween(72,16,70,4).lineBetween(70,8,65,5)
    .lineBetween(77,15,79,3).lineBetween(79,8,85,4);
   g.generateTexture('cabin-deer',94,74);g.destroy();
  }
  if(!this.textures.exists('cabin-black-bear')){
   const g=this.add.graphics();
   g.fillStyle(0x191c21).fillRoundedRect(22,37,14,21,5).fillRoundedRect(72,38,14,20,5);
   g.fillStyle(0x292e32).fillEllipse(48,32,76,40).fillEllipse(74,27,48,41);
   g.fillStyle(0x3f4447).fillEllipse(42,20,59,17);
   g.fillStyle(0x23262b).fillRoundedRect(19,37,15,22,5).fillRoundedRect(76,39,15,20,5)
    .fillCircle(91,28,15).fillCircle(85,15,6).fillCircle(99,16,5);
   g.fillStyle(0x796655).fillEllipse(100,34,18,11);
   g.fillStyle(0x15191e).fillCircle(107,31,3.5);
   g.fillStyle(0xd4b492).fillCircle(98,25,1.5);
   g.generateTexture('cabin-black-bear',112,60);g.destroy();
  }
 }
 private boatHull(kind:string,width:number){
  const g=this.add.graphics().setDepth(3),left=-width/2,right=width/2;
  if(kind==='canoe'){
   g.fillStyle(0x253c47).fillPoints([{x:left,y:0},{x:left+23,y:25},{x:right-28,y:29},
    {x:right-12,y:15},{x:right,y:0}],true);
   g.fillStyle(0x9a5142).fillPoints([{x:left+7,y:4},{x:left+28,y:20},{x:right-31,y:24},
    {x:right-13,y:12},{x:right-5,y:4}],true);
   g.fillStyle(0xe3c299).fillRoundedRect(left,0,width,4,2);
   g.fillStyle(0x694735).fillRect(left+width*.27,5,20,5).fillRect(left+width*.66,5,20,5);
   return g;
  }
  if(kind==='pontoon'){
   g.fillStyle(0x394e55).fillRoundedRect(left+5,13,width-10,23,10);
   g.fillStyle(0x91a8ad).fillRoundedRect(left+3,8,width-6,23,10);
   g.fillStyle(0xc2d0cf).fillRoundedRect(left+9,10,width-18,5,2);
   g.fillStyle(0x49565c).fillRect(left+16,25,width-32,3);
   g.fillStyle(0x4d6167).fillRect(left+21,8,9,22).fillRect(right-31,8,9,22);
  }else{
   for(const x of [left+12,-18,right-47]){
    g.fillStyle(0x303b42).fillRoundedRect(x,8,35,21,4);
    g.fillStyle(0x637077).fillRect(x+4,11,27,4);
   }
  }
  g.fillStyle(0x755944).fillRoundedRect(left,0,width,11,3);
  g.fillStyle(0xc1a380).fillRect(left+3,0,width-6,4);
  for(let x=left+12;x<right-6;x+=18){
   g.lineStyle(1,0x513e35).lineBetween(x,1,x,8);
   g.fillStyle(0x978774).fillCircle(x-3,6,1);
  }
  return g;
 }
 afterPlayer(){
  cabinBoats.forEach(boat=>{
   const p=cabinBoatPosition(boat,0);
   const art=this.add.rectangle(p.x,p.y+9,boat.width,18,0xffffff,0);
   this.physics.add.existing(art);
   const body=art.body as Phaser.Physics.Arcade.Body;
   body.setAllowGravity(false).setImmovable(true);body.friction.x=0;
   body.checkCollision.left=false;body.checkCollision.right=false;body.checkCollision.down=false;
   const hull=this.boatHull(boat.kind,boat.width).setPosition(p.x,p.y);
   this.decks.push({art,body,hull});
   this.physics.add.collider(this.player,art,()=>{const rider=this.player.body as Phaser.Physics.Arcade.Body;if(body.touching.up&&rider.velocity.y<0)rider.setVelocityY(0);});
  });
  const pack=this.add.image(0,0,'cabin-unicorn-beer','pack').setDisplaySize(12,12*1173/1025);this.beerArt=this.add.container(0,0,[pack]).setDepth(10).setVisible(false);
 }
 objectiveText(){return this.mission.complete?'BEER DELIVERED · The cabin weekend can finally begin.':this.mission.beer?`← RETURN TO CABIN · Beer ${this.mission.condition}% · Checkpoint: ${this.mission.checkpoint}`:'COOLER ON THE FAR SHORE → · Woods, docks, boats. What could go wrong?';}
 scoreDetails(){return {elapsedMs:Math.floor(this.elapsedMs),condition:this.mission.condition};}
 takeHit(line='Watch the crowd!'){
  const hits=this.hits,recoveries=this.recoveries,before=this.mission.condition;
  super.takeHit(line);
  // Base acceptance/iframes decide damage. A lethal hit already called our respawn.
  if(this.hits!==hits&&this.recoveries===recoveries){this.mission=cabinCollision(this.mission);if(this.mission.condition!==before)this.say(`${line} Beer ${this.mission.condition}% (−${before-this.mission.condition}%).`);}
 }
 respawn(){const before=this.mission.condition;this.recoveries++;this.support=null;this.mission=cabinRecovery(this.mission);super.respawn();if(this.mission.condition!==before)this.say(`Back to the checkpoint. Beer ${this.mission.condition}% (−${before-this.mission.condition}%).`);}
 tick(delta:number,action:boolean){
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  if(body.bottom>910&&this.player.x>2300&&this.player.x<4700){this.hits++;this.respawn();this.say(this.mission.beer?`Lake checkpoint. Beer ${this.mission.condition}% (−15%, minimum 0%). Your dignity did not survive.`:'Lake checkpoint. Swimming was not in the weekend itinerary.');return;}
  const result=cabinAction(this.mission,{x:this.player.x,bottom:body.bottom,action});this.mission=result.state;
  if(result.event){this.checkpoint={...cabinCheckpoints[this.mission.checkpoint as keyof typeof cabinCheckpoints]};if(result.event==='checkpoint'){this.stamina=100;this.say('Dry land checkpoint. Geese still have right of way.');}else if(result.event==='pickup'){this.coolerLid.setAngle(-18);this.returnHazards=true;for(const h of this.hazards)h.period*=.7;this.say('Beer acquired. Allison: “Great. Now bring it BACK.” The wildlife is less patient.');gameAudio.play('pickup');}else if(result.event==='delivery'){this.finish('CABIN FEVER: CURED.',`Allison: “You were gone so long I nearly drank water.”\nBeer delivered · Condition ${this.mission.condition}%`,cabinScore(this.mission,this.elapsedMs,this.hits));return;}}
  if(!this.mission.beer&&Math.abs(this.player.x-CABIN.coolerX)<95&&Math.abs(body.bottom-800)<22)this.prompt.setVisible(true).setText('F / Action · Collect the beer');else if(this.mission.beer&&Math.abs(this.player.x-CABIN.homeX)<95&&Math.abs(body.bottom-800)<22)this.prompt.setVisible(true).setText('F / Action · Deliver the beer');
  for(const walker of this.walkers){
   const cycle=this.elapsedMs/1150+walker.phase;
   const step=this.elapsedMs/115+walker.phase;
   const x=walker.home+Math.sin(cycle)*69;
   walker.art.setPosition(x,CABIN.ground+Math.sin(step*2)*1.4).setScale(Math.cos(cycle)<0?-1:1,1);
   walker.legs.forEach((leg,i)=>leg.setAngle(Math.sin(step+i*Math.PI)*9));
   if(Math.abs(this.player.x-x)<26&&Math.abs(this.player.y-(CABIN.ground-35))<42){
    this.takeHit('Watch the walkers!');
   }
  }
  let seat=this.support===null?undefined:this.decks[this.support];
  if(seat&&(body.velocity.y < -180||Math.abs(body.bottom-seat.body.top)>18||Math.abs(this.supportOffset)>seat.body.width/2+10)){seat=undefined;this.support=null;}
  if(!seat&&body.velocity.y>=-180){const i=this.decks.findIndex(d=>Math.abs(body.bottom-d.body.top)<8&&Math.abs(body.center.x-d.body.center.x)<d.body.width/2+10);if(i>=0){this.support=i;seat=this.decks[i];this.supportOffset=body.center.x-seat.body.center.x;}}
  if(seat){this.supportOffset+=body.velocity.x*delta/1000;body.position.x=seat.body.center.x+this.supportOffset-body.halfWidth;body.position.y=seat.body.top-body.height;body.setVelocityY(Math.max(0,seat.body.velocity.y));body.blocked.down=true;body.blocked.none=false;body.updateCenter();}
  for(const [i,d] of this.decks.entries()){const p=cabinBoatPosition(cabinBoats[i],this.elapsedMs);d.body.setVelocity((p.x-d.art.x)*1000/Math.max(delta,1),(p.y+9-d.art.y)*1000/Math.max(delta,1));}
 }
 drawExtras(){
  for(const deck of this.decks)deck.hull.setPosition(deck.art.x,deck.art.y-9);
  for(const hazard of this.hazards){
   if(hazard.kind==='cabin-deer'||hazard.kind==='cabin-black-bear'){
    const phase=this.elapsedMs/hazard.period*2*Math.PI;
    hazard.art.setFlipX(Math.cos(phase)<0);
   }
  }
  this.pickupBeer.setVisible(!this.mission.beer);
  const hand=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.beerArt.setVisible(this.mission.beer&&!this.won).setPosition(hand.x,hand.y+4);}
 publishStatus(){super.publishStatus({phase:this.mission.phase,beer:String(this.mission.beer),condition:String(this.mission.condition),checkpoint:this.mission.checkpoint,support:String(this.support??''),boatX:String(Math.round(this.decks[0]?.art.x??0))});}
}
