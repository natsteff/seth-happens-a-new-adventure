import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {floors, ROAD} from '../src/mission.mjs';

const source=stripTypeScriptTypes(readFileSync(new URL('../src/scenery.ts',import.meta.url),'utf8'))
  .replace("import Phaser from 'phaser';",'').replace("import {homeTower} from './home-building';",'');
const {brickBuilding}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('26 rooftop facades keep fill textures below 16 MiB and preserve roof geometry/repeat spacing',()=>{
  const textures=new Map([['adventure-brick',{width:1536,height:1024}]]),tiles=[];
  let samples=0;
  const chain=new Proxy({}, {get:()=>()=>chain});
  const scene={
    textures:{exists:key=>textures.has(key),get:key=>({getSourceImage:()=>textures.get(key)}),
      createCanvas(key,width,height){
        textures.set(key,{width,height});
        return {context:{drawImage(image,x,y,w,h){samples++;assert.equal(image,textures.get('adventure-brick'));assert.deepEqual([w,h],[width,height]);}},refresh(){}};
      }},
    add:{graphics:()=>chain,tileSprite(x,y,width,height,key){
      const tile={x,y,width,height,key,setOrigin(){return this;},setTileScale(scale){this.scale=scale;return this;},setDepth(){return this;}};
      tiles.push(tile);return tile;
    }}
  };
  for(const floor of floors.slice(1))brickBuilding(scene,floor.x,floor.y,floor.width,ROAD.y,floor.floor);
  assert.equal(samples,1);
  const pot=n=>2**Math.ceil(Math.log2(n));
  let bytes=0;
  tiles.forEach((tile,i)=>{
    const floor=floors[i+1],image=textures.get(tile.key);
    bytes+=pot(image.width)*pot(image.height)*4;
    assert.deepEqual([tile.x,tile.y,tile.width,tile.height],[floor.x,floor.y+8,floor.width,ROAD.y-floor.y-8]);
    assert.equal(pot(image.width)*tile.scale,2048*.19);
    assert.equal(pot(image.height)*tile.scale,1024*.19);
    assert.equal(tile.tilePositionX*tile.scale,(floor.floor%4)*384*.19);
  });
  assert.ok(bytes<16*1024*1024,`Repeated facade GPU fill textures: ${bytes} bytes`);
});
