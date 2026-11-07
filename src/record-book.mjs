import {activeRuleset,ORIGINAL_RULESET} from './scoring-rules.mjs';
import {compare,display} from './online-score-model.mjs';
export const bookId=(level,ruleset=activeRuleset(level))=>ruleset===ORIGINAL_RULESET?'current':ruleset;
export const bookPath=(level,ruleset=activeRuleset(level))=>`games/seth-happens-2/levels/${level}/record-book/${bookId(level,ruleset)}`;
export const emptyBook=()=>({schema:1,revision:0,normal:[],cheaters:[]});
export function updateBook(book,job){
 const p=job.payload,c={key:p.id,payload:p};
 if([...book.normal,...book.cheaters].some(row=>row.key===c.key))return null;
 const normal=p.cheater?book.normal:[...book.normal,c].sort((a,b)=>compare(a.payload,b.payload)).slice(0,25);
 // Preserve the sequel's first-five shortcut runs below all legitimate scores.
 const cheaters=p.cheater?[...book.cheaters,c].slice(0,5):book.cheaters;
 if(![...normal,...cheaters].some(row=>row.key===c.key))return null;
 return {schema:1,revision:book.revision+1,normal,cheaters,lastKey:p.id,lastPayload:p,lastDigest:job.digest,lastPosition:(p.cheater?cheaters:normal).findIndex(row=>row.key===c.key)};
}
export function bookRows(book){return [...book.normal,...book.cheaters].map(row=>display(row.payload));}
