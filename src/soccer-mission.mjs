export const SOCCER={width:8100,height:1400,ground:1160,startX:180,startY:900};
export const soccerShots=[{name:'LOCKER-ROOM PLAYERS',x:4280,bottom:1160},{name:'TEAM RUNNING THROUGH THE TUNNEL',x:5580,bottom:1160},{name:'FIRST BIG GOAL',x:7110,bottom:1160},{name:'SECOND BIG GOAL',x:7110,bottom:1160}];
// Every opportunity repeats, with over a second of clear READY time. No one-shot failure.
export function soccerPhotoReady(ms,shot){const period=shot<2?3600:4600,phase=((ms%period)+period)%period;return phase>=1400&&phase<=2900;}
export function newSoccerRun(){return {shots:0,misses:0,complete:false};}
export function soccerAction(state,{x,bottom,action=false,photoMs=0}){
 const s={...state};let event='';if(s.complete||!action)return {state:s,event};const target=soccerShots[s.shots];
 if(Math.abs(x-target.x)>=95||Math.abs(bottom-target.bottom)>=26)return {state:s,event};
 if(!soccerPhotoReady(photoMs,s.shots)){s.misses++;event='miss';}
 else{s.shots++;event='shot';if(s.shots===soccerShots.length){s.complete=true;event='complete';}}
 return {state:s,event};
}
export function soccerScore(s,elapsedMs,hits){return s.complete?Math.max(0,8000-Math.ceil(elapsedMs/1000)*5-hits*90-s.misses*60):0;}
