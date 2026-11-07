import {initializeApp,deleteApp,getApps} from 'firebase/app';
import {getAuth,signInAnonymously,connectAuthEmulator,setPersistence,indexedDBLocalPersistence} from 'firebase/auth';
import {initializeFirestore,connectFirestoreEmulator,doc,runTransaction,serverTimestamp,getDocFromServer,terminate} from 'firebase/firestore';
import {bookPath,bookId,emptyBook,updateBook,bookRows} from './record-book.mjs';
import {activeRuleset,recordRuleset} from './scoring-rules.mjs';
import {LEVELS} from './online-score-model.mjs';
export class FirebaseScores{
 private auth;private db;private login?:Promise<string>;private submissions=new Map<string,Promise<any>>();
 constructor(config:Record<string,string>,emulator=false){
  if(config.projectId!==(emulator?'demo-seth-happens-2':'seth-happens-2'))throw Error('Refusing another Firebase project.');
  const name=emulator?'seth-happens-2-emulator':'seth-happens-2-online';
  const app=getApps().find(a=>a.name===name)||initializeApp(config,name);this.auth=getAuth(app);this.db=initializeFirestore(app,{ignoreUndefinedProperties:true});
  if(emulator){connectAuthEmulator(this.auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(this.db,'127.0.0.1',8080);}
 }
 async uid(){if(!this.login)this.login=(async()=>{await setPersistence(this.auth,indexedDBLocalPersistence).catch(()=>{});await this.auth.authStateReady();return this.auth.currentUser?.uid||(await signInAnonymously(this.auth)).user.uid;})().catch(e=>{this.login=undefined;throw e;});return this.login;}
 async initialize(level:string,ruleset=activeRuleset(level)){
  if(!LEVELS.includes(level))throw Error('Not a playable level.');await this.uid();
  const ref=doc(this.db,bookPath(level,ruleset));await runTransaction(this.db,async tx=>{if(!(await tx.get(ref)).exists())tx.set(ref,emptyBook());});
 }
 async list(level:string,ruleset=activeRuleset(level)){
  if(!LEVELS.includes(level))throw Error('Not a playable level.');await this.uid();
  const ref=doc(this.db,bookPath(level,ruleset));let snapshot=await getDocFromServer(ref);
  if(!snapshot.exists()){await this.initialize(level,ruleset);snapshot=await getDocFromServer(ref);}
  return bookRows(snapshot.data());
 }
 async submit(job:any){const old=this.submissions.get(job.key);if(old)return old;const task=this.submitOnce(job).finally(()=>this.submissions.delete(job.key));this.submissions.set(job.key,task);return task;}
 private async submitOnce(job:any){
  const p=job.payload,ruleset=recordRuleset(p),id=bookId(p.level,ruleset),version=id==='current'?{}:{book:id};await this.initialize(p.level,ruleset);const uid=await this.uid(),base=`games/seth-happens-2/levels/${p.level}`;
  const book=doc(this.db,bookPath(p.level,ruleset)),seen=doc(this.db,`${base}/seen-runs/${p.id}`),budget=doc(this.db,`games/seth-happens-2/budgets/${uid}`);
  return runTransaction(this.db,async tx=>{
   const receipt=await tx.get(seen);if(receipt.exists())return receipt.data().digest===job.digest?'duplicate':'conflict';
   const snapshot=await tx.get(book),next=updateBook(snapshot.data(),job);if(!next)return 'below-cutoff';
   const previous=(await tx.get(budget)).data(),now=Date.now(),reset=!previous||now-previous.windowStartedAt.toMillis()>=86400000;
   const count=(reset?0:previous!.count)+1;if(count>60)throw Object.assign(Error('Daily submission limit.'),{code:'daily-limit'});
   if(previous&&now-previous.lastAt.toMillis()<1100)throw Object.assign(Error('Submission pacing.'),{code:'pacing'});
   tx.set(book,{...next,updatedAt:serverTimestamp()});
   tx.set(seen,{...version,digest:job.digest,receivedAt:serverTimestamp()});
   tx.set(budget,{...version,windowStartedAt:reset?serverTimestamp():previous!.windowStartedAt,count,lastAt:serverTimestamp(),lastRunKey:p.id,level:p.level});return 'accepted';
  });
 }
 async dispose(){await terminate(this.db);await deleteApp(this.auth.app);}
}
