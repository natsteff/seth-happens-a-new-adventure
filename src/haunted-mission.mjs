export const HAUNTED={width:6700,height:1500,ground:1250,startX:160,doorX:1490,keyX:3990,keyY:290,exitX:6410,escapeMs:90000};
export const hauntedStairs=[
 ...Array.from({length:4},(_,i)=>({x:2300+i*160,y:1170-i*80,width:180})),
 ...Array.from({length:4},(_,i)=>({x:2700-i*160,y:850-i*80,width:180})),
 ...Array.from({length:4},(_,i)=>({x:3000+i*160,y:530-i*80,width:180})),
 ...Array.from({length:12},(_,i)=>({x:4290+i*160,y:370+i*80,width:180}))
];
export function newHauntedRun(){return {phase:'neighborhood',entered:false,key:false,checkpoint:false,escapeStarted:/** @type {number|null} */(null),complete:false};}
export function ghostPhase(elapsedMs,offset=0){const phase=((elapsedMs+offset)%4000+4000)%4000;return phase<1100?'gone':phase<1600?'warning':phase<3400?'solid':'fade';}
export function escapeRemaining(state,elapsedMs){return state.escapeStarted===null?HAUNTED.escapeMs:Math.max(0,HAUNTED.escapeMs-(elapsedMs-state.escapeStarted));}
export function hauntedAction(state,{x,bottom,action=false,elapsedMs=0}){
 let s={...state},event='';if(s.complete)return {state:s,event};
 if(!s.entered&&action&&Math.abs(x-HAUNTED.doorX)<90&&Math.abs(bottom-HAUNTED.ground)<25){s.entered=true;s.phase='mansion';event='enter';}
 else if(s.entered&&!s.key&&action&&Math.abs(x-HAUNTED.keyX)<85&&Math.abs(bottom-HAUNTED.keyY)<25){s.key=true;s.phase='escape';s.escapeStarted=elapsedMs;event='key';}
 else if(s.entered&&!s.key&&!s.checkpoint&&action&&Math.abs(x-3300)<80&&Math.abs(bottom-930)<25){s.checkpoint=true;event='checkpoint';}
 else if(s.key&&action&&Math.abs(x-HAUNTED.exitX)<85&&Math.abs(bottom-HAUNTED.ground)<25){if(escapeRemaining(s,elapsedMs)>0){s.complete=true;s.phase='complete';event='escape';}else event='timeout';}
 return {state:s,event};
}
export function hauntedScore(state,elapsedMs,hits){return state.complete?Math.max(0,5000+Math.ceil(escapeRemaining(state,elapsedMs)/1000)*20-hits*100-Math.ceil(elapsedMs/1000)*3):0;}
