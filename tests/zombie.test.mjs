import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZOMBIE,zombiePlatforms,newZombieRun,zombieAction,zombieContact,zombieScore,zombieBatTarget,zombieCheckpointPositions} from '../src/zombie-mission.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
test('survival cannot finish before truck; boarding requires Action at ground-level truck',()=>{
 let s=newZombieRun();const act=(x,bottom,action=true)=>{const r=zombieAction(s,{x,bottom,action});s=r.state;return r.event;};
 assert.equal(act(ZOMBIE.exitX,800),'');assert.equal(act(ZOMBIE.truckX,670),'');assert.equal(act(ZOMBIE.truckX,800,false),'');assert.equal(act(ZOMBIE.truckX,800),'truck');assert.equal(act(ZOMBIE.breakdownX-1,800),'');
 assert.equal(act(ZOMBIE.breakdownX,700),'breakdown');
 assert.equal(s.truck,false);
 assert.equal(act(ZOMBIE.exitX,800),'');
 assert.equal(zombieScore(s,1000,0),0);
 const dismount=zombieAction(s,{x:ZOMBIE.breakdownX,bottom:800,breakdownFinished:true});
 assert.equal(dismount.event,'dismount');s=dismount.state;
 assert.equal(act(ZOMBIE.truckX,800),'');
 assert.equal(act(ZOMBIE.exitX-1,800),'');
 assert.equal(act(ZOMBIE.exitX,800),'escape');assert.ok(zombieScore(s,60000,2)>0);assert.equal(act(ZOMBIE.exitX,800),'');
});
test('Allison defends herself, truck crushes, on-foot contact damages, jumping avoids contact',()=>{
 const c={truck:false,playerX:100,playerY:770,zombieX:100,zombieY:770,allyX:600,allyY:770};
 assert.equal(zombieContact(c),'hit');assert.equal(zombieContact({...c,playerY:650}),'');assert.equal(zombieContact({...c,truck:true}),'crush');assert.equal(zombieContact({...c,allyX:130}),'allison');assert.equal(zombieContact({...c,allyX:130,allyY:500}),'hit');
});
test('saved Haunted finish unlocks Zombie and can persist its completion for the next level',()=>{
 const data=new Map([[PROGRESS_KEY,JSON.stringify({version:1,...Object.fromEntries([1,2,3,4,5].map(i=>[`level${i}Completed`,true]))})]]),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const p=createLevelProgress(store);assert.equal(p.canPlay('zombie'),true);assert.equal(p.completeLevel('zombie'),true);assert.equal(JSON.parse(data.get(PROGRESS_KEY)).level6Completed,true);assert.equal(createLevelProgress(store).canPlay('zombie'),true);
});

test('bins provide a forgiving sprint takeoff to each taller bus roof',()=>{
 for(const [bin,bus] of [[zombiePlatforms[0],zombiePlatforms[1]],[zombiePlatforms[2],zombiePlatforms[3]]]){
  const rise=bin[1]-bus[1],flight=(490+Math.sqrt(490**2-2*1050*rise))/1050;
  assert.ok(rise>0&&rise<490**2/(2*1050));
  // Take off from the bin center, retaining a useful margin before descending to roof height.
  assert.ok(bus[0]-(bin[0]+bin[2]/2)<385*flight-30);
 }
});

test('bat selects the nearest live zombie within horizontal and vertical reach',()=>{
 const zombie=(x,floor=800,alive=true)=>({art:{x},floor,alive});
 const closest=zombie(66);
 assert.equal(zombieBatTarget(100,770,[zombie(102,670),zombie(101,800,false),zombie(190),zombie(155),closest]),closest);
 assert.equal(zombieBatTarget(100,770,[zombie(185),zombie(102,670)]),undefined);
});

test('trailing Allison takes out zombies at contact range and truck impacts use the truck footprint',()=>{
 const c={truck:false,playerX:150,playerY:770,zombieX:80,zombieY:770,allyX:72,allyY:770};
 assert.equal(zombieContact(c),'allison');
 assert.equal(zombieContact({...c,zombieX:33}),'');
 assert.equal(zombieContact({...c,truck:true}),'crush');
 assert.equal(zombieContact({...c,truck:true,playerY:690}),'');
 assert.equal(ZOMBIE.exitX-ZOMBIE.truckStartX,3*(6600-2970));
 assert.equal(ZOMBIE.breakdownX-ZOMBIE.truckStartX,ZOMBIE.exitX-ZOMBIE.breakdownX);
});

test('dismount clearance spaces live ground zombies away from Seth and Allison',()=>{
 const checkpoint=ZOMBIE.breakdownX+140;
 const zombie=(offset,alive=true,floor=ZOMBIE.ground)=>({art:{x:checkpoint+offset},alive,floor});
 const left=zombie(-78),right=zombie(0),next=zombie(280),far=zombie(600);
 const moves=zombieCheckpointPositions(checkpoint,[next,left,far,right,zombie(0,false),zombie(0,true,670)]);
 assert.deepEqual(moves,[{zombie:left,x:checkpoint-250},{zombie:right,x:checkpoint+250},{zombie:next,x:checkpoint+315}]);
});
