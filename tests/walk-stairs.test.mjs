import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(await readFile(new URL('../src/walk-stairs.ts',import.meta.url),'utf8'));
const {StairWalker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('stairs walk at input speed, retain footing at rest and restore physics at both landings',()=>{
 const b={velocity:{x:275},blocked:{down:true},bottom:1250,checkCollision:{none:false},gravity:true,setAllowGravity(v){this.gravity=v;},reset(x,y){scene.player.x=x;this.bottom=y+24;}};
 const scene={player:{active:true,x:2300,body:b,setVelocity(x){b.velocity.x=x;}},portrait:{setPosition(){return this;},stop(){return this;},setTexture(){return this;}},lastGround:0};
 const walker=new StairWalker(),flights=[{x:2300,end:3000,bottom:1250,top:930}],descents=[];
 walker.update(scene,flights,16,i=>descents.push(i));assert.equal(walker.active,0);assert.equal(b.gravity,false);assert.ok(scene.player.x<2310);
 b.velocity.x=0;const stopped=scene.player.x;walker.update(scene,flights,50,()=>{});assert.equal(scene.player.x,stopped);
 for(let i=0;i<300&&walker.active!==null;i++){b.velocity.x=275;walker.update(scene,flights,16,n=>descents.push(n));}
 assert.equal(scene.player.x,3000);assert.equal(b.bottom,930);assert.equal(b.gravity,true);assert.equal(b.checkCollision.none,false);assert.deepEqual(descents,[]);
 walker.ignored=null;b.blocked.down=true;
 for(let i=0;i<300;i++){b.velocity.x=-275;walker.update(scene,flights,16,n=>descents.push(n));if(walker.active===null&&b.bottom===1250)break;}
 assert.equal(scene.player.x,2300);assert.equal(b.bottom,1250);assert.deepEqual(descents,[0]);assert.equal(b.gravity,true);
 walker.reset(scene);b.blocked.down=true;b.velocity.x=275;walker.update(scene,flights,16,i=>descents.push(i));b.velocity.x=-275;walker.update(scene,flights,32,i=>descents.push(i));assert.deepEqual(descents,[0],'backing out at the lower landing does not count as descending a whole flight');
});
