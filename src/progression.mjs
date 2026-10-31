import {readScores} from './scores.mjs';
import {readTakeoutScores} from './thai-mission.mjs';
import {readScooterScores} from './scooter-mission.mjs';
export const PROGRESS_KEY='seth-new-adventure.progress.v1';
export const LEVEL_ORDER=['rooftop','thai','scooter','concert','haunted','zombie','snow','carnival','cabin','grocery','soccer'];
function valid(v){if(!v||v.version!==1||typeof v.level1Completed!=='boolean')return false;let previous=true;for(let i=1;i<=LEVEL_ORDER.length;i++){const value=v[`level${i}Completed`];if(value!==undefined&&typeof value!=='boolean'||value&&!previous)return false;previous=!!value;}return true;}
export function createLevelProgress(storage){
 const completed=new Set();let persistent=false;
 try{const v=JSON.parse(storage.getItem(PROGRESS_KEY));if(valid(v)){for(let i=1;i<=LEVEL_ORDER.length;i++)if(v[`level${i}Completed`])completed.add(i-1);persistent=completed.size>0;}}catch{}
 function save(){try{const raw=storage.getItem(PROGRESS_KEY),existing=raw===null?{}:JSON.parse(raw);if(raw!==null&&!valid(existing))return false;for(let i=1;i<=LEVEL_ORDER.length;i++)existing[`level${i}Completed`]=completed.has(i-1);storage.setItem(PROGRESS_KEY,JSON.stringify({...existing,version:1}));return true;}catch{return false;}}
 // Historical, validated finishes in this game qualify only after prior levels do.
 for(const [i,read] of [readScores,readTakeoutScores,readScooterScores].entries())if(!completed.has(i)&&(i===0||completed.has(i-1))){try{if(read(storage).length){completed.add(i);persistent=save();}}catch{}}
 function canPlay(level){const i=LEVEL_ORDER.indexOf(level);return i===0||i>0&&completed.has(i-1);}
 function completeLevel(level){const i=LEVEL_ORDER.indexOf(level);if(i<0||!canPlay(level))return false;completed.add(i);persistent=save();return persistent;}
 return{
  get unlocked(){return canPlay('thai');},get scooterUnlocked(){return canPlay('scooter');},get concertUnlocked(){return canPlay('concert');},get hauntedUnlocked(){return canPlay('haunted');},get persistent(){return persistent;},canPlay,completeLevel,
  completeRooftop(){return completeLevel('rooftop');},completeTakeout(){return completeLevel('thai');},completeScooter(){return completeLevel('scooter');}
 };
}
