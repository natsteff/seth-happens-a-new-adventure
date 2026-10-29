import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HAUNTED,hauntedStairs,newHauntedRun,hauntedAction,ghostPhase,escapeRemaining,hauntedScore} from '../src/haunted-mission.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
import {defaultLevelTrack} from '../src/radio-playlist.mjs';
test('mansion requires entry, attic key and timely exit in sequence',()=>{
 let s=newHauntedRun();const act=(x,bottom,elapsedMs=0)=>{const r=hauntedAction(s,{x,bottom,elapsedMs,action:true});s=r.state;return r.event;};
 assert.equal(act(HAUNTED.keyX,HAUNTED.keyY),'');assert.equal(act(HAUNTED.exitX,HAUNTED.ground),'');
 assert.equal(act(HAUNTED.doorX,HAUNTED.ground),'enter');assert.equal(act(3300,930),'checkpoint');assert.equal(s.checkpoint,true);
 assert.equal(act(HAUNTED.keyX,HAUNTED.keyY,10000),'key');assert.equal(escapeRemaining(s,20000),80000);
 assert.equal(act(3300,930,21000),'');assert.equal(act(HAUNTED.exitX,HAUNTED.ground,30000),'escape');assert.equal(s.complete,true);assert.ok(hauntedScore(s,30000,2)>0);
});
test('expired escape does not complete, and ghost warning/fade phases are harmless',()=>{
 const s={...newHauntedRun(),entered:true,key:true,escapeStarted:1000,phase:'escape'};
 const r=hauntedAction(s,{x:HAUNTED.exitX,bottom:HAUNTED.ground,action:true,elapsedMs:91000});assert.equal(r.event,'timeout');assert.equal(r.state.complete,false);assert.equal(hauntedScore(s,91000,0),0);
 assert.deepEqual([0,1200,2000,3600,4000].map(ms=>ghostPhase(ms)),['gone','warning','solid','fade','gone']);assert.equal(ghostPhase(0,2000),'solid');
});
test('all four-floor staircase runs use reachable regular-jump rises and clear treads',()=>{
 for(const [start,end] of [[0,4],[4,8],[8,12],[12,24]]){const run=hauntedStairs.slice(start,end);for(let i=1;i<run.length;i++){assert.equal(Math.abs(run[i].y-run[i-1].y),80);assert.equal(Math.abs(run[i].x-run[i-1].x),160);assert.ok(run[i-1].width>=160);}}
 assert.equal(hauntedStairs[11].y,HAUNTED.keyY);assert.equal(hauntedStairs.at(-1).y,HAUNTED.ground);
});
test('Concert completion unlocks Haunted persistently, including old four-level saves',()=>{
 const data=new Map([[PROGRESS_KEY,JSON.stringify({version:1,level1Completed:true,level2Completed:true,level3Completed:true})]]),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},p=createLevelProgress(store);
 assert.equal(p.canPlay('concert'),true);assert.equal(p.canPlay('haunted'),false);p.completeLevel('concert');assert.equal(p.canPlay('haunted'),true);assert.equal(createLevelProgress(store).canPlay('haunted'),true);
 assert.equal(defaultLevelTrack('haunted'),4);assert.equal(p.canPlay('zombie'),false);
});
