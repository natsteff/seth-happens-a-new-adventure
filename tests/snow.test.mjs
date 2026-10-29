import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onIce,winterVelocity,blizzardAlpha,snowScore} from '../src/snow-mission.mjs';
import {createLevelProgress,PROGRESS_KEY} from '../src/progression.mjs';
import {vehicleFrontHurts} from '../src/thai-mission.mjs';
test('ice is limited to marked pavement, release slides and countersteer brakes',()=>{
 assert.equal(onIce(1100,800),true);assert.equal(onIce(1100,710),false);assert.equal(onIce(2200,800),false);
 const slide=winterVelocity(260,0,false,true,100),grip=winterVelocity(260,0,false,false,100),brake=winterVelocity(260,-1,false,true,100);assert.ok(slide>240);assert.ok(grip<70);assert.ok(brake<slide);assert.ok(brake>0);
 assert.equal(winterVelocity(260,1,false,true,100),260);assert.equal(winterVelocity(260,0,false,true,0),260);
});
test('frame-independent winter steering and restrained whiteout retain readability',()=>{
 let v=260;for(let i=0;i<10;i++)v=winterVelocity(v,0,false,true,10);assert.ok(Math.abs(v-winterVelocity(260,0,false,true,100))<1e-8);for(let t=0;t<60000;t+=100)assert.ok(blizzardAlpha(t)>=.04&&blizzardAlpha(t)<=.16);assert.equal(snowScore(false,0,0),0);assert.ok(snowScore(true,60000,2)>0);
});
test('plow top and rear remain safe, front contact is directional',()=>{
 assert.equal(vehicleFrontHurts({up:true,right:true},1),false);assert.equal(vehicleFrontHurts({left:true},1),false);assert.equal(vehicleFrontHurts({right:true},1),true);assert.equal(vehicleFrontHurts({left:true},-1),true);
});
test('Zombie unlocks Snow; completing Snow persists all prior replay rights',()=>{
 const data=new Map([[PROGRESS_KEY,JSON.stringify({version:1,...Object.fromEntries([1,2,3,4,5].map(i=>[`level${i}Completed`,true]))})]]),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};let p=createLevelProgress(store);assert.equal(p.canPlay('snow'),false);assert.equal(p.completeLevel('snow'),false);p.completeLevel('zombie');assert.equal(p.canPlay('snow'),true);p.completeLevel('snow');p=createLevelProgress(store);for(const level of ['rooftop','thai','scooter','concert','haunted','zombie','snow'])assert.equal(p.canPlay(level),true);assert.equal(JSON.parse(data.get(PROGRESS_KEY)).level7Completed,true);
});
