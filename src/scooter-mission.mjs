// Feet positions and scenery geometry share world coordinates; simulation uses fixed substeps.
export const SCOOTER={width:8000,ground:950,finish:7730,gravity:1050,minSpeed:220,cruise:330,maxSpeed:470,limitMs:120000};
export const ramps=[
 {x:850,end:990,height:40,launch:460,name:'THE WARM-UP'},
 {x:2050,end:2220,height:65,launch:620,name:'BUS HOP'},
 {x:3450,end:3650,height:90,launch:790,name:'ROOFTOP EXPRESS'},
 {x:4650,end:4840,height:75,launch:560,riskyLaunch:900,name:'YOUR CALL',optional:true},
 {x:6200,end:6440,height:120,launch:930,name:'ABSOLUTELY NOT A SHORTCUT'}
];
export const rideObstacles=[
 {x:1080,width:115,height:60,kind:'bin'},
 {x:2330,width:290,height:112,kind:'bus'},
 {x:3780,width:350,height:205,kind:'building'},
 {x:4970,width:130,height:62,kind:'car-left'},
 {x:6620,width:430,height:235,kind:'building'},
 {x:7150,width:180,height:65,kind:'car-right'}
];
export const reactions={
 start:'I agreed to a ride. Not a physics experiment.',
 hop:'That pothole had a perfectly good road around it.',
 ramps:['Cute. A speed bump with ambition.','That bus has a door, Seth. A DOOR.','Why are we above the rent-controlled units?!','I am leaving a VERY specific review.','THE RENTAL APP DID NOT MENTION AVIATION.'],
 risk:'Oh good. The route marked with a legal disclaimer.',
 hit:['Was that the shortcut or the lawsuit?','My knees just filed a noise complaint.','Five stars for the view. Zero for survival.'],
 landing:'My spine has unsubscribed from this adventure.',
 finish:'Next time we are taking the elevator. Horizontally.',
 fail:'I am walking home. You and the scooter can talk.'
};
export function newScooterRun(){return {x:160,y:SCOOTER.ground,vx:SCOOTER.cruise,vy:0,grounded:true,grip:100,hits:0,bonus:0,jumps:0,elapsedMs:0,immuneMs:0,airMs:0,biggest:0,launched:[],tokens:[],risky:false,won:false,failed:false};}
export function scooterHit(state,amount=18){
 if(state.won||state.failed||state.immuneMs>0)return {...state};
 const grip=Math.max(0,state.grip-amount);
 return {...state,grip,hits:state.hits+1,immuneMs:1500,failed:grip===0};
}
export function scooterScore(s){return s.won?Math.max(0,2000+s.grip*20+s.bonus+Math.max(0,120-Math.ceil(s.elapsedMs/1000))*10-s.hits*100):0;}
export function rampSurface(r,x){return SCOOTER.ground-r.height*Math.max(0,Math.min(1,(x-r.x)/(r.end-r.x)));}
export function scooterStep(state,input,deltaMs){
 let s={...state,launched:[...state.launched],tokens:[...state.tokens]},events=[];
 if(s.won||s.failed)return {state:s,events};
 // Bound catch-up after a suspended tab; render rate never changes collision/launch behavior.
 let remaining=Math.max(0,Math.min(deltaMs,100));let hop=!!input.jump;
 while(remaining>0){
  const ms=Math.min(remaining,1000/120),dt=ms/1000;remaining-=ms;
  s.elapsedMs+=ms;s.immuneMs=Math.max(0,s.immuneMs-ms);
  const target=input.move<0?SCOOTER.minSpeed:input.move>0||input.boost?SCOOTER.maxSpeed:SCOOTER.cruise;
  s.vx+=Math.max(-360*dt,Math.min(240*dt,target-s.vx));
  const oldX=s.x,oldY=s.y,wasGrounded=s.grounded;
  if(hop&&s.grounded){s.vy=-430;s.grounded=false;s.jumps++;events.push({type:'hop'});}hop=false;
  s.x+=s.vx*dt;
  if(!s.grounded){s.vy+=SCOOTER.gravity*dt;s.y+=s.vy*dt;s.airMs+=ms;s.biggest=Math.max(s.biggest,SCOOTER.ground-s.y);}
  // Grounded feet retain their support height until a ramp/roof update below.
  let supported=false;
  for(const [index,r] of ramps.entries()){
   if(s.launched.includes(index))continue;
   const surface=rampSurface(r,s.x);
   if(s.x>=r.x&&s.x<=r.end&&((wasGrounded&&oldY>=surface-8)||(!s.grounded&&s.vy>=0&&oldY<=surface+6&&s.y>=surface))){s.y=surface;s.vy=0;s.grounded=true;supported=true;}
   if(oldX<r.end&&s.x>=r.end&&wasGrounded&&oldY<=rampSurface(r,oldX)+8&&oldY>=SCOOTER.ground-r.height-10){
    const risky=!!(r.optional&&s.risky),launch=risky?r.riskyLaunch:r.launch;
    s.y=SCOOTER.ground-r.height;s.vy=-launch*(.9+.1*s.vx/SCOOTER.cruise);s.grounded=false;s.launched.push(index);s.jumps++;s.airMs=0;
    events.push({type:'ramp',index,risky});supported=false;
   }
  }
  for(const o of rideObstacles){
   const top=SCOOTER.ground-o.height,inX=s.x+24>o.x&&s.x-24<o.x+o.width;
   if(!inX)continue;
   if(!s.grounded&&s.vy>=0&&oldY<=top+2&&s.y>=top){
    if(s.vy>1030){s=scooterHit(s,10);events.push({type:'hard'});}
    else events.push({type:'land'});
    s.y=top;s.vy=0;s.grounded=true;supported=true;s.airMs=0;
   }else if(wasGrounded&&Math.abs(oldY-top)<3){s.y=top;supported=true;}
   else if(oldX+24<=o.x&&s.x+24>o.x&&s.y>top+8&&s.y-90<SCOOTER.ground){
    const hit=scooterHit(s);if(hit.hits>s.hits)events.push({type:'hit'});s=hit;
    // A bump costs grip but does not trap the scooter against an obstacle.
    s.y=top-3;s.vy=-280;s.grounded=false;
   }
  }
  if(s.grounded&&!supported&&s.y<SCOOTER.ground-2){s.grounded=false;s.vy=0;}
  if(!s.grounded&&s.y>=SCOOTER.ground){
   if(s.vy>1030){const hit=scooterHit(s,10);if(hit.hits>s.hits)events.push({type:'hard'});s=hit;}
   else events.push({type:'land'});
   s.y=SCOOTER.ground;s.vy=0;s.grounded=true;s.airMs=0;
  }
  // Optional high-air bonus requires choosing the risky ramp and hitting its arc.
  if(s.risky&&s.x>5100&&s.x<5370&&s.y<SCOOTER.ground-330&&!s.tokens.includes('sky')){s.tokens.push('sky');s.bonus+=750;events.push({type:'bonus'});}
  if(s.grip<=0||s.elapsedMs>=SCOOTER.limitMs){s.failed=true;events.push({type:'fail'});break;}
  if(s.x>=SCOOTER.finish){s.won=true;events.push({type:'finish'});break;}
 }
 return {state:s,events};
}
export const SCOOTER_SCORE_KEY='seth-new-adventure.scooter-scores.v1';
function valid(s){return s&&typeof s.id==='string'&&typeof s.name==='string'&&s.name.trim().length>0&&s.name.length<=16&&Number.isFinite(Date.parse(s.date))&&Number.isInteger(s.score)&&s.score>=0&&s.score<=10000&&Number.isInteger(s.grip)&&s.grip>0&&s.grip<=100&&Number.isInteger(s.hits)&&s.hits>=0&&Number.isFinite(s.elapsedMs)&&s.elapsedMs>=0&&s.elapsedMs<=SCOOTER.limitMs;}
export function readScooterScores(storage){const raw=storage.getItem(SCOOTER_SCORE_KEY);if(raw===null)return [];const list=JSON.parse(raw);if(!Array.isArray(list)||!list.every(valid))throw Error('Scooter records are unreadable; nothing was changed.');return [...list].sort((a,b)=>b.score-a.score||Date.parse(a.date)-Date.parse(b.date));}
export function saveScooterScore(storage,record){const list=readScooterScores(storage);if(!valid(record))throw Error('Invalid scooter record.');if(!list.some(s=>s.id===record.id))list.push(record);list.sort((a,b)=>b.score-a.score||Date.parse(a.date)-Date.parse(b.date));storage.setItem(SCOOTER_SCORE_KEY,JSON.stringify(list));return list;}
