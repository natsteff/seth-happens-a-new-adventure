export const HAUNTED={width:8500,height:1500,ground:1250,startX:160,doorX:1490,keyX:3990,keyY:290,atticCheckpointX:4140,houseLeft:1860,houseRight:5500,houseExitX:5430,woodsX:5700,exitX:8200,escapeMs:90000};
// Full floors prevent drop-through shortcuts; stair walking temporarily follows an enclosed flight.
export const hauntedFlights=[{x:2300,end:3000,bottom:1250,top:930},{x:4300,end:3700,bottom:930,top:610},{x:2500,end:3200,bottom:610,top:290}];
export const hauntedFloors=[1250,930,610,290].map(y=>({y,spans:[[1860,5500]]}));
export function newHauntedRun(){return {phase:'neighborhood',entered:false,key:false,outside:false,descended:0,checkpoint:false,atticCheckpoint:false,escapeStarted:/** @type {number|null} */(null),complete:false};}
export function ghostPhase(elapsedMs,offset=0){const phase=((elapsedMs+offset)%4000+4000)%4000;return phase<1100?'gone':phase<1600?'warning':phase<3400?'solid':'fade';}
export function escapeRemaining(state,elapsedMs){return state.escapeStarted===null?HAUNTED.escapeMs:Math.max(0,HAUNTED.escapeMs-(elapsedMs-state.escapeStarted));}
export function hauntedAction(state,{x,bottom,action=false,elapsedMs=0}){
 let s={...state},event='';if(s.complete)return {state:s,event};
 if(!s.entered&&action&&Math.abs(x-HAUNTED.doorX)<90&&Math.abs(bottom-HAUNTED.ground)<25){s.entered=true;s.phase='mansion';event='enter';}
 else if(s.entered&&!s.key&&action&&Math.abs(x-HAUNTED.keyX)<85&&Math.abs(bottom-HAUNTED.keyY)<25){s.key=true;s.phase='escape';s.escapeStarted=elapsedMs;event='key';}
 else if(s.key&&!s.outside&&!s.atticCheckpoint&&action&&Math.abs(x-HAUNTED.atticCheckpointX)<70&&Math.abs(bottom-HAUNTED.keyY)<25){s.atticCheckpoint=true;event='attic-checkpoint';}
 else if(s.entered&&!s.key&&!s.checkpoint&&action&&Math.abs(x-3300)<80&&Math.abs(bottom-930)<25){s.checkpoint=true;event='checkpoint';}
 else if(s.key&&!s.outside&&action&&Math.abs(x-HAUNTED.houseExitX)<75&&Math.abs(bottom-HAUNTED.ground)<25){if(s.descended!==7){event='stairs-required';}else if(escapeRemaining(s,elapsedMs)>0){s.outside=true;s.phase='woods';event='leave';}else event='timeout';}
 else if(s.key&&s.outside&&action&&Math.abs(x-HAUNTED.exitX)<85&&Math.abs(bottom-HAUNTED.ground)<25){if(escapeRemaining(s,elapsedMs)>0){s.complete=true;s.phase='complete';event='escape';}else event='timeout';}
 return {state:s,event};
}
export function hauntedScore(state,elapsedMs,hits){return state.complete?Math.max(0,5000+Math.ceil(escapeRemaining(state,elapsedMs)/1000)*20-hits*100-Math.ceil(elapsedMs/1000)*3):0;}
