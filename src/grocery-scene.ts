import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {GROCERY,groceries,newGroceryRun,groceryAction,groceryScore,grocerySlippery} from './grocery-mission.mjs';
import {gameAudio} from './audio';
import {carryAnchor} from './carry-anchor.mjs';
export class GroceryGauntlet extends FootAdventure{
 constructor(){super({key:'grocery',number:10,title:'Grocery Store Gauntlet',...GROCERY,startY:GROCERY.ground,instructions:'Allison’s list: milk, bread and eggs. Three things. How hard can it be?\nCross the parking lot, search DAIRY, BAKERY and FARM FRESH.\nF / Action collects items. Use crates to climb the bakery and egg displays.\nWatch the runaway carts and slippery floors. Pay at checkout, then leave →'});}
 mission=newGroceryRun();itemArt=new Map<string,Phaser.GameObjects.Container>();basket!:Phaser.GameObjects.Container;gate?:Phaser.GameObjects.Rectangle;
 resetMission(){this.mission=newGroceryRun();this.itemArt=new Map();}
 sign(x:number,y:number,label:string,color=0x347c78){this.add.rectangle(x,y,360,67,color).setStrokeStyle(3,0xc5d6bb).setDepth(-3);this.text(x,y,label,26,'#fff0c7').setOrigin(.5).setDepth(-2);}
 buildWorld(){
  const g=this.add.graphics().setDepth(-20);g.fillStyle(0x253f53).fillRect(0,0,GROCERY.width,1120);g.fillStyle(0x68757c).fillRect(0,580,1100,320);
  for(let x=0;x<1100;x+=110)g.lineStyle(3,0xb9b6a3).lineBetween(x,900,x+90,810);
  g.fillStyle(0x202b3c).fillRect(1100,340,4800,560);g.fillStyle(0x44564d).fillRect(1100,490,4800,410);
  for(let x=1120;x<5850;x+=240){g.fillStyle(0xf2e6b3,.65).fillRoundedRect(x,420,160,8,4);g.lineStyle(2,0x748071,.3).lineBetween(x,500,x,900);}
  this.platform(0,900,GROCERY.width,200,0x495258);
  for(let x=1120;x<5880;x+=100)g.lineStyle(1,0x9caa94,.35).lineBetween(x,900,x+40,980);
  this.sign(620,550,'SETH’S QUICK SHOP',0x306b78);this.text(220,720,'MILK · BREAD · EGGS\n“JUST THREE THINGS.”',19,'#ffe0ad');
  this.add.image(380,900,'allison').setOrigin(.5,1).setDisplaySize(59,86).setDepth(3);this.text(380,775,'“Stick to the list!”',17,'#ffdba2').setOrigin(.5);
  this.add.rectangle(1110,720,100,360,0x23343f).setStrokeStyle(5,0xa5c7b5).setDepth(-2);this.text(1120,525,'ENTER →',19,'#b4efdf').setOrigin(.5);
  for(const [left,width,label,color] of [[1360,900,'DAIRY',0x4c9cb1],[2850,900,'BAKERY',0xa86e43],[4020,850,'FARM FRESH',0x5f8963]] as const){
   this.sign(left+width/2,515,label,color);
   const shelves=this.add.graphics().setDepth(-5);shelves.fillStyle(0x263b43).fillRoundedRect(left,575,width,280,8);
   for(let row=0;row<3;row++){shelves.fillStyle(0xb3ad8c).fillRect(left,650+row*80,width,9);for(let x=left+18;x<left+width-20;x+=48){shelves.fillStyle(row%2?0xcba775:0xd2d9c7).fillRoundedRect(x,610+row*80,27,39,3);shelves.fillStyle(color).fillRect(x+3,622+row*80,21,12);}}
  }
  // A forgiving sequence of short steps leads to the upper bakery display.
  for(const [x,y,w] of [[2880,820,120],[3020,750,130],[3160,700,300],[4110,850,130],[4270,810,320]]){this.platform(x,y,w,900-y,0x866f52);const wood=this.add.graphics().setDepth(2);wood.lineStyle(2,0xd2bc8c).strokeRect(x+7,y+9,w-14,Math.max(8,890-y));}
  for(const item of groceries){const box=this.add.graphics();if(item.id==='milk'){box.fillStyle(0xe5eddf).fillRoundedRect(-15,-53,30,53,4);box.fillStyle(0x64a7c2).fillRect(-15,-33,30,20);box.fillStyle(0xafdce8).fillRect(-10,-59,20,7);}else if(item.id==='bread'){box.fillStyle(0xdbac69).fillRoundedRect(-25,-36,50,36,14);for(let x=-13;x<20;x+=12)box.lineStyle(3,0xf0d5a1).lineBetween(x,-29,x-5,-16);}else{box.fillStyle(0xb4c5a6).fillRoundedRect(-30,-24,60,24,5);for(let x=-20;x<=20;x+=20)box.fillStyle(0xf0e5c5).fillEllipse(x,-25,16,21);}
   const label=this.text(0,-82,`${item.name}\nF / ACTION`,15,'#ffecac').setOrigin(.5).setAlign('center');this.itemArt.set(item.id,this.add.container(item.x,item.bottom,[box,label]).setDepth(7));}
  for(const x of [2450,4750]){g.fillStyle(0x74bcc4,.4).fillRoundedRect(x,885,300,14,7);this.text(x+150,830,'CAUTION · SLIPPERY',15,'#ffdf8e').setOrigin(.5);}
  this.cartTexture();for(const [i,x] of [700,2210,2670,3820,4940].entries())this.hazard('shop-cart',x,883,100,1800+i*150,62,34).setDisplaySize(88,58);
  for(const [i,x] of [1530,2400,3650,4660,5230].entries())this.hazard(i%2?'scruffy':'concert-fans',x,866,45,2700+i*80,30,68);
  this.sign(5510,520,'CHECKOUT →',0x95634c);this.add.rectangle(5520,861,220,78,0x607d74).setDepth(2);this.add.rectangle(5520,819,230,8,0x26393c).setDepth(3);this.add.rectangle(5575,792,48,42,0x1b343e).setStrokeStyle(3,0xc5c3aa).setDepth(3);this.text(5520,690,'ALL 3 ITEMS REQUIRED\nF / ACTION · PAY',18,'#ffe4a7').setOrigin(.5).setAlign('center');
  this.gate=this.platform(5870,500,20,400,0xa48155);this.text(5880,620,'PAY\nBEFORE\nEXIT',17,'#ffe5b4').setOrigin(.5).setAlign('center');
  this.add.rectangle(6220,775,180,250,0x20414b).setStrokeStyle(5,0x9bc6b4).setDepth(-3);this.sign(6220,600,'EXIT',0x397c64);this.text(6220,738,'F / ACTION',18,'#b5efda').setOrigin(.5);
 }
 cartTexture(){if(this.textures.exists('shop-cart'))return;const g=this.add.graphics();g.lineStyle(4,0xb7cbd0).strokeRect(14,8,58,30).lineBetween(3,3,13,8).lineBetween(14,38,22,46).lineBetween(22,46,69,46);for(let x=24;x<70;x+=12)g.lineBetween(x,10,x,36);g.fillStyle(0x21333e).fillCircle(25,51,7).fillCircle(65,51,7);g.generateTexture('shop-cart',85,60);g.destroy();}
 afterPlayer(){const g=this.add.graphics();g.fillStyle(0xcca36e).fillRoundedRect(-19,-3,38,29,4);g.lineStyle(3,0xe8d7ad).strokeRoundedRect(-16,-20,32,32,8);this.basket=this.add.container(0,0,[g]).setDepth(11).setVisible(false);}
 objectiveText(){return this.mission.complete?'SHOPPING COMPLETE · Exactly three things. Eventually.':this.mission.paid?'PAID ✓ · Head right to EXIT · F / Action':`LIST ${this.mission.items.length}/3 · ${groceries.map(item=>`${this.mission.items.includes(item.id)?'✓':'□'} ${item.name}`).join('  ')} · ${this.mission.items.length===3?'CHECKOUT →':'Search the departments →'}`;}
 movementVelocity(direction:number,sprint:boolean,delta:number){const target=super.movementVelocity(direction,sprint,delta);if(!grocerySlippery(this.player.x))return target;const current=(this.player.body as Phaser.Physics.Arcade.Body).velocity.x;return Phaser.Math.Linear(current,target,Math.min(1,delta/350));}
 tick(_delta:number,action:boolean){const body=this.player.body as Phaser.Physics.Arcade.Body;const result=groceryAction(this.mission,{x:this.player.x,bottom:body.bottom,action});this.mission=result.state;
  if(this.player.x>1200&&this.checkpoint.x<1200)this.checkpoint={x:1210,bottom:900};
  for(const item of groceries)if(!this.mission.items.includes(item.id)&&Math.abs(this.player.x-item.x)<85&&Math.abs(body.bottom-item.bottom)<26)this.prompt.setVisible(true).setText(`F / Action · Collect ${item.name}`);
  if(Math.abs(this.player.x-GROCERY.checkoutX)<85)this.prompt.setVisible(true).setText('F / Action · Checkout');if(Math.abs(this.player.x-GROCERY.exitX)<85)this.prompt.setVisible(true).setText('F / Action · Leave with groceries');
  if(groceries.some(item=>item.id===result.event)){this.itemArt.get(result.event)?.setVisible(false);gameAudio.play('pickup');this.say(`${result.event.toUpperCase()} ✓ · ${this.mission.items.length}/3. Allison’s list remains undefeated.`);}
  if(result.event==='missing')this.say('Cashier: “Milk, bread AND eggs. The list is not a suggestion.”');
  if(result.event==='unpaid')this.say('Please pay at the checkout first. This is a shopping trip, Seth.');
  if(result.event==='checkout'){this.gate?.destroy();this.checkpoint={x:5980,bottom:900};gameAudio.play('pickup');this.say('PAID. The receipt is longer than the shopping list. EXIT →');}
  if(result.event==='complete')this.finish('THREE THINGS. ONE ADVENTURE.', 'Milk ✓   Bread ✓   Eggs ✓\nGroceries paid for. Allison: “What took so long?”',groceryScore(this.mission,this.elapsedMs,this.hits));
 }
 drawExtras(){const h=carryAnchor({x:this.player.x,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,facing:this.facing,frame:Number(this.portrait.frame.name),falling:this.portrait.texture.key==='seth-fall'});this.basket.setPosition(h.x,h.y).setVisible(this.mission.items.length>0&&!this.won);}
 publishStatus(){super.publishStatus({items:this.mission.items.join(','),paid:String(this.mission.paid),phase:this.mission.complete?'complete':this.mission.paid?'exit':'shopping',slippery:String(grocerySlippery(this.player.x))});}
}
