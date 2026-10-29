export const CONCERT={width:7300,height:1400,ground:1130,startX:160,deskX:3100,deskY:330,pitX:6700};
export const concertStairs=[
 ...Array.from({length:9},(_,i)=>({x:1390+i*180,y:1050-i*80,width:200,height:18})),
 {x:3010,y:330,width:260,height:24},
 ...Array.from({length:9},(_,i)=>({x:3350+i*180,y:410+i*80,width:200,height:18}))
];
export const shotNames=['SINGER AT THE MIC','GUITAR SOLO','WHOLE BAND · LIGHTS'];
export function photoWindow(ms){const phase=((ms%4000)+4000)%4000;return phase>=1100&&phase<=2700;}
export function photoBlocked(ms){return ((ms%5500)+5500)%5500<850;}
export function newConcertRun(){return {phase:'street',credentials:false,shots:0,misses:0,checkpoint:false,complete:false};}
export function concertAction(state,{x,bottom,action=false,photoMs=0}){
 let s={...state},event='';if(s.complete)return {state:s,event};
 if(s.phase==='street'&&x>=1300){s.phase='climb';event='entrance';}
 if(!s.credentials&&action&&Math.abs(x-CONCERT.deskX)<85&&Math.abs(bottom-CONCERT.deskY)<25){s.credentials=true;s.checkpoint=true;s.phase='descent';event='pass';}
 if(s.credentials&&s.phase==='descent'&&x>=4900){s.phase='floor';event='floor';}
 if(s.credentials&&s.phase==='floor'&&x>=CONCERT.pitX-70&&Math.abs(bottom-CONCERT.ground)<25&&action){s.phase='photo';event='pit';}
 else if(s.phase==='photo'&&action){
  if(photoWindow(photoMs)&&!photoBlocked(photoMs)){s.shots++;event='shot';if(s.shots===3){s.phase='complete';s.complete=true;event='complete';}}
  else{s.misses++;event=photoBlocked(photoMs)?'head':'blur';}
 }
 return {state:s,event};
}
export function concertScore(state,elapsedMs,hits){return state.complete?Math.max(0,4000+state.shots*750-Math.ceil(elapsedMs/1000)*5-hits*80-state.misses*100):0;}
