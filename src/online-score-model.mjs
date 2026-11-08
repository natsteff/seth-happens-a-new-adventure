import {rooftopPenalty,CARNIVAL_BONUS} from './scoring-rules.mjs';
/** Current sequel scores only. Old per-level storage is intentionally ignored. */
export const LEVELS=['rooftop','thai','scooter','concert','haunted','zombie','snow','carnival','cabin','grocery','soccer','lastcall'];
export const MAX_SCORE={rooftop:14000,thai:4800,scooter:10000,concert:6250,haunted:6800,zombie:20000,snow:6500,carnival:6725,cabin:8500,grocery:6500,soccer:8000,lastcall:9000};
export const LOCAL_KEY='seth-happens-2.scores.v3';
const integer=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;
export function validate(p){
 if(p?.ruleset!==undefined)throw Error('Historical scores are no longer supported.');
 if((p?.wheelBonus!==undefined||p?.coasterBonus!==undefined)&&p.level!=='carnival')throw Error('Unexpected bonus fields.');
 if(!p||!LEVELS.includes(p.level)||typeof p.id!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>16||/[\x00-\x1f\x7f]/.test(p.name)||!integer(p.dateMs,8640000000000000)||!integer(p.elapsedMs,3600000)||!Number.isInteger(p.score)||typeof p.cheater!=='boolean'||typeof p.beer!=='boolean'||!['falls','squishes','bumps','hits'].every(k=>integer(p[k],100000))||!integer(p.photos,2)||!integer(p.latePhotos,p.photos)||!['condition','warmth','grip'].every(k=>integer(p[k],100))||!integer(p.bonus,12000))throw Error('Invalid score.');
 if(p.cheater?(p.level!=='rooftop'||p.score!==-10000):p.score<0||p.score>MAX_SCORE[p.level])throw Error('Score exceeds this level’s limits.');
 if(p.level==='rooftop'){
  const bonus=p.cheater?0:Math.max(0,120-Math.ceil(p.elapsedMs/1000))*100;
  const objectives=1000+(p.photos-p.latePhotos)*250+p.latePhotos*125+(p.beer?500:0);
  const total=Math.max(0,objectives+bonus-rooftopPenalty(p));
  if(p.elapsedMs>=120000||(!p.beer&&!p.cheater)||p.bonus!==bonus||p.score!==(p.cheater?-10000:total))throw Error('Invalid rooftop total.');
 }
 if(p.level==='carnival'&&(typeof p.wheelBonus!=='boolean'||typeof p.coasterBonus!=='boolean'||p.score!==Math.max(0,6500+(p.wheelBonus?CARNIVAL_BONUS.wheel:0)+(p.coasterBonus?CARNIVAL_BONUS.coaster:0)-Math.floor(p.elapsedMs/1000)*6-p.hits*100)))throw Error('Invalid carnival total.');
 if(p.level==='cabin'&&p.score!==Math.max(0,7000+p.condition*15-Math.floor(p.elapsedMs/1000)*5-p.hits*100))throw Error('Invalid cabin total.');
 if(p.level==='thai'&&(p.elapsedMs>=180000||p.score!==Math.max(0,1000+p.condition*10+p.warmth*10+Math.max(0,180-Math.ceil(p.elapsedMs/1000))*10-p.hits*25)))throw Error('Invalid takeout total.');
 if(p.level==='scooter'&&(p.elapsedMs>120000||p.grip===0))throw Error('Invalid scooter run.');
 if(p.level==='lastcall'&&p.elapsedMs>120000)throw Error('Invalid last call duration.');
 return p;
}
export function payload(level,record){
 const limit=level==='rooftop'?120000:level==='thai'?180000:null;
 if(limit!==null&&(!Number.isFinite(record.elapsedMs)||record.elapsedMs<0||record.elapsedMs>=limit))throw Error('Invalid finish duration.');
 const elapsedMs=limit===null?Math.ceil(record.elapsedMs):Math.min(limit-1,Math.ceil(record.elapsedMs));
 const p={level,id:record.id,name:record.name.trim(),dateMs:Date.parse(record.date),score:record.score,elapsedMs,cheater:record.cheater===true,beer:record.beer===true};
 if(level==='carnival'){p.wheelBonus=record.wheelBonus===true;p.coasterBonus=record.coasterBonus===true;}
 for(const k of ['falls','squishes','bumps','photos','latePhotos','bonus','hits','condition','warmth','grip'])p[k]=record[k]??0;
 return validate(p);
}
export function compare(a,b){return b.score-a.score||a.dateMs-b.dateMs||(a.id<b.id?-1:a.id>b.id?1:0);}
export function rank(rows){return [...rows.filter(p=>!p.cheater).sort(compare),...rows.filter(p=>p.cheater).sort((a,b)=>a.dateMs-b.dateMs||(a.id<b.id?-1:1)).slice(0,5)];}
export function display(p){return {...p,date:new Date(p.dateMs).toISOString()};}
export function localScores(storage,level){const state=JSON.parse(storage.getItem(LOCAL_KEY)||'[]');if(!Array.isArray(state))throw Error('Device scores are unreadable.');return rank(state.filter(p=>p.level===level).map(validate)).map(display);}
export function saveLocal(storage,level,record){
 const p=payload(level,record),rows=JSON.parse(storage.getItem(LOCAL_KEY)||'[]');if(!Array.isArray(rows))throw Error('Device scores are unreadable.');
 const old=rows.find(r=>r.level===level&&r.id===p.id);if(old&&JSON.stringify(old)!==JSON.stringify(p))throw Error('Conflicting run ID.');
 if(!old)storage.setItem(LOCAL_KEY,JSON.stringify([...rows,p]));return localScores(storage,level);
}
export async function submission(p){validate(p);const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(p)));return {key:p.level+':'+p.id,payload:p,digest:Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''),state:'pending',attempts:0,nextAttempt:0};}
export const retryDelay=attempt=>Math.min(300000,1500*2**Math.min(attempt,8));
