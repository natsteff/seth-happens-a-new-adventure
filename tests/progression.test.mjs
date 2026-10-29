import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
import {SCORE_KEY} from '../src/scores.mjs';
const store=(values=[])=>{const data=new Map(values);return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('new players can only start Level 1; completing it unlocks either level across reloads',()=>{
 const s=store(),progress=createLevelProgress(s);
 assert.equal(progress.canPlay('rooftop'),true);assert.equal(progress.canPlay('thai'),false);assert.equal(progress.canPlay('unknown'),false);
 assert.equal(progress.completeRooftop(),true);assert.equal(progress.canPlay('thai'),true);
 const reloaded=createLevelProgress(s);assert.equal(reloaded.canPlay('thai'),true);assert.equal(reloaded.canPlay('rooftop'),true);
 assert.equal(reloaded.persistent,true);
});
test('progress remains unlocked if score records are cleared and never rewrites records/settings',()=>{
 const s=store([[SCORE_KEY,'[]'],['seth-happens-scores-v1','original'],['seth-new-adventure.preferences.v1','settings']]);
 createLevelProgress(s).completeRooftop();
 assert.equal(s.data.get(SCORE_KEY),'[]');assert.equal(s.data.get('seth-happens-scores-v1'),'original');assert.equal(s.data.get('seth-new-adventure.preferences.v1'),'settings');
 s.data.delete(SCORE_KEY);assert.equal(createLevelProgress(s).unlocked,true);
});
test('existing saved finishes in this game qualify, while original-game and Thai records do not',()=>{
 const entry={id:'done',name:'TEST',score:2000,date:'2026-10-28T18:00:00Z',falls:0,squishes:0,bumps:0,photos:2,latePhotos:0,beer:true};
 const s=store([['seth-happens-scores-v1',JSON.stringify([entry])],['seth-new-adventure.thai-scores.v1','[{}]']]);
 assert.equal(createLevelProgress(s).unlocked,false);
 s.data.set(SCORE_KEY,JSON.stringify([entry]));assert.equal(createLevelProgress(s).unlocked,true);assert.equal(JSON.parse(s.data.get(PROGRESS_KEY)).level1Completed,true);
 s.data.delete(SCORE_KEY);assert.equal(createLevelProgress(s).unlocked,true);
});
test('unavailable/corrupt storage does not bypass the lock or prevent a session unlock',()=>{
 for(const raw of ['bad',JSON.stringify({version:2,level1Completed:true}),JSON.stringify({version:1,level1Completed:'yes'})]){
  const s=store([[PROGRESS_KEY,raw]]),p=createLevelProgress(s);assert.equal(p.unlocked,false);
  assert.equal(p.completeRooftop(),false);assert.equal(p.unlocked,true);assert.equal(s.data.get(PROGRESS_KEY),raw);
 }
 const p=createLevelProgress(null);assert.equal(p.unlocked,false);assert.equal(p.completeRooftop(),false);assert.equal(p.canPlay('thai'),true);
});
test('Level 3 requires a Thai finish; both unlocks persist without scores',()=>{
 const s=store(),p=createLevelProgress(s);assert.equal(p.canPlay('scooter'),false);assert.equal(p.completeTakeout(),false);
 p.completeRooftop();assert.equal(p.canPlay('scooter'),false);p.completeTakeout();assert.equal(p.canPlay('scooter'),true);
 const q=createLevelProgress(s);for(const key of ['rooftop','thai','scooter'])assert.equal(q.canPlay(key),true);
});
test('old progress schema keeps Level 2 open while Level 3 remains locked',()=>{
 const s=store([[PROGRESS_KEY,JSON.stringify({version:1,level1Completed:true})]]),p=createLevelProgress(s);assert.equal(p.canPlay('thai'),true);assert.equal(p.canPlay('scooter'),false);
 p.completeTakeout();assert.equal(createLevelProgress(s).canPlay('scooter'),true);
});
test('valid prior Thai results unlock Level 3 only after rooftop qualification',()=>{
 const record={id:'thai',name:'TEST',score:2000,date:'2026-10-28T18:00:00Z',condition:80,warmth:50,hits:1,elapsedMs:100000};
 const s=store([['seth-new-adventure.thai-scores.v1',JSON.stringify([record])]]);assert.equal(createLevelProgress(s).canPlay('scooter'),false);
 s.data.set(PROGRESS_KEY,JSON.stringify({version:1,level1Completed:true}));assert.equal(createLevelProgress(s).canPlay('scooter'),true);
});
test('Level 3 session unlock preserves corrupt saves and rejects inconsistent flags',()=>{
 const raw=JSON.stringify({version:1,level1Completed:false,level2Completed:true}),s=store([[PROGRESS_KEY,raw]]),p=createLevelProgress(s);
 assert.equal(p.canPlay('scooter'),false);p.completeRooftop();p.completeTakeout();assert.equal(p.canPlay('scooter'),true);assert.equal(p.persistent,false);assert.equal(s.data.get(PROGRESS_KEY),raw);
});
