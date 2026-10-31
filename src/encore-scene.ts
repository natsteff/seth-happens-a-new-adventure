import Phaser from 'phaser';
import {FootAdventure} from './foot-adventure';
import {curtainCast,curtainMoment} from './curtain-cast.mjs';
import {gameAudio} from './audio';
type Actor=Phaser.GameObjects.Image|Phaser.GameObjects.Container;
export class Encore extends FootAdventure{
 constructor(){super({key:'encore',number:13,title:'Encore · View-only finale',width:1100,height:600,ground:550,startX:550,startY:550,instructions:'A curtain call for the whole cast. Watch them cross the stage and bow.\nAllison takes the penultimate bow. Seth gets the last one, naturally.\nMusic and applause follow your saved sound settings.\nReplay Encore any time from Choose Level. No movement or photo inputs required.'});}
 actors:Actor[]=[];castLabel!:Phaser.GameObjects.Text;lastActor=-1;lastApplause=-1;clapStop:(()=>void)|undefined;
 resetMission(){this.actors=[];this.lastActor=-1;this.lastApplause=-1;}
 preload(){super.preload();if(!this.textures.exists('encore-venue'))this.load.image('encore-venue','./assets/afterparty/venue-band-v3.png');for(const path of new Set(curtainCast.flatMap(c=>c.path?[c.path]:[])))if(!this.textures.exists(`curtain:${path}`))this.load.image(`curtain:${path}`,`./assets/${path}`);}
 buildWorld(){this.add.image(550,300,'encore-venue').setDisplaySize(1100,600).setDepth(-20);this.add.rectangle(550,515,1100,170,0x101927,.75).setDepth(-10);this.add.rectangle(550,552,1100,7,0xdbb17c).setDepth(-5);
  curtainCast.forEach((entry,i)=>{let actor:Actor;if(entry.path){const key=`curtain:${entry.path}`,texture=this.textures.get(key);if(entry.crop&&!texture.has(entry.id))texture.add(entry.id,0,...entry.crop as [number,number,number,number]);const frame=entry.crop?entry.id:undefined;const image=this.add.image(550,550,key,frame).setOrigin(.5,1);const height=['oakey','ellowyn'].includes(entry.id)?85:entry.id.startsWith('ghost')?175:210;image.setDisplaySize(height*image.width/image.height,height);if(entry.tint)image.setTint(entry.tint);actor=image;}
   else{const g=this.add.graphics();if(entry.animal==='goose'){g.fillStyle(0xe6e5d4).fillEllipse(0,-22,65,34).fillRoundedRect(22,-67,17,50,8).fillCircle(36,-65,15);g.fillStyle(0xe1a24e).fillTriangle(47,-71,70,-62,47,-56);}else if(entry.animal==='raccoon'){g.fillStyle(0x909897).fillEllipse(0,-23,70,38).fillCircle(36,-38,20);g.fillStyle(0x25333d).fillRect(20,-45,36,13).fillTriangle(20,-51,22,-68,32,-54).fillTriangle(38,-56,51,-68,55,-48);g.lineStyle(14,0x6a777b).lineBetween(-28,-23,-60,-44);}else{g.fillStyle(0x92a5b0).fillEllipse(0,-24,54,37).fillCircle(23,-46,15);g.fillStyle(0xd7ba83).fillTriangle(34,-50,54,-45,34,-40);}g.lineStyle(4,0xd6ab68).lineBetween(-12,-7,-15,0).lineBetween(12,-7,16,0);actor=this.add.container(550,550,[g]);}
   actor.setDepth(8).setVisible(false);this.actors.push(actor);
  });
  const crowd=this.add.graphics().setDepth(20);for(let x=20;x<1100;x+=45){crowd.fillStyle(0x070c15).fillCircle(x,604,26).fillRoundedRect(x-18,595,36,50,10);}
 }
 create(){super.create();this.cameras.main.stopFollow().setBounds(0,0,1100,600).setScroll(0,0);(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);this.portrait.setVisible(false);this.castLabel=this.screenText(550,102,'',23,'#ffdda7').setOrigin(.5).setBackgroundColor('#122439').setPadding(10,6);this.events.once('shutdown',()=>{this.clapStop?.();this.clapStop=undefined;});}
 motionHeld(){return true;}
 refreshHud(){this.hud.setText('LEVEL 13 · ENCORE · VIEW-ONLY FINALE');this.objective.setText('The whole cast takes a bow · Replay anytime from Choose Level');this.refreshControlCopy();}
 objectiveText(){const m=curtainMoment(this.elapsedMs);return m.done?'Curtain call complete. Thank you for playing.':`${m.index+1}/${curtainCast.length} · ${curtainCast[m.index].name}`;}
 tick(){const m=curtainMoment(this.elapsedMs);if(m.done){if(this.lastActor>=0)this.actors[this.lastActor].setVisible(false);this.castLabel.setText('THANK YOU FOR PLAYING!\nEncore is yours to replay anytime.').setPosition(550,300).setFontSize(32);this.won=true;this.clearMotion();this.physics.world.pause();return;}
  if(m.index!==this.lastActor){if(this.lastActor>=0)this.actors[this.lastActor].setVisible(false);this.lastActor=m.index;this.castLabel.setText(`${m.index+1}/${curtainCast.length} · ${curtainCast[m.index].name}`);}
  const actor=this.actors[m.index],phase=m.phase,x=phase<1900?Phaser.Math.Linear(-120,550,phase/1900):phase>3900?Phaser.Math.Linear(550,1240,(phase-3900)/2100):550;
  actor.setVisible(true).setX(x);const bow=m.bowing?Math.sin((phase-2000)/1500*Math.PI):0;actor.setAngle(bow*17);
  if(m.applause&&this.lastApplause!==m.index){this.lastApplause=m.index;this.clapStop=gameAudio.applaud();}
 }
 togglePause(){super.togglePause();if(this.paused){this.clapStop?.();this.clapStop=undefined;}}
 publishStatus(){super.publishStatus({cast:String(this.lastActor),castCount:String(curtainCast.length),viewOnly:'true'});}
}
