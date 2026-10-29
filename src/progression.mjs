import {readScores} from './scores.mjs';
import {readTakeoutScores} from './thai-mission.mjs';
export const PROGRESS_KEY='seth-new-adventure.progress.v1';
function valid(v){return v&&v.version===1&&typeof v.level1Completed==='boolean'&&(v.level2Completed===undefined||typeof v.level2Completed==='boolean')&&(!v.level2Completed||v.level1Completed);}
export function createLevelProgress(storage){
 let unlocked=false,scooterUnlocked=false,persistent=false;
 try{const v=JSON.parse(storage.getItem(PROGRESS_KEY));if(valid(v)){unlocked=v.level1Completed;scooterUnlocked=!!v.level2Completed;persistent=unlocked;}}catch{}
 function save(){try{const raw=storage.getItem(PROGRESS_KEY),existing=raw===null?{}:JSON.parse(raw);if(raw!==null&&!valid(existing))return false;storage.setItem(PROGRESS_KEY,JSON.stringify({...existing,version:1,level1Completed:unlocked,level2Completed:scooterUnlocked}));return true;}catch{return false;}}
 // Only this game's validated finish records count; never original-game records.
 if(!unlocked){try{if(readScores(storage).length){unlocked=true;persistent=save();}}catch{}}
 // A prior Thai finish is evidence for Level 3 only after Level 1 is qualified.
 if(unlocked&&!scooterUnlocked){try{if(readTakeoutScores(storage).length){scooterUnlocked=true;persistent=save();}}catch{}}
 return{
  get unlocked(){return unlocked;},get scooterUnlocked(){return scooterUnlocked;},get persistent(){return persistent;},
  canPlay(level){return level==='rooftop'||level==='thai'&&unlocked||level==='scooter'&&scooterUnlocked;},
  completeRooftop(){unlocked=true;persistent=save();return persistent;},
  completeTakeout(){if(!unlocked)return false;scooterUnlocked=true;persistent=save();return persistent;}
 };
}
