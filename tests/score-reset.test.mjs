import test from 'node:test';import assert from 'node:assert/strict';
import {resetOldScores,SCORE_RESET_KEY} from '../src/score-reset.mjs';
import {canUseElevator} from '../src/thai-mission.mjs';
import {rooftopDeliveryArea,floors} from '../src/mission.mjs';
test('upgrade disposes old scores and uploads once, preserves new scores, controls and unlocks',()=>{
 const map=new Map([['seth-happens-2.scores.v2','old'],['seth-new-adventure-scores-v1','old'],['seth-new-adventure.thai-scores.v1','old'],['seth-new-adventure.progress.v1','progress'],['seth-new-adventure.preferences.v1','controls']]);
 const storage={get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},deleted=[];
 resetOldScores(storage,{deleteDatabase:name=>deleted.push(name)});assert.equal(map.has('seth-happens-2.scores.v2'),false);assert.equal(map.has('seth-new-adventure-scores-v1'),false);assert.equal(map.has('seth-new-adventure.thai-scores.v1'),false);assert.equal(map.get('seth-new-adventure.progress.v1'),'progress');assert.equal(map.get('seth-new-adventure.preferences.v1'),'controls');assert.equal(map.get(SCORE_RESET_KEY),'done');assert.deepEqual(deleted,['seth-happens-2.online.v1']);map.set('seth-happens-2.scores.v3','new');resetOldScores(storage,{});assert.equal(map.get('seth-happens-2.scores.v3'),'new');
});
test('Thai and rooftop delivery includes Allison and retains objective/height requirements',()=>{
 const returning={phase:'return',food:true};for(const x of [40,80,180,260])assert.equal(canUseElevator(returning,x,510),true);assert.equal(canUseElevator(returning,80,470),false);assert.equal(canUseElevator({...returning,food:false},80,510),false);assert.equal(canUseElevator(returning,25,510),false);
 const home=floors[26];for(const x of [home.x-16,home.x+home.width*.32,home.x+home.width])assert.equal(rooftopDeliveryArea(x,home.y),true);assert.equal(rooftopDeliveryArea(home.x,home.y-40),false);assert.equal(rooftopDeliveryArea(home.x-40,home.y),false);
});
