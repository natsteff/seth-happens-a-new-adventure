import {readScores} from './scores.mjs';
export const PROGRESS_KEY='seth-new-adventure.progress.v1';
function valid(value){return value&&value.version===1&&typeof value.level1Completed==='boolean';}
export function createLevelProgress(storage){
  let unlocked=false,persistent=false;
  try{const value=JSON.parse(storage.getItem(PROGRESS_KEY));unlocked=!!(valid(value)&&value.level1Completed);persistent=unlocked;}catch{/* Missing/unavailable/corrupt storage starts locked. */}
  function save(){
    try{
      const raw=storage.getItem(PROGRESS_KEY),existing=raw===null?{}:JSON.parse(raw);
      if(raw!==null&&!valid(existing))return false;
      storage.setItem(PROGRESS_KEY,JSON.stringify({...existing,version:1,level1Completed:true}));return true;
    }catch{return false;}
  }
  // A saved finish in THIS game's rooftop record book already proves completion.
  // Original Seth Happens and Thai records never grant a rooftop unlock.
  if(!unlocked){try{if(readScores(storage).length){unlocked=true;persistent=save();}}catch{/* Preserve unreadable scores. */}}
  return {
    get unlocked(){return unlocked;},get persistent(){return persistent;},
    canPlay(level){return level==='rooftop'||(level==='thai'&&unlocked);},
    completeRooftop(){unlocked=true;persistent=save();return persistent;}
  };
}
