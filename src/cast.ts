import type Phaser from 'phaser';
import {castSheets} from './cast-data.mjs';
export type CastSheet=keyof typeof castSheets;
export function loadCast(scene:Phaser.Scene,sheet:CastSheet){const key=`cast-${sheet}`;if(!scene.textures.exists(key))scene.load.image(key,`./assets/cast/${sheet}-v1.png`);}
export function castFrames(scene:Phaser.Scene,sheet:CastSheet){const texture=scene.textures.get(`cast-${sheet}`);castSheets[sheet].forEach((f,i)=>{if(!texture.has(String(i)))texture.add(String(i),0,...f.crop as [number,number,number,number]);});}
export function castPerson(scene:Phaser.Scene,sheet:CastSheet,frame:number,x:number,bottom:number,height=85){castFrames(scene,sheet);const data=castSheets[sheet][frame];return scene.add.image(x,bottom,`cast-${sheet}`,String(frame)).setOrigin(.5,1).setDisplaySize(height*data.crop[2]/data.crop[3],height);}

// A lightweight articulated walk cycle reuses the original cutout; no extra atlas/decode.
export function walkingCastPerson(scene:Phaser.Scene,sheet:CastSheet,frame:number,x:number,bottom:number,height=78){
 castFrames(scene,sheet);const texture=scene.textures.get(`cast-${sheet}`),data=castSheets[sheet][frame],crop=data.crop;
 const [cx,cy,cw,ch]=crop,split=Math.floor(ch*.64),half=Math.floor(cw/2),key=`walk-${frame}`;
 for(const [name,px,py,pw,ph] of [[key+'-top',cx,cy,cw,split],[key+'-left',cx,cy+split,half,ch-split],[key+'-right',cx+half,cy+split,cw-half,ch-split]] as [string,number,number,number,number][]){if(!texture.has(name))texture.add(name,0,px,py,pw,ph);}
 const scale=height/ch,width=cw*scale;
 const legs=[scene.add.image(-width/4,-(ch-split)*scale,`cast-${sheet}`,key+'-left').setOrigin(.5,0).setDisplaySize(half*scale,(ch-split)*scale),scene.add.image(width/4,-(ch-split)*scale,`cast-${sheet}`,key+'-right').setOrigin(.5,0).setDisplaySize((cw-half)*scale,(ch-split)*scale)];
 const torso=scene.add.image(0,-height,`cast-${sheet}`,key+'-top').setOrigin(.5,0).setDisplaySize(width,split*scale);
 return {art:scene.add.container(x,bottom,[...legs,torso]),legs};
}
