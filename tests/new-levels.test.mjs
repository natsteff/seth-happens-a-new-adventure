import test from 'node:test';
import assert from 'node:assert/strict';
import {GROCERY,groceries,newGroceryRun,groceryAction,groceryScore,grocerySlippery} from '../src/grocery-mission.mjs';
import {SOCCER,soccerShots,newSoccerRun,soccerAction,soccerPhotoReady,soccerScore} from '../src/soccer-mission.mjs';
import {createLevelProgress,LEVEL_ORDER,PROGRESS_KEY} from '../src/progression.mjs';
test('grocery requires each distinct item, payment, and a deliberate exit; no duplicate pickups or early completion',()=>{
 let s=newGroceryRun();const act=(x,bottom=900,action=true)=>{const r=groceryAction(s,{x,bottom,action});s=r.state;return r.event;};
 assert.equal(act(GROCERY.exitX),'unpaid');assert.equal(act(GROCERY.checkoutX),'missing');assert.equal(groceryScore(s,0,0),0);
 for(const item of groceries){assert.equal(act(item.x,item.bottom,false),'');assert.equal(act(item.x,item.bottom+80),'');assert.equal(act(item.x,item.bottom),item.id);assert.equal(act(item.x,item.bottom),'');if(s.items.length<3)assert.equal(act(GROCERY.checkoutX),'missing');}
 assert.equal(s.items.length,3);assert.equal(act(GROCERY.exitX),'unpaid');assert.equal(act(GROCERY.checkoutX),'checkout');assert.equal(s.complete,false);assert.equal(act(GROCERY.exitX),'complete');assert.ok(groceryScore(s,100000,3)>0);assert.equal(act(GROCERY.exitX),'');assert.equal(newGroceryRun().items.length,0);
 assert.equal(grocerySlippery(2600),true);assert.equal(grocerySlippery(4400),false);
});
test('soccer enforces locker, tunnel, first goal, second goal in order with endlessly repeatable opportunities',()=>{
 let s=newSoccerRun();const act=(target,photoMs=2000,action=true)=>{const r=soccerAction(s,{x:target.x,bottom:target.bottom,photoMs,action});s=r.state;return r.event;};
 assert.equal(act(soccerShots[2]),'');assert.equal(act(soccerShots[1]),'');assert.equal(soccerScore(s,0,0),0);
 for(let i=0;i<4;i++){const target=soccerShots[i];assert.equal(act({...target,bottom:target.bottom+80}),'');assert.equal(act(target,2000,false),'');assert.equal(act(target,500),'miss');assert.equal(s.shots,i);assert.equal(act(target,2000),i===3?'complete':'shot');}
 assert.equal(s.complete,true);assert.equal(s.shots,4);assert.equal(s.misses,4);assert.ok(soccerScore(s,120000,2)>0);assert.equal(act(soccerShots[3]),'');
 for(let i=0;i<4;i++){const cycle=i<2?3600:4600;for(let run=0;run<20;run++){assert.equal(soccerPhotoReady(run*cycle+2000,i),true);assert.equal(soccerPhotoReady(run*cycle+500,i),false);}}
 assert.equal(SOCCER.startY,900);
});
test('legacy nine-level progression survives and new levels require Cabin then Grocery completion',()=>{
 const values=new Map([[PROGRESS_KEY,JSON.stringify({version:1,...Object.fromEntries(Array.from({length:8},(_,i)=>[`level${i+1}Completed`,true]))})]]),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 const p=createLevelProgress(storage);assert.equal(p.canPlay('cabin'),true);assert.equal(p.canPlay('grocery'),false);assert.equal(p.completeLevel('grocery'),false);p.completeLevel('cabin');assert.equal(p.canPlay('grocery'),true);assert.equal(p.canPlay('soccer'),false);p.completeLevel('grocery');assert.equal(p.canPlay('soccer'),true);p.completeLevel('soccer');const q=createLevelProgress(storage);for(const key of LEVEL_ORDER)assert.equal(q.canPlay(key),true);assert.equal(q.canPlay('last-call'),false);
});
