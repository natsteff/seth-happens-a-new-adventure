import type Phaser from 'phaser';
export function startupLoader(scene:Phaser.Scene){
 scene.load.on('progress',(value:number)=>window.dispatchEvent(new CustomEvent('game-startup',{detail:{state:'progress',value}})));
 scene.load.on('loaderror',()=>window.dispatchEvent(new CustomEvent('game-startup',{detail:{state:'error'}})));
}
