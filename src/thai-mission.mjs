// Level 2 geometry and rules are independent of the original 26-roof mission.
export const THAI = { width:5500, ground:510, homeX:180, restaurantX:5270, limitMs:180000 };
// Every tall obstacle has lower steps on both sides. Heights are the collision tops.
export const streetObstacles = [
  {kind:'bin',x:690,width:88,height:64},
  {kind:'bus',x:850,width:300,height:110},
  {kind:'shop',x:1200,width:280,height:174},
  {kind:'cart',x:1510,width:108,height:106},
  {kind:'bin',x:1645,width:88,height:64},
  {kind:'bin',x:2410,width:88,height:64},
  {kind:'bus',x:2550,width:300,height:110},
  {kind:'shop',x:2910,width:260,height:178},
  {kind:'building',x:3230,width:300,height:244},
  {kind:'shop',x:3590,width:240,height:178},
  {kind:'bus',x:3890,width:300,height:110},
  {kind:'bin',x:4250,width:88,height:64},
  {kind:'cart',x:5060,width:95,height:76},
];
export const trafficZones = [{left:350,right:650},{left:1810,right:2310},{left:4430,right:4930}];
export function newTakeoutRun(){return {phase:'outbound',food:false,condition:100,pickedUpAt:null,heatLoss:0,hits:0};}
export function collectTakeout(run,elapsedMs){
  if(run.phase!=='outbound'||run.food)return run;
  return {...run,phase:'return',food:true,pickedUpAt:elapsedMs};
}
export function foodWarmth(run,elapsedMs){
  if(!run.food||run.pickedUpAt===null)return 0;
  return Math.max(0,Math.round(100-Math.max(0,elapsedMs-run.pickedUpAt)/1000-run.heatLoss));
}
export function hitTakeout(run,thief=false){
  return {...run,hits:run.hits+1,condition:run.food?Math.max(0,run.condition-(thief?20:12)):run.condition,heatLoss:run.food?run.heatLoss+(thief?12:8):run.heatLoss};
}
export function canUseElevator(run,x,bottom){
  return run.phase==='return'&&run.food&&Math.abs(x-THAI.homeX)<65&&Math.abs(bottom-THAI.ground)<16;
}
export function takeoutScore(run,elapsedMs){
  if(!run.food)return 0;
  return Math.max(0,1000+run.condition*10+foodWarmth(run,elapsedMs)*10+Math.max(0,180-Math.ceil(elapsedMs/1000))*10-run.hits*25);
}
export function trafficSpeed(returning){return returning?205:150;}
export const THAI_SCORE_KEY='seth-new-adventure.thai-scores.v1';
function validRecord(s){return s&&typeof s.id==='string'&&typeof s.name==='string'&&s.name.length<=16&&Number.isFinite(Date.parse(s.date))&&Number.isInteger(s.score)&&s.score>=0&&s.score<=4800&&['condition','warmth'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<=100)&&Number.isInteger(s.hits)&&s.hits>=0&&Number.isFinite(s.elapsedMs)&&s.elapsedMs>=0&&s.elapsedMs<THAI.limitMs;}
export function readTakeoutScores(storage){
  const raw=storage.getItem(THAI_SCORE_KEY);if(raw===null)return [];
  const list=JSON.parse(raw);if(!Array.isArray(list)||!list.every(validRecord))throw Error('Saved takeout records are unreadable; nothing was changed.');
  return [...list].sort((a,b)=>b.score-a.score||Date.parse(a.date)-Date.parse(b.date));
}
export function saveTakeoutScore(storage,record){
  const list=readTakeoutScores(storage);if(!validRecord(record))throw Error('Invalid takeout record.');
  if(!list.some(s=>s.id===record.id))list.push(record);
  list.sort((a,b)=>b.score-a.score||Date.parse(a.date)-Date.parse(b.date));
  storage.setItem(THAI_SCORE_KEY,JSON.stringify(list));return list;
}
