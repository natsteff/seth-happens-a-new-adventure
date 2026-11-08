import {resetOldScores} from './score-reset.mjs';
resetOldScores(localStorage,indexedDB);
import {localScores,saveLocal} from './online-score-model.mjs';
import {OnlineScores} from './online-scores.mjs';
let online:OnlineScores|undefined;
let enabled=false;
export const scoreReady=fetch(new URL('./game-config.json',document.baseURI),{cache:'no-store'}).then(r=>r.json()).then(async config=>{
 if(config.firebase?.projectId!=='seth-happens-2'||config.onlineHighScores!==true)return;
 const {FirebaseScores}=await import('./firebase-scores');
 online=new OnlineScores({storage:localStorage,transport:new FirebaseScores(config.firebase)});enabled=true;
 online.subscribe(()=>window.dispatchEvent(new Event('scores-changed')));
 await online.start().catch(()=>{void online!.kick();});
 window.dispatchEvent(new Event('scores-changed'));
}).catch(()=>{});
export const onlineEnabled=()=>enabled;
export const readLevelScores=(level:string)=>localScores(localStorage,level);
export function saveLevelScore(level:string,record:any){const scores=saveLocal(localStorage,level,record);void scoreReady.then(()=>online?.enqueue());window.dispatchEvent(new Event('scores-changed'));return scores;}
export async function onlineLevelScores(level:string){await scoreReady;if(!online)throw Error('Online scoring is not enabled.');return online.list(level);}
window.addEventListener('online',()=>{void scoreReady.then(()=>online?.retry()).catch(()=>{});window.dispatchEvent(new Event('scores-changed'));});
window.addEventListener('storage',()=>{void online?.enqueue();window.dispatchEvent(new Event('scores-changed'));});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void online?.kick();});
