import {LEVEL_ORDER} from './progression.mjs';
export function reviewAllowed({dev=false,hostname=''}){return dev&&['localhost','127.0.0.1','[::1]','::1'].includes(hostname);}
// Ordinary production URLs enforce progression. The owner’s unlisted backstage
// URL is an explicit client-side convenience, not authentication.
export function localReviewLevel({dev=false,hostname,search}){
 const value=new URLSearchParams(search).get('review');
 if(value==='backstage')return 'all';
 if(!reviewAllowed({dev,hostname}))return null;
 if(value==='all')return 'all';
 return dev&&value==='cabin'?'cabin':null;
}
export function canEnterLevel(level,canPlay,reviewLevel){return LEVEL_ORDER.includes(level)&&(canPlay(level)||reviewLevel==='all'||level==='cabin'&&reviewLevel==='cabin');}
