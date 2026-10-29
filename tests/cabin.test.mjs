import test from 'node:test';
import assert from 'node:assert/strict';
import {CABIN,cabinLandings,cabinBoats,cabinBoatPosition,newCabinRun,cabinAction,cabinRecovery,cabinScore} from '../src/cabin-mission.mjs';
import {localReviewLevel,canEnterLevel} from '../src/review-entry.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
import {adventureScoreKey,readAdventureScores,saveAdventureScore} from '../src/adventure-records.mjs';
test('beer requires Action at the far cooler and a return Action at the cabin',()=>{
 let s=newCabinRun();const act=(x,bottom=800,action=true)=>{const r=cabinAction(s,{x,bottom,action});s=r.state;return r.event;};
 assert.equal(act(CABIN.homeX),'');assert.equal(cabinScore(s,10000,0),0);
 act(CABIN.coolerX,800,false);assert.equal(s.beer,false);
 act(CABIN.coolerX,650,true);assert.equal(s.beer,false);
 assert.equal(act(CABIN.coolerX),'pickup');assert.equal(s.phase,'return');assert.equal(s.checkpoint,'far-shore');
 assert.equal(act(CABIN.homeX,650),'');assert.equal(act(CABIN.homeX,800,false),'');
 assert.equal(act(CABIN.homeX),'delivery');assert.equal(s.complete,true);assert.ok(cabinScore(s,50000,2)>0);assert.equal(act(CABIN.homeX),'');
});
test('dry-land checkpoints progress outbound and reverse on return, water retains beer with bounded penalty',()=>{
 let s=newCabinRun();const step=(x,bottom)=>{s=cabinAction(s,{x,bottom}).state;};
 step(2130,800);assert.equal(s.checkpoint,'near-shore');step(2840,770);assert.equal(s.checkpoint,'island');step(5000,800);assert.equal(s.checkpoint,'far-shore');step(2840,770);assert.equal(s.checkpoint,'far-shore');
 s=cabinAction(s,{x:CABIN.coolerX,bottom:800,action:true}).state;
 step(2840,770);assert.equal(s.checkpoint,'island');step(2130,800);assert.equal(s.checkpoint,'near-shore');
 for(let i=0;i<12;i++)s=cabinRecovery(s);assert.equal(s.condition,0);assert.equal(s.beer,true);assert.equal(s.phase,'return');assert.equal(newCabinRun().condition,100);assert.equal(newCabinRun().beer,false);
});
test('lake platform motions are bounded, periodic and reachable in both directions',()=>{
 for(const b of cabinBoats){for(let t=0;t<b.period;t+=43){const p=cabinBoatPosition(b,t),q=cabinBoatPosition(b,t+16);assert.ok(Math.abs(p.x-b.x)<=b.range+1e-8);assert.ok(Math.abs(p.y-b.y)<=b.bob+1e-8);assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<4);}const p=cabinBoatPosition(b,0),q=cabinBoatPosition(b,b.period);assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<1e-8);}
 const route=[{left:2100,right:2300,y:800},...cabinBoats.slice(0,1).map(b=>({left:b.x-b.width/2,right:b.x+b.width/2,y:b.y})),{left:2690,right:3000,y:770},...cabinBoats.slice(1,4).map(b=>({left:b.x-b.width/2,right:b.x+b.width/2,y:b.y})),{left:3920,right:4320,y:770},...cabinBoats.slice(4).map(b=>({left:b.x-b.width/2,right:b.x+b.width/2,y:b.y})),{left:4700,right:6500,y:800}];
 for(let i=1;i<route.length;i++){assert.ok(route[i].left-route[i-1].right<=210);assert.ok(Math.abs(route[i].y-route[i-1].y)<=50);}
 assert.equal(cabinLandings[0].x,0);assert.equal(cabinLandings.at(-1).x+cabinLandings.at(-1).width,CABIN.width);
});
test('Carnival completion unlocks Cabin without altering earlier progress or records',()=>{
 const data=new Map([[PROGRESS_KEY,JSON.stringify({version:1,...Object.fromEntries([1,2,3,4,5,6,7].map(i=>[`level${i}Completed`,true]))})]]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 let p=createLevelProgress(storage);assert.equal(p.canPlay('cabin'),false);assert.equal(p.completeLevel('cabin'),false);p.completeLevel('carnival');p=createLevelProgress(storage);assert.equal(p.canPlay('cabin'),true);p.completeLevel('cabin');assert.equal(JSON.parse(data.get(PROGRESS_KEY)).level9Completed,true);
 saveAdventureScore(storage,'cabin',{id:'cabin-test',name:'Test',date:'2026-10-29T19:00:00Z',score:7000,elapsedMs:60000,hits:1});assert.equal(readAdventureScores(storage,'cabin').length,1);assert.equal(readAdventureScores(storage,'carnival').length,0);assert.notEqual(adventureScoreKey('cabin'),adventureScoreKey('carnival'));
});
test('local Cabin review bypass needs a dev build AND loopback host; production remains locked',()=>{
 for(const hostname of ['127.0.0.1','localhost','[::1]']){
  assert.equal(localReviewLevel({dev:true,hostname,search:'?level=cabin&review=cabin'}),'cabin');
  assert.equal(localReviewLevel({dev:false,hostname,search:'?level=cabin&review=cabin'}),null);
 }
 assert.equal(localReviewLevel({dev:true,hostname:'natsteff.github.io',search:'?review=cabin'}),null);
 assert.equal(localReviewLevel({dev:true,hostname:'localhost',search:'?level=cabin'}),null);
 const p=createLevelProgress(null);assert.equal(canEnterLevel('cabin',p.canPlay,'cabin'),true);assert.equal(p.canPlay('cabin'),false);assert.equal(canEnterLevel('cabin',p.canPlay,null),false);assert.equal(canEnterLevel('carnival',p.canPlay,'cabin'),false);
});
