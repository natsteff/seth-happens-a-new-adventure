import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SCOOTER,ramps,rideObstacles,movingSemis,scooterSemi,newScooterRun,scooterStep,scooterHit,scooterScore,SCOOTER_SCORE_KEY,readScooterScores,saveScooterScore} from '../src/scooter-mission.mjs';
function ride(move,dt=1000/60,risky=false){let state={...newScooterRun(),risky},events=[];for(let i=0;i<10000&&!state.won&&!state.failed;i++){const r=scooterStep(state,{move},dt);state=r.state;events.push(...r.events);}return {state,events};}
test('every ramp launches once, climbs progressively, and has reachable safe landings at all speeds',()=>{
 assert.ok(ramps[0].launch<ramps[1].launch&&ramps[1].launch<ramps[2].launch&&ramps[2].launch<ramps[4].launch);
 for(const move of [-1,0,1]){const {state:s,events}=ride(move);assert.equal(s.won,true);assert.equal(s.failed,false);assert.deepEqual(s.launched,ramps.map((_,i)=>i));assert.equal(events.filter(e=>e.type==='ramp').length,10);assert.ok(s.grip>0);assert.ok(s.biggest>450);assert.ok(s.elapsedMs<SCOOTER.limitMs);}
 assert.ok(rideObstacles.some(o=>o.kind==='bus')&&rideObstacles.some(o=>o.kind==='building'));
});
test('fixed substeps keep ramps and outcomes consistent at 30/60/120fps',()=>{
 const results=[30,60,120].map(fps=>ride(0,1000/fps).state);for(const s of results){assert.equal(s.won,true);assert.equal(s.hits,results[0].hits);assert.deepEqual(s.launched,results[0].launched);assert.ok(Math.abs(s.elapsedMs-results[0].elapsedMs)<40);}
});
test('each optional high route grants one bonus and is visibly higher than lower route',()=>{
 const low=ride(0),high=ride(0,1000/60,true);assert.equal(low.state.bonus,0);assert.equal(high.state.bonus,1500);assert.equal(high.events.filter(e=>e.type==='bonus').length,2);assert.equal(high.events.find(e=>e.type==='ramp'&&e.index===3).risky,true);assert.equal(high.state.won,true);
});
test('front bumps cost grip, roof landings are safe and passenger loss fails without a score',()=>{
 const o=rideObstacles[0];let s={...newScooterRun(),x:o.x-27};let result=scooterStep(s,{},30);assert.equal(result.state.hits,1);assert.equal(result.state.grip,82);
 s={...newScooterRun(),x:o.x+50,y:SCOOTER.ground-o.height-2,vy:200,grounded:false};result=scooterStep(s,{},30);assert.equal(result.state.hits,0);assert.equal(result.state.grounded,true);
 s={...newScooterRun(),grip:18};s=scooterHit(s);assert.equal(s.failed,true);assert.equal(s.grip,0);assert.equal(scooterScore(s),0);assert.equal(scooterHit({...newScooterRun(),immuneMs:500}).hits,0);
});
test('a jump starts only while grounded and finished state cannot advance',()=>{
 const start=newScooterRun(),a=scooterStep(start,{jump:true},16).state,b=scooterStep(a,{jump:true},16).state;assert.equal(start.jumps,0);assert.equal(a.jumps,1);assert.equal(b.jumps,1);assert.ok(b.y<a.y);
 const end=ride(1).state;assert.deepEqual(scooterStep(end,{jump:true},100).state,end);assert.ok(scooterScore(end)>0);
});
test('scooter records remain independent, deduplicate and protect corrupt storage',()=>{
 const data=new Map([['seth-new-adventure.thai-scores.v1','private-thai'],['seth-happens-scores-v1','original']]);const store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const s=ride(0).state,record={id:'one',name:'ABC',date:'2026-10-28T22:00:00Z',score:scooterScore(s),grip:s.grip,hits:s.hits,elapsedMs:Math.round(s.elapsedMs)};saveScooterScore(store,record);saveScooterScore(store,record);assert.equal(readScooterScores(store).length,1);assert.equal(data.get('seth-new-adventure.thai-scores.v1'),'private-thai');assert.equal(data.get('seth-happens-scores-v1'),'original');
 data.set(SCOOTER_SCORE_KEY,'broken');assert.throws(()=>saveScooterScore(store,record));assert.equal(data.get(SCOOTER_SCORE_KEY),'broken');
});
test('riding off a roof falls under gravity rather than snapping to the road',()=>{
 const o=rideObstacles.find(o=>o.kind==='building'),top=SCOOTER.ground-o.height;
 let s={...newScooterRun(),x:o.x+o.width+23,y:top,grounded:true};s=scooterStep(s,{},50).state;
 assert.equal(s.grounded,false);assert.ok(s.y>=top&&s.y<top+5);assert.ok(s.vy>0);
});

test('route travel is doubled, and moving semis have bounded continuous motion with safe roofs',()=>{
 assert.equal(SCOOTER.finish-160,2*(7730-160));assert.equal(ramps.length,10);assert.equal(movingSemis.length,4);assert.ok(SCOOTER.hopVelocity**2/(2*SCOOTER.gravity)>scooterSemi(0,0).height);
 for(let i=0;i<movingSemis.length;i++){for(const ms of [0,1000,10000,50000]){const t=scooterSemi(i,ms);assert.ok(t.x>=movingSemis[i].left&&t.x<=movingSemis[i].right);assert.ok(Math.abs(scooterSemi(i,ms+1).x-t.x)<1);}}
 const t=scooterSemi(1,0),s={...newScooterRun(),x:t.x+75,y:SCOOTER.ground-t.height-1,vy:100,grounded:false};const result=scooterStep(s,{},20).state;assert.equal(result.hits,0);assert.equal(result.grounded,true);
});

test('both armed pink ramps stay visibly higher across speeds and earn both bonuses',()=>{
 const pinkPeaks=[],regularPeaks=[];
 for(const move of [-1,0,1]){
  let state={...newScooterRun(),risky:true},current;
  const peaks=new Map();
  for(let frame=0;frame<10000&&!state.won&&!state.failed;frame++){
   const next=scooterStep(state,{move},1000/120);state=next.state;
   for(const event of next.events){
    if(event.type==='ramp')current=event.index;
    if(event.type==='land'||event.type==='hard')current=undefined;
   }
   if(current!==undefined)peaks.set(current,Math.max(peaks.get(current)??0,SCOOTER.ground-state.y));
  }
  assert.equal(state.won,true);
  assert.equal(state.bonus,1500);
  for(const [index,peak] of peaks)(ramps[index].optional?pinkPeaks:regularPeaks).push(peak);
 }
 assert.equal(pinkPeaks.length,6);
 assert.ok(Math.min(...pinkPeaks)>=Math.max(...regularPeaks)+60);
});
