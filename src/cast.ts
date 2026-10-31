import type Phaser from 'phaser';
import {castSheets} from './cast-data.mjs';
export type CastSheet=keyof typeof castSheets;
export function loadCast(scene:Phaser.Scene,sheet:CastSheet){const key=`cast-${sheet}`;if(!scene.textures.exists(key))scene.load.image(key,`./assets/cast/${sheet}-v1.png`);}
export function castFrames(scene:Phaser.Scene,sheet:CastSheet){const texture=scene.textures.get(`cast-${sheet}`);castSheets[sheet].forEach((f,i)=>{if(!texture.has(String(i)))texture.add(String(i),0,...f.crop as [number,number,number,number]);});}
export function castPerson(scene:Phaser.Scene,sheet:CastSheet,frame:number,x:number,bottom:number,height=85){castFrames(scene,sheet);const data=castSheets[sheet][frame];return scene.add.image(x,bottom,`cast-${sheet}`,String(frame)).setOrigin(.5,1).setDisplaySize(height*data.crop[2]/data.crop[3],height);}
