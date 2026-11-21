import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ControllerUIInput} from '../src/controller-ui.mjs';
import {ControllerInput,setControllerUIBlocked} from '../src/controller.mjs';
const pad=(held=[],axes=[0,0],id='test')=>({index:0,id,connected:true,mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>({pressed:held.includes(i),value:held.includes(i)?1:0}))});
test('UI controller waits for neutral and buttons are edge-only',()=>{
 const c=new ControllerUIInput();assert.equal(c.sample([pad([0])],true,0).confirm,false);c.sample([pad()],true,1);
 assert.equal(c.sample([pad([0,1,9])],true,2).confirm,true);const held=c.sample([pad([0,1,9])],true,3);assert.equal(held.confirm,false);assert.equal(held.back,false);assert.equal(held.menu,false);
 c.sample([pad()],true,4);assert.equal(c.sample([pad([9])],true,5).menu,true);
});
test('UI directional repeat, axis deadzone, focus and controller swap rearming',()=>{
 const c=new ControllerUIInput();c.sample([pad()],true,0);
 assert.equal(c.sample([pad([13])],true,10).direction,'down');assert.equal(c.sample([pad([13])],true,200).direction,'');assert.equal(c.sample([pad([13])],true,360).direction,'down');assert.equal(c.sample([pad([13])],true,400).direction,'');assert.equal(c.sample([pad([13])],true,490).direction,'down');
 c.sample([pad()],true,500);assert.equal(c.sample([pad([],[.1,.1])],true,510).direction,'');assert.equal(c.sample([pad([],[0,-.8])],true,520).direction,'up');
 c.sample([pad([0])],false,530);assert.equal(c.sample([pad([0])],true,540).confirm,false);c.sample([pad()],true,550);assert.equal(c.sample([pad([0])],true,560).confirm,true);
 assert.equal(c.sample([pad([0],[0,0],'other')],true,570).confirm,false);assert.equal(c.sample([],true,580).connected,false);
});
test('UI ownership blocks gameplay and release is required before gameplay returns',()=>{
 const c=new ControllerInput();c.sample([pad()]);setControllerUIBlocked(true);assert.equal(c.sample([pad([0,15])]).move,0);setControllerUIBlocked(false);assert.equal(c.sample([pad([0,15])]).jump,false);c.sample([pad()]);assert.equal(c.sample([pad([0])]).jump,true);
});
