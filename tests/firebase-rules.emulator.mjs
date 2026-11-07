import test,{after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,serverTimestamp,Timestamp,deleteDoc} from 'firebase/firestore';
import {LEVELS,payload,submission} from '../src/online-score-model.mjs';
import {bookPath,emptyBook,updateBook} from '../src/record-book.mjs';
import {FirebaseScores} from '../src/firebase-scores.ts';
const env=await initializeTestEnvironment({projectId:'demo-seth-happens-2',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync(new URL('../firebase/firestore.rules',import.meta.url),'utf8')}});
after(()=>env.cleanup());beforeEach(()=>env.clearFirestore());
const run=(l,id='run',extra={})=>({id,name:'Player',date:'2026-11-07T12:00:00Z',score:l==='rooftop'?8000:l==='thai'?4200:1000,elapsedMs:60000,beer:true,bonus:l==='rooftop'?6000:0,photos:2,latePhotos:0,falls:0,squishes:0,bumps:0,hits:0,condition:100,warmth:100,grip:100,...extra});
async function setup(level='snow',uid='alice',id='run',extra={}){const db=env.authenticatedContext(uid).firestore();await setDoc(doc(db,bookPath(level)),emptyBook());return {db,uid,level,job:await submission(payload(level,run(level,id,extra)))};}
function batch(x,{book=emptyBook(),change={},budget={},omitSeen=false,omitBudget=false}={}){
 const {db,level,job,uid}=x,b=writeBatch(db),next={...updateBook(book,job),updatedAt:serverTimestamp(),...change};
 b.set(doc(db,bookPath(level)),next);
 if(!omitSeen)b.set(doc(db,`games/seth-happens-2/levels/${level}/seen-runs/${job.payload.id}`),{digest:job.digest,receivedAt:serverTimestamp()});
 if(!omitBudget)b.set(doc(db,`games/seth-happens-2/budgets/${uid}`),{windowStartedAt:serverTimestamp(),lastAt:serverTimestamp(),count:1,lastRunKey:job.payload.id,level,...budget});
 return b;
}
test('12 levels initialize empty safely and accept atomic scores; Encore denied',async()=>{for(const [i,l] of LEVELS.entries()){const x=await setup(l,'user'+i);await assertSucceeds(batch(x).commit());assert.equal((await getDoc(doc(x.db,bookPath(l)))).data().normal.length,1);}const db=env.authenticatedContext('a').firestore();await assertFails(setDoc(doc(db,bookPath('encore')),emptyBook()));});
test('unauthenticated, foreign paths, collections, destructive writes, nonempty initialization denied',async()=>{const x=await setup();const guest=env.unauthenticatedContext().firestore();await assertFails(getDoc(doc(guest,bookPath('snow'))));await assertFails(getDocs(collection(x.db,'games/seth-happens-2/levels/snow/record-book')));await assertFails(setDoc(doc(x.db,bookPath('cabin')),{...emptyBook(),normal:[{}]}));await assertFails(deleteDoc(doc(x.db,bookPath('snow'))));await assertFails(setDoc(doc(x.db,'games/beer-run/record-book/current'),emptyBook()));await assertFails(setDoc(doc(x.db,'arbitrary/document'),{}));});
test('reject forged payload, other level, extra fields, omission of receipt/budget and cross-user budget',async()=>{const x=await setup('rooftop');for(const change of [{score:13900},{bonus:1},{beer:false},{elapsedMs:120000},{photos:3},{name:'bad\nname'},{name:'   '},{level:'snow'},{cheater:true},{privateData:'leak'}]){const p={...x.job.payload,...change};await assertFails(batch(x,{change:{lastPayload:p,normal:[{key:p.id,payload:p}]}}).commit());}await assertFails(batch(x,{omitSeen:true}).commit());await assertFails(batch(x,{omitBudget:true}).commit());await assertFails(batch(x,{budget:{count:60}}).commit());});
test('per-level maxima and timing/health guards enforced server side',async()=>{for(const [i,l] of LEVELS.entries()){const x=await setup(l,'a'+i);for(const change of [{score:100001},{elapsedMs:-1},{hits:-1},{dateMs:Date.now()+172800000}]){const p={...x.job.payload,...change};await assertFails(batch(x,{change:{lastPayload:p,normal:[{key:p.id,payload:p}]}}).commit());}}});
test('immutable receipts, daily cap, pacing, private budgets, atomic single-run binding',async()=>{const x=await setup();await assertSucceeds(batch(x).commit());await assertFails(batch(x).commit());await assertFails(deleteDoc(doc(x.db,'games/seth-happens-2/levels/snow/seen-runs/run')));const y={...x,job:await submission(payload('snow',run('snow','two')))};const old=(await getDoc(doc(x.db,bookPath('snow')))).data();await assertFails(batch(y,{book:old,budget:{count:2}}).commit());await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'games/seth-happens-2/budgets/alice'),{windowStartedAt:Timestamp.fromMillis(Date.now()-5000),lastAt:Timestamp.fromMillis(Date.now()-2000),count:60,level:'snow',lastRunKey:'run'}));await assertFails(batch(y,{book:old,budget:{count:61}}).commit());await assertFails(getDoc(doc(env.authenticatedContext('bob').firestore(),'games/seth-happens-2/budgets/alice')));});
test('real anonymous client bootstraps absent book, saves, deduplicates and isolates all 12 levels',async()=>{
 const client=new FirebaseScores({apiKey:'demo-key',authDomain:'demo-seth-happens-2.firebaseapp.com',projectId:'demo-seth-happens-2'},true);
 try{for(const l of LEVELS){const job=await submission(payload(l,run(l)));assert.equal(await client.submit(job),'accepted');assert.equal(await client.submit(job),'duplicate');const rows=await client.list(l);assert.equal(rows.length,1);assert.equal(rows[0].level,l);await new Promise(r=>setTimeout(r,1150));}}finally{await client.dispose();}
});
test('bounded insertion rejects reorder/deletion/25th eviction forgery and caps shortcuts',async()=>{
 const x=await setup('snow');let book=emptyBook();for(let i=0;i<25;i++)book=updateBook(book,await submission(payload('snow',run('snow','n'+i,{score:1000+i}))));
 await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),bookPath('snow')),book));const y={...x,job:await submission(payload('snow',run('snow','best',{score:2000})))};
 const valid=updateBook(book,y.job);await assertFails(batch(y,{book,change:{normal:[...valid.normal].reverse()}}).commit());await assertFails(batch(y,{book,change:{normal:valid.normal.slice(0,24)}}).commit());await assertSucceeds(batch(y,{book}).commit());
 const z=await setup('rooftop','shortcut','s0',{score:-10000,cheater:true,bonus:0});await assertSucceeds(batch(z).commit());
 let short=emptyBook();for(let i=0;i<5;i++)short=updateBook(short,await submission(payload('rooftop',run('rooftop','c'+i,{score:-10000,cheater:true,bonus:0}))));await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),bookPath('rooftop')),short));
 const p=payload('rooftop',run('rooftop','sixth',{score:-10000,cheater:true,bonus:0}));const job=await submission(p);await assertFails(batch({...z,job},{book:short,change:{...short,revision:short.revision+1,lastKey:p.id,lastPayload:p,lastDigest:job.digest,lastPosition:5,cheaters:[...short.cheaters,{key:p.id,payload:p}]}}).commit());
});
