import test from 'node:test';import assert from 'node:assert/strict';
import {finalScore,runScore} from '../src/mission.mjs';
import {carnivalScore,carnivalBonus,newCarnivalRun} from '../src/carnival-mission.mjs';
import {cabinCollision,cabinRecovery,cabinScore,newCabinRun} from '../src/cabin-mission.mjs';
import {payload,validate,saveLocal,localScores,LOCAL_KEY,submission} from '../src/online-score-model.mjs';
import {bookPath} from '../src/record-book.mjs';
const clean={falls:0,squishes:0,bumps:0},photos=new Set([0,1]);
const record=(extra={})=>({id:'test',name:'Test',date:'2026-11-07T19:00:00Z',score:8000,elapsedMs:60000,beer:true,photos:2,latePhotos:0,bonus:6000,...clean,hits:0,condition:100,...extra});
test('Rooftop rewards clean/slightly slower over reckless; uncapped whole-total penalties and photo values preserved',()=>{
 assert.equal(finalScore(true,photos,{falls:1,squishes:1,bumps:3},new Set(),44000),8450);
 assert.equal(finalScore(true,photos,clean,new Set(),49000),9100);
 assert.equal(finalScore(true,photos,{...clean,bumps:1},new Set(),46000),9200);
 assert.equal(finalScore(true,photos,{...clean,bumps:20},new Set(),30000),7000);
 assert.equal(finalScore(true,photos,{falls:100,squishes:100,bumps:100},new Set(),1000),0);
 assert.equal(finalScore(true,photos,clean,new Set([1]),60000),7875);
 assert.equal(runScore(false,new Set([0]),clean),1250);
 assert.equal(finalScore(false,new Set(),{falls:100,squishes:100,bumps:100},new Set(),1000,true),-10000);
});
test('Carnival bonuses retain incentive but one collision can outweigh coaster detour; each bonus only once',()=>{
 const base={...newCarnivalRun(),complete:true};
 assert.equal(carnivalScore(base,62000,0),6128);
 assert.equal(carnivalScore({...base,wheelBonus:true,coasterBonus:true},74000,1),6181);
 assert.equal(carnivalScore({...base,coasterBonus:true},66000,1),6079);
 assert.equal(carnivalScore({...base,wheelBonus:true,coasterBonus:true},0,0),6725);
 let state={...newCarnivalRun(),clue:true,crossed:true};state=carnivalBonus(state,2820,340).state;assert.equal(carnivalBonus(state,2820,340).event,'');state=carnivalBonus(state,4800,590).state;assert.equal(carnivalBonus(state,4800,590).event,'');
});
test('Cabin cargo changes only after pickup, clamps and applies one event-sized loss',()=>{
 let s=newCabinRun();assert.equal(cabinCollision(s).condition,100);assert.equal(cabinRecovery(s).condition,100);
 s={...s,beer:true,phase:'return'};assert.equal(cabinCollision(s).condition,95);assert.equal(cabinRecovery(s).condition,85);
 for(let i=0;i<5;i++)s=cabinCollision(s);s=cabinRecovery(s);assert.equal(s.condition,60); // five normal hits and one lethal-hit respawn, not six collisions plus respawn
 assert.equal(cabinRecovery({...s,condition:5}).condition,0);assert.equal(cabinCollision({...s,condition:0}).condition,0);assert.equal(cabinCollision({...s,complete:true}).condition,60);
 assert.equal(cabinScore({...s,complete:true},100000,6),6800);
});
test('current payload totals match all three revised missions, reject forged totals and reject obsolete totals',()=>{
 const rooftop=payload('rooftop',record({score:7400,falls:2}));assert.equal(rooftop.ruleset,undefined);assert.throws(()=>validate({...rooftop,score:7980}));assert.throws(()=>validate({...rooftop,score:7980}));
 const carnival=payload('carnival',record({score:6365,wheelBonus:true,coasterBonus:true}));assert.equal(carnival.score,6365);assert.throws(()=>validate({...carnival,score:7640}));
 const cabin=payload('cabin',record({condition:85,score:7875,hits:1}));assert.equal(cabin.score,7875);assert.throws(()=>validate({...cabin,condition:100}));
});
test('single active local and online board for every level; old payloads cannot synchronize',async()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const old={...payload('rooftop',record({score:7400,falls:2})),ruleset:'risk-v2'};
 await assert.rejects(submission(old));saveLocal(storage,'rooftop',record({score:7400,falls:2}));assert.equal(localScores(storage,'rooftop').length,1);
 for(const l of ['rooftop','thai','scooter','concert','haunted','zombie','snow','carnival','cabin','grocery','soccer','lastcall'])assert.match(bookPath(l),/record-book\/live$/);
});
