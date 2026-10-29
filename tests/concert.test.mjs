import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CONCERT,concertStairs,newConcertRun,concertAction,photoWindow,photoBlocked,concertScore} from '../src/concert-mission.mjs';
import {createLevelProgress} from '../src/progression.mjs';
import {readAdventureScores,saveAdventureScore,adventureScoreKey} from '../src/adventure-records.mjs';
const storage=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('photo pit requires upper press pass, then descent before the three-shot finale',()=>{
 let s=newConcertRun();s=concertAction(s,{x:CONCERT.pitX,bottom:CONCERT.ground,action:true}).state;assert.equal(s.phase,'climb');assert.equal(s.shots,0);
 s=concertAction(s,{x:CONCERT.deskX,bottom:CONCERT.deskY,action:true}).state;assert.equal(s.credentials,true);assert.equal(s.checkpoint,true);assert.equal(s.phase,'descent');
 s=concertAction(s,{x:CONCERT.pitX,bottom:CONCERT.ground,action:true}).state;assert.equal(s.phase,'photo');assert.equal(s.shots,0);
 for(let i=0;i<3;i++)s=concertAction(s,{action:true,x:CONCERT.pitX,bottom:CONCERT.ground,photoMs:1500}).state;
 assert.equal(s.complete,true);assert.equal(s.shots,3);assert.ok(concertScore(s,100000,2)>0);assert.equal(concertScore(newConcertRun(),0,0),0);
 assert.deepEqual(concertAction(s,{action:true,x:CONCERT.pitX,bottom:CONCERT.ground,photoMs:1500}).state,s);
});
test('missed/obscured shots do not count or prevent retry and windows are generous',()=>{
 let s={...newConcertRun(),phase:'photo',credentials:true};
 for(const ms of [100,3000]){const r=concertAction(s,{x:0,bottom:0,action:true,photoMs:ms});s=r.state;assert.equal(s.shots,0);}
 assert.equal(s.misses,2);assert.equal(photoBlocked(100),true);assert.equal(photoWindow(1500),true);assert.equal(photoWindow(2500),true);
 s=concertAction(s,{x:0,bottom:0,action:true,photoMs:1500}).state;assert.equal(s.shots,1);
});
test('all ascending stair rises stay inside the existing regular jump reach',()=>{
 const ascent=concertStairs.slice(0,10);for(let i=1;i<ascent.length;i++){const rise=ascent[i-1].y-ascent[i].y;assert.ok(rise<=100);assert.ok(ascent[i].x-ascent[i-1].x<=200);assert.ok(ascent[i-1].width>=180);}
 assert.equal(ascent.at(-1).y,CONCERT.deskY);
});
test('Scooter completion unlocks Concert persistently without saving scores',()=>{
 const store=storage(),p=createLevelProgress(store);assert.equal(p.canPlay('concert'),false);assert.equal(p.completeScooter(),false);p.completeRooftop();p.completeTakeout();assert.equal(p.canPlay('concert'),false);p.completeScooter();assert.equal(p.canPlay('concert'),true);assert.equal(createLevelProgress(store).canPlay('concert'),true);
});
test('new adventure records are independent and corrupt saves stay untouched',()=>{
 const s=storage(),r={id:'concert',name:'ABC',date:'2026-10-28T22:00:00Z',score:5000,elapsedMs:100000,hits:2};
 saveAdventureScore(s,'concert',r);saveAdventureScore(s,'concert',r);assert.equal(readAdventureScores(s,'concert').length,1);assert.equal(readAdventureScores(s,'haunted').length,0);
 s.data.set(adventureScoreKey('concert'),'bad');assert.throws(()=>saveAdventureScore(s,'concert',r));assert.equal(s.data.get(adventureScoreKey('concert')),'bad');
});
