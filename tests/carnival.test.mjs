import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CARNIVAL,carnivalLandings,carnivalRides,ridePosition,gondolaPosition,newCarnivalRun,carnivalAction,carnivalBonus,carnivalScore} from '../src/carnival-mission.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
import {adventureScoreKey,readAdventureScores,saveAdventureScore} from '../src/adventure-records.mjs';
test('search requires booth clue, ride crossing and Action reunion in order',()=>{
 let s=newCarnivalRun();const act=(x,bottom=800,action=true)=>{const r=carnivalAction(s,{x,bottom,action});s=r.state;return r.event;};
 assert.equal(act(CARNIVAL.exitX),'');assert.equal(act(3800),'');assert.equal(act(CARNIVAL.boothX,640),'');assert.equal(act(CARNIVAL.boothX,800,false),'');assert.equal(act(CARNIVAL.boothX),'clue');assert.equal(act(CARNIVAL.exitX,600),'');assert.equal(act(3800),'checkpoint');assert.equal(act(CARNIVAL.exitX,800,false),'');assert.equal(carnivalScore(s,10000,0),0);assert.equal(act(CARNIVAL.exitX),'reunion');assert.ok(carnivalScore(s,10000,0)>0);assert.equal(act(CARNIVAL.exitX),'');
});
test('ride motions stay bounded, repeat smoothly, and leave reachable boarding opportunities',()=>{
 for(const r of carnivalRides){const p=ridePosition(r,0),q=ridePosition(r,r.period);assert.ok(Math.abs(p.x-q.x)<1e-8&&Math.abs(p.y-q.y)<1e-8);for(let t=0;t<r.period;t+=31){const a=ridePosition(r,t),b=ridePosition(r,t+16);assert.ok(Math.abs(a.x-r.x)<=r.amplitude+1e-8);assert.ok(Math.abs(a.y-r.y)<=r.amplitude+1e-8);assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<5);}}
 const lift=carnivalRides[0],low=ridePosition(lift,lift.period/4),high=ridePosition(lift,3*lift.period/4);assert.equal(low.y,800);assert.equal(high.y,640);assert.ok(low.x-lift.width/2-carnivalLandings[0].width<100);assert.ok(carnivalLandings[1].x-(high.x+lift.width/2)<100);
 const shuttle=carnivalRides[1];assert.ok(ridePosition(shuttle,shuttle.period*.75).x-shuttle.width/2<carnivalLandings[1].x+carnivalLandings[1].width);assert.ok(ridePosition(shuttle,shuttle.period*.25).x+shuttle.width/2>=carnivalLandings[2].x);
 for(let i=0;i<8;i++){const p=gondolaPosition(i,1234);assert.ok(Math.abs(Math.hypot(p.x-2820,p.y-510)-170)<1e-8);assert.ok(p.y>=340&&p.y<=680);}
});
test('optional ride bonuses award once and do not replace the reunion objective',()=>{
 let s=newCarnivalRun();assert.equal(carnivalBonus(s,2820,340).event,'');s={...s,clue:true};let r=carnivalBonus(s,2820,340);assert.equal(r.event,'wheel');s=r.state;assert.equal(carnivalBonus(s,2820,340).event,'');assert.equal(carnivalBonus(s,4800,590).event,'');s={...s,crossed:true};r=carnivalBonus(s,4800,590);assert.equal(r.event,'coaster');s=r.state;assert.equal(carnivalBonus(s,4800,590).event,'');assert.equal(carnivalScore(s,1000,0),0);assert.equal(carnivalScore({...s,complete:true},10000,1),7840);
});
test('saved Snow completion unlocks Carnival; records remain independent',()=>{
 const data=new Map([[PROGRESS_KEY,JSON.stringify({version:1,...Object.fromEntries([1,2,3,4,5,6].map(i=>[`level${i}Completed`,true]))})]]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};let p=createLevelProgress(storage);assert.equal(p.canPlay('carnival'),false);assert.equal(p.completeLevel('carnival'),false);p.completeLevel('snow');assert.equal(createLevelProgress(storage).canPlay('carnival'),true);p.completeLevel('carnival');assert.equal(JSON.parse(data.get(PROGRESS_KEY)).level8Completed,true);
 saveAdventureScore(storage,'carnival',{id:'carnival-test',name:'Test',date:'2026-10-29T11:00:00Z',score:7000,elapsedMs:60000,hits:1});assert.equal(readAdventureScores(storage,'carnival').length,1);assert.equal(readAdventureScores(storage,'snow').length,0);assert.notEqual(adventureScoreKey('carnival'),adventureScoreKey('snow'));
});
