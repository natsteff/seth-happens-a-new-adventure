import {LEVEL_ORDER} from './progression.mjs';
// Explicit opt-in review is available on mobile/Pages too; never fake completions.
export function localReviewLevel({dev,hostname,search}){
 const value=new URLSearchParams(search).get('review');
 if(value==='all')return 'all';
 return dev&&['localhost','127.0.0.1','[::1]','::1'].includes(hostname)&&value==='cabin'?'cabin':null;
}
export function canEnterLevel(level,canPlay,reviewLevel){return LEVEL_ORDER.includes(level)&&(canPlay(level)||reviewLevel==='all'||level==='cabin'&&reviewLevel==='cabin');}
