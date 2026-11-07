import {ScoreOutbox} from './online-score-store.mjs';
import {LOCAL_KEY,submission,retryDelay} from './online-score-model.mjs';
import {withDeadline} from './score-waits.mjs';
/** Local storage is the recovery journal; outbox receipts survive ranking eviction/restarts. */
export class OnlineScores{
 /** @param {any} options */
 constructor({store=new ScoreOutbox(),storage,transport,visible=()=>!document.hidden,now=Date.now,waitMs=8000}={}){Object.assign(this,{store,storage,transport,visible,now,waitMs});this.owner=crypto.randomUUID();this.listeners=new Set();this.status='';this.working=false;}
 subscribe(fn){this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
 changed(){for(const fn of this.listeners)fn();}
 async start(){await this.recover();void this.kick();}
 async recover(){for(const p of JSON.parse(this.storage.getItem(LOCAL_KEY)||'[]')){const job=await this.store.enqueue(await submission(p));if(job.collision)throw Error('Conflicting saved run.');}}
 async enqueue(){try{await this.recover();this.status='Saved on this device. Online synchronization pending.';void this.kick();}catch{this.status='Saved on this device. Online queue unavailable; retrying automatically.';this.schedule(5000);}this.changed();}
 schedule(ms){clearTimeout(this.timer);if(!this.disposed)this.timer=setTimeout(()=>void this.kick(),ms);}
 async kick(){
  clearTimeout(this.timer);if(this.disposed)return;if(this.working){this.again=true;return;}if(!this.visible())return;
  this.working=true;let claimed=false;
  try{
   claimed=await this.store.claim(this.owner,this.now());if(!claimed){this.schedule(5000);return;}
   await this.recover();
   const job=(await this.store.jobs()).find(j=>j.state==='pending'&&j.nextAttempt<=this.now());
   if(job){try{
    const state=await withDeadline(this.transport.submit(job),this.waitMs);
    await this.store.update(job.key,{state,finishedAt:this.now()});
    this.status=state==='accepted'||state==='duplicate'?'Saved on this device and online.':state==='below-cutoff'?'Saved on this device. Outside the online top 25 / five shortcut slots.':'Conflicting online run; this device score is preserved.';
   }catch(error){const delay=String(error?.code)==='daily-limit'?86400000:retryDelay(job.attempts+1);await this.store.update(job.key,{attempts:job.attempts+1,nextAttempt:this.now()+delay});this.status='Online sync pending. Scores remain on this device.';}}
   const pending=(await this.store.jobs()).filter(j=>j.state==='pending');if(pending.length)this.schedule(Math.max(1500,Math.min(...pending.map(j=>j.nextAttempt))-this.now()));
  }catch{this.status='Online unavailable. Scores remain on this device; automatic retries are active.';this.schedule(5000);}
  finally{if(claimed)await this.store.release(this.owner).catch(()=>{});this.working=false;this.changed();if(this.again){this.again=false;this.schedule(0);}}
 }
 async retry(){for(const j of await this.store.jobs())if(j.state==='pending')await this.store.update(j.key,{nextAttempt:0});void this.kick();}
 list(level,ruleset){return withDeadline(this.transport.list(level,ruleset),this.waitMs);}
 dispose(){this.disposed=true;clearTimeout(this.timer);this.listeners.clear();}
}
