import {test} from 'node:test';
import assert from 'node:assert/strict';
import {radioTracks,DEFAULT_RADIO_TRACK,nextRadioTrack,radioShortcut,unlockedRadioTracks,defaultLevelTrack} from '../src/radio-playlist.mjs';
import {existsSync} from 'node:fs';
test('eight local soundtracks follow the approved level order',()=>{
 assert.deepEqual(radioTracks.map(t=>t.title),['Arcade Staircase','Thai Food Run','Scooter Run','Eye of the Stairwell (Leads Take Me Away!)','The Haunted Happy Hour','The Beer of Destiny','Twenty-Six Floors of Celts','Go Seth Go']);
 assert.equal(DEFAULT_RADIO_TRACK,0);
 for(const t of radioTracks)assert.ok(existsSync(new URL('../public/audio/music/'+t.file,import.meta.url)));
});
test('previous and next wrap only through available stations',()=>{
 assert.equal(nextRadioTrack(0,-1),0);assert.equal(nextRadioTrack(0,1),0);
 const all=unlockedRadioTracks(()=>true);
 assert.equal(nextRadioTrack(0,-1,all),7);assert.equal(nextRadioTrack(7,1,all),0);
 assert.equal(nextRadioTrack(2,1,all),3);assert.equal(nextRadioTrack(2,-1,all),1);
});
test('radio shortcuts select 1–8, zero means off, Tab stays available for focus',()=>{
 for(let i=1;i<=8;i++){assert.equal(radioShortcut('Digit'+i).track,i-1);assert.equal(radioShortcut('Numpad'+i).track,i-1);}
 assert.equal(radioShortcut('Digit0').off,true);assert.equal(radioShortcut('Numpad0').off,true);
 assert.equal(radioShortcut('BracketLeft').step,-1);assert.equal(radioShortcut('BracketRight').step,1);
 assert.equal(radioShortcut('Backslash'),null);assert.equal(radioShortcut('Slash'),null);
 for(const key of ['Tab','Digit9','KeyP','KeyF','KeyS','KeyV'])assert.equal(radioShortcut(key),null);
});

test('each sequential level completion unlocks exactly its next soundtrack',async()=>{
 const {createLevelProgress,LEVEL_ORDER}=await import('../src/progression.mjs');
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const progress=createLevelProgress(storage);
 for(let i=0;i<LEVEL_ORDER.length;i++){
  assert.deepEqual(unlockedRadioTracks(progress.canPlay),Array.from({length:Math.min(i+1,radioTracks.length)},(_,j)=>j));
  assert.equal(defaultLevelTrack(LEVEL_ORDER[i]),i<8?i:0);
  assert.equal(progress.canPlay(LEVEL_ORDER[i]),true);
  progress.completeLevel(LEVEL_ORDER[i]);
 }
 assert.deepEqual(unlockedRadioTracks(createLevelProgress(storage).canPlay),[0,1,2,3,4,5,6,7]);
});
test('Concert default uses the supplied gameplay variant, not its champion track',()=>{
 assert.equal(defaultLevelTrack('concert'),3);
 assert.equal(unlockedRadioTracks(level=>level==='thai').includes(3),false);
 assert.notEqual(radioTracks[3].file,'eye-of-the-stairwell.mp3');
});
