export const LASTCALL={width:6500,height:1120,ground:900,startX:180,bagX:3290,bagY:720,exitX:6250,limitMs:120000};
export const lastCallPlatforms=[{x:920,y:840,w:100},{x:1060,y:780,w:180},{x:2000,y:830,w:100},{x:2150,y:770,w:200},{x:2920,y:840,w:100},{x:3060,y:780,w:130},{x:3210,y:720,w:260},{x:4140,y:830,w:110},{x:4280,y:770,w:210},{x:5200,y:840,w:100},{x:5340,y:780,w:190}];
export function newLastCallRun(){return {bag:false,complete:false};}
export function lastCallRemaining(ms){return Math.max(0,LASTCALL.limitMs-ms);}
export function barChaos(ms){return ms<40000?0:ms<80000?1:2;}
export function lastCallAction(state,{x,bottom,elapsedMs=0,action=false}){const s={...state};let event='';if(s.complete)return {state:s,event};if(lastCallRemaining(elapsedMs)===0)return {state:s,event:'timeout'};if(!action)return {state:s,event};if(!s.bag&&Math.abs(x-LASTCALL.bagX)<85&&Math.abs(bottom-LASTCALL.bagY)<25){s.bag=true;event='bag';}else if(Math.abs(x-LASTCALL.exitX)<85&&Math.abs(bottom-LASTCALL.ground)<25){if(!s.bag)event='missing';else{s.complete=true;event='complete';}}return {state:s,event};}
export function lastCallScore(s,ms,hits){return s.complete?Math.max(0,6000+Math.ceil(lastCallRemaining(ms)/1000)*25-hits*90):0;}
