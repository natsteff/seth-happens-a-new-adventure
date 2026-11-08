/** One-time disposal of sequel playtest scores. Settings/progression are independent. */
export const SCORE_RESET_KEY='seth-happens-2.scores-reset.v3';
export function resetOldScores(storage,indexedDB){
 try{
  if(storage.getItem(SCORE_RESET_KEY)==='done')return;
  const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key==='seth-new-adventure-scores-v1'||/^seth-new-adventure\.[a-z-]+-scores\.v\d+$/.test(key)||/^seth-happens-2\.scores\.v[123]$/.test(key))keys.push(key);}
  for(const key of keys)storage.removeItem(key);
  // A new outbox namespace guarantees old jobs cannot upload even if an old tab blocks deletion.
  try{indexedDB?.deleteDatabase('seth-happens-2.online.v1');}catch{}
  storage.setItem(SCORE_RESET_KEY,'done');
 }catch{/* Unavailable browser storage cannot contain accessible saved scores. */}
}
