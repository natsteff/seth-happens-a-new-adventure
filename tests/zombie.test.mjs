import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZOMBIE,zombiePlatforms,newZombieRun,zombieAction,zombieContact,zombieScore} from '../src/zombie-mission.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
test('survival cannot finish before truck; boarding requires Action at ground-level truck',()=>{
 let s=newZombieRun();const act=(x,bottom,action=true)=>{const r=zombieAction(s,{x,bottom,action});s=r.state;return r.event;};
 assert.equal(act(ZOMBIE.exitX,800),'');assert.equal(act(ZOMBIE.truckX,670),'');assert.equal(act(ZOMBIE.truckX,800,false),'');assert.equal(act(ZOMBIE.truckX,800),'truck');assert.equal(act(ZOMBIE.exitX-1,800),'');assert.equal(zombieScore(s,1000,0),0);assert.equal(act(ZOMBIE.exitX,800),'escape');assert.ok(zombieScore(s,60000,2)>0);assert.equal(act(ZOMBIE.exitX,800),'');
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
