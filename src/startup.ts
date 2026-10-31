import type Phaser from 'phaser';
let generation=0;
const shared=new Set(['__DEFAULT','__MISSING','__WHITE','seth-walk','seth-fall','allison','adventure-logo','title-logo','foot-body','body']);
/** One loader for startup and level transitions, including a zero-file cached load. */
export function startupLoader(scene:Phaser.Scene){
 const token=++generation,baseline=new Set(scene.textures.getTextureKeys());
 const emit=(state:string,value?:number)=>{if(token===generation)window.dispatchEvent(new CustomEvent('game-startup',{detail:{state,value,generation:token,level:scene.sys.settings.key}}));};
 emit('loading');
 const progress=(value:number)=>emit('progress',value),error=()=>emit('error');
 scene.load.on('progress',progress);scene.load.on('loaderror',error);
 let owned:string[]=[];
 scene.events.once('create',()=>{owned=scene.textures.getTextureKeys().filter(key=>!baseline.has(key)&&!shared.has(key));requestAnimationFrame(()=>emit('ready'));});
 scene.events.once('shutdown',()=>{
  scene.load.off('progress',progress);scene.load.off('loaderror',error);
  // Stopped scenes have no display objects left; only keep the small shared core.
  for(const key of owned)for(const animation of scene.anims.getAnimsFromTexture(key))scene.anims.remove(animation);
  for(const key of owned)if(scene.textures.exists(key))scene.textures.remove(key);
 });
}
