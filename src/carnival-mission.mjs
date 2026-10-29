export const CARNIVAL={width:7300,height:1100,ground:800,startX:140,boothX:1630,exitX:6970};
export const carnivalLandings=[{x:0,y:800,width:2050},{x:2400,y:640,width:200},{x:3100,y:720,width:180},{x:3650,y:800,width:3650}];
export const carnivalRides=[
 {kind:'lift',x:2230,y:720,amplitude:80,period:5000,width:190},
 {kind:'shuttle',x:2820,y:720,amplitude:180,period:6000,width:200},
 {kind:'lift',x:3430,y:720,amplitude:80,period:5000,width:200}
];
export function ridePosition(ride,elapsed){const offset=Math.sin(elapsed/ride.period*Math.PI*2)*ride.amplitude;return {x:ride.x+(ride.kind==='shuttle'?offset:0),y:ride.y+(ride.kind==='lift'?offset:0)};}
export function gondolaPosition(index,elapsed){const angle=elapsed/10000*Math.PI*2+index*Math.PI/4;return {x:2820+Math.cos(angle)*170,y:510+Math.sin(angle)*170};}
export function newCarnivalRun(){return {clue:false,crossed:false,wheelBonus:false,coasterBonus:false,complete:false,phase:'midway'};}
export function carnivalAction(state,{x,bottom,action=false}){
 const s={...state};let event='';if(s.complete)return {state:s,event};
 if(!s.clue&&action&&Math.abs(x-CARNIVAL.boothX)<90&&Math.abs(bottom-800)<25){s.clue=true;s.phase='rides';event='clue';}
 else if(s.clue&&!s.crossed&&x>=3750&&Math.abs(bottom-800)<25){s.crossed=true;s.phase='snacks';event='checkpoint';}
 else if(s.crossed&&action&&Math.abs(x-CARNIVAL.exitX)<90&&Math.abs(bottom-800)<25){s.complete=true;s.phase='complete';event='reunion';}
 return {state:s,event};
}
export function carnivalBonus(state,x,bottom){const s={...state};let event='';if(!s.clue||s.complete)return {state:s,event};if(!s.wheelBonus&&Math.abs(x-2820)<100&&bottom<390){s.wheelBonus=true;event='wheel';}else if(s.crossed&&!s.coasterBonus&&x>4650&&x<5800&&Math.abs(bottom-590)<15){s.coasterBonus=true;event='coaster';}return {state:s,event};}
export function carnivalScore(s,elapsed,hits){return s.complete?Math.max(0,6500+(s.wheelBonus?1000:0)+(s.coasterBonus?500:0)-Math.floor(elapsed/1000)*6-hits*100):0;}
