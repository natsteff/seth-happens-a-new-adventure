import type Phaser from 'phaser';
import {streetVehicleFrames} from './street-vehicle-art.mjs';
// Frames trim only transparent margins; mission collision profiles remain independent.
export function streetVehicle(scene:Phaser.Scene,x:number,ground:number,width:number,height:number,kind:string){
 const crop=streetVehicleFrames[kind as keyof typeof streetVehicleFrames],texture=scene.textures.get('thai-road-vehicles');
 if(!texture.has(kind))texture.add(kind,0,...crop as [number,number,number,number]);
 scene.add.image(x,ground,'thai-road-vehicles',kind).setOrigin(0,1).setDisplaySize(width,height).setDepth(1);
}
