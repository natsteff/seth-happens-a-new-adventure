import {test} from 'node:test';
import assert from 'node:assert/strict';
import {THAI,streetObstacles,newTakeoutRun,collectTakeout,foodWarmth,hitTakeout,canUseElevator,takeoutScore,trafficSpeed,vehicleFrontHurts,THAI_SCORE_KEY,readTakeoutScores,saveTakeoutScore} from '../src/thai-mission.mjs';
import {REGULAR_JUMP_SPEED} from '../src/mission.mjs';

test('takeout must be collected before elevator finish; there is no photo or soccer prerequisite',()=>{
  const start=newTakeoutRun();assert.equal(canUseElevator(start,THAI.homeX,THAI.ground),false);
  const carrying=collectTakeout(start,30000);assert.equal(carrying.phase,'return');assert.equal(carrying.food,true);
  assert.equal(collectTakeout(carrying,50000),carrying); // Cannot reset warmth with repeated pickup.
  assert.equal(canUseElevator(carrying,THAI.homeX,THAI.ground),true);
  assert.equal(canUseElevator(carrying,THAI.homeX,THAI.ground-90),false);
  assert.equal(canUseElevator(carrying,THAI.restaurantX,THAI.ground),false);
});
test('food starts cooling at pickup; hits damage food only on return and never delete the order',()=>{
  let run=newTakeoutRun();run=hitTakeout(run);assert.equal(run.hits,1);assert.equal(run.condition,100);assert.equal(run.heatLoss,0);
  assert.equal(foodWarmth(run,60000),0);
  run=collectTakeout(run,60000);assert.equal(foodWarmth(run,60000),100);assert.equal(foodWarmth(run,85000),75);
  run=hitTakeout(run);assert.equal(run.condition,88);assert.equal(foodWarmth(run,85000),67);
  run=hitTakeout(run,true);assert.equal(run.condition,68);assert.equal(foodWarmth(run,85000),55);
  for(let i=0;i<20;i++)run=hitTakeout(run,true);
  assert.equal(run.condition,0);assert.equal(foodWarmth(run,999999),0);assert.equal(run.food,true);
  assert.equal(canUseElevator(run,THAI.homeX,THAI.ground),true);
});
test('return traffic is harder, but identical food deliveries score fairly and stay bounded',()=>{
  const run=collectTakeout(newTakeoutRun(),30000);
  assert.ok(trafficSpeed(true)>trafficSpeed(false));
  assert.ok(takeoutScore(run,60000)>takeoutScore(hitTakeout(run,true),60000));
  assert.ok(takeoutScore(run,60000)>takeoutScore(run,100000));
  assert.equal(takeoutScore(newTakeoutRun(),60000),0);
  assert.ok(takeoutScore(run,60000)<=4800);
});
test('mandatory tall obstacles have jumpable approaches in both directions with existing regular jump',()=>{
  const peak=REGULAR_JUMP_SPEED**2/(2*1050);
  for(const direction of [1,-1]){
    const obstacles=direction===1?streetObstacles:[...streetObstacles].reverse();let previous=null;
    for(const obstacle of obstacles){
      const gap=previous?(direction===1?obstacle.x-(previous.x+previous.width):previous.x-(obstacle.x+obstacle.width)):Infinity;
      const launchHeight=previous&&gap<180?previous.height:0;
      const rise=obstacle.height-launchHeight;
      assert.ok(rise<peak,`${direction}: ${obstacle.kind} at ${obstacle.x}, rise ${rise}`);
      if(previous&&gap<180&&rise>0){
        const flight=(REGULAR_JUMP_SPEED+Math.sqrt(REGULAR_JUMP_SPEED**2-2*1050*rise))/1050;
        assert.ok(gap+28<275*flight,`regular walking jump reaches ${obstacle.x}`);
      }
      previous=obstacle;
    }
  }
});
test('Thai records are separate, deduplicated, ranked, and never overwrite corrupt saves',()=>{
  const original=new Map([['seth-happens-scores-v1','original'],['seth-new-adventure-scores-v1','rooftop'],['seth-new-adventure.preferences.v1','preferences']]);
  const data=new Map(original),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  const entry={id:'a',name:'TEST',date:'2026-10-28T18:00:00Z',score:3400,condition:100,warmth:70,hits:0,elapsedMs:60000};
  assert.deepEqual(readTakeoutScores(storage),[]);saveTakeoutScore(storage,entry);saveTakeoutScore(storage,entry);
  saveTakeoutScore(storage,{...entry,id:'b',score:3500});assert.equal(readTakeoutScores(storage).length,2);assert.equal(readTakeoutScores(storage)[0].id,'b');
  for(const [key,value] of original)assert.equal(data.get(key),value);
  data.set(THAI_SCORE_KEY,'corrupt');assert.throws(()=>saveTakeoutScore(storage,entry));assert.equal(data.get(THAI_SCORE_KEY),'corrupt');
  data.set(THAI_SCORE_KEY,'[]');assert.throws(()=>saveTakeoutScore(storage,{...entry,elapsedMs:THAI.limitMs}));
});

test('moving vehicles hurt only at their front, with safe roofs and rear contacts in both directions',()=>{
 assert.equal(vehicleFrontHurts({left:true},-1),true);
 assert.equal(vehicleFrontHurts({right:true},-1),false);
 assert.equal(vehicleFrontHurts({right:true},1),true);
 assert.equal(vehicleFrontHurts({left:true},1),false);
 for(const direction of [-1,1]){
  assert.equal(vehicleFrontHurts({up:true,left:true,right:true},direction),false);
  assert.equal(vehicleFrontHurts({up:true},direction),false);
  assert.equal(vehicleFrontHurts({},direction),false);
 }
 assert.equal(vehicleFrontHurts({left:true,right:true},0),false);
});
