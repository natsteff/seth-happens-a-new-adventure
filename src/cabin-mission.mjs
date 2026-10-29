export const CABIN={width:6500,height:1100,ground:800,startX:230,coolerX:6070,homeX:230,waterY:840};
export const cabinLandings=[{x:0,y:800,width:2300},{x:2690,y:770,width:310},{x:3920,y:770,width:400},{x:4700,y:800,width:1800}];
export const cabinBoats=[
 {x:2470,y:800,width:180,range:70,bob:10,period:5000,kind:'fishing boat'},
 {x:3190,y:790,width:200,range:70,bob:12,period:5500,kind:'pontoon'},
 {x:3500,y:780,width:200,range:0,bob:25,period:4000,kind:'wobbly dock'},
 {x:3800,y:790,width:200,range:65,bob:10,period:5500,kind:'fishing boat'},
 {x:4510,y:790,width:220,range:65,bob:12,period:5000,kind:'pontoon'}
];
export function cabinBoatPosition(boat,elapsed){const a=elapsed/boat.period*Math.PI*2;return {x:boat.x+Math.sin(a)*boat.range,y:boat.y+Math.sin(a*2)*boat.bob};}
export function newCabinRun(){return {phase:'outbound',beer:false,condition:100,complete:false,checkpoint:'cabin'};}
export const cabinCheckpoints={cabin:{x:230,bottom:800},'near-shore':{x:2130,bottom:800},island:{x:2840,bottom:770},'far-shore':{x:5000,bottom:800}};
export function cabinAction(state,{x,bottom,action=false}){
 const s={...state};let event='';if(s.complete)return {state:s,event};
 const on=(target,top)=>Math.abs(x-target)<95&&Math.abs(bottom-top)<22;
 if(!s.beer&&action&&on(CABIN.coolerX,800)){s.beer=true;s.phase='return';s.checkpoint='far-shore';event='pickup';}
 else if(s.beer&&action&&on(CABIN.homeX,800)){s.complete=true;s.phase='complete';event='delivery';}
 else{
  const checkpoint=!s.beer?(x>=4950&&Math.abs(bottom-800)<22?'far-shore':x>=2750&&x<=2960&&Math.abs(bottom-770)<22&&s.checkpoint!=='far-shore'?'island':x>=2020&&x<=2280&&Math.abs(bottom-800)<22&&s.checkpoint==='cabin'?'near-shore':null)
   :(x>=2020&&x<=2280&&Math.abs(bottom-800)<22?'near-shore':x>=2750&&x<=2960&&Math.abs(bottom-770)<22&&s.checkpoint==='far-shore'?'island':null);
  if(checkpoint&&checkpoint!==s.checkpoint){s.checkpoint=checkpoint;event='checkpoint';}
 }
 return {state:s,event};
}
export function cabinRecovery(state){return {...state,condition:state.beer?Math.max(0,state.condition-10):state.condition};}
export function cabinScore(state,elapsed,hits){return state.complete?Math.max(0,7000+state.condition*15-Math.floor(elapsed/1000)*5-hits*100):0;}
