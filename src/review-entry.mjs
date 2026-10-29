// Only the local Vite development server may bypass the Cabin unlock for review.
// Never write fake completions into progress storage.
export function localReviewLevel({dev,hostname,search}){
 return dev&&['localhost','127.0.0.1','[::1]','::1'].includes(hostname)&&new URLSearchParams(search).get('review')==='cabin'?'cabin':null;
}
export function canEnterLevel(level,canPlay,reviewLevel){return canPlay(level)||level==='cabin'&&reviewLevel==='cabin';}
