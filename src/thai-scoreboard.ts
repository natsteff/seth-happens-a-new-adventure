import { readTakeoutScores, saveTakeoutScore } from './thai-mission.mjs';
type TakeoutResult={score:number;condition:number;warmth:number;hits:number;elapsedMs:number};
const dialog=document.createElement('dialog');dialog.id='thai-scores';dialog.className='score-dialog';
document.getElementById('game')!.append(dialog);
let pending:(TakeoutResult&{id:string;date:string})|null=null;
let returnFocus:HTMLElement|null=null;
export function resetTakeoutScores(){pending=null;if(dialog.open)dialog.close();}
export function openTakeoutScores(result?:TakeoutResult){
 if(document.body.dataset.review==='true')return;
  returnFocus=document.activeElement as HTMLElement;
  if(result)pending={...result,id:crypto.randomUUID(),date:new Date().toISOString()};
  dialog.innerHTML='<div class="score-heading"><span class="score-eyebrow">LEVEL 2 · THAI TAKEOUT RUN</span><h2 id="thai-scores-title">TAKEOUT RECORDS</h2></div><p>Saved only in this browser. Separate from rooftop scores.</p><form id="thai-entry"><label>Name or initials <input name="player" required maxlength="16" autocomplete="off"></label><button>Save takeout score</button></form><p role="status"></p><div class="score-list"></div><div class="score-actions"><button id="thai-close">Close</button></div>';
  dialog.setAttribute('aria-labelledby','thai-scores-title');
  const form=dialog.querySelector('form') as HTMLFormElement;form.hidden=!pending;
  const status=dialog.querySelector('[role=status]')!;
  const render=()=>{
    const list=dialog.querySelector('.score-list')!;list.replaceChildren();
    try{
      const records=readTakeoutScores(localStorage);
      if(!records.length){list.textContent='No deliveries yet. Bring dinner home!';return;}
      const table=document.createElement('table');table.innerHTML='<thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Delivery</th></tr></thead>';
      const body=table.createTBody();
      records.slice(0,20).forEach((s:any,index:number)=>{const row=body.insertRow();for(const text of [String(index+1),s.name,s.score.toLocaleString(),`${(s.elapsedMs/1000).toFixed(1)}s · food ${s.condition}% · warmth ${s.warmth}% · ${s.hits} hits`])row.insertCell().textContent=text;});
      list.append(table);
    }catch(error){status.textContent=error instanceof Error?error.message:'Could not read takeout records.';}
  };
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!pending)return;
    const name=String(new FormData(form).get('player')??'').trim();if(!name)return;
    try{saveTakeoutScore(localStorage,{...pending,name});pending=null;form.hidden=true;status.textContent='Takeout score saved in this browser.';render();}
    catch(error){status.textContent=error instanceof Error?error.message:'Could not save; existing records unchanged.';}
  });
  dialog.querySelector('#thai-close')!.addEventListener('click',()=>dialog.close());
  render();if(!dialog.open)dialog.showModal();
  (pending?dialog.querySelector('input'):dialog.querySelector('button'))?.focus();
}
dialog.addEventListener('close',()=>returnFocus?.focus());
window.addEventListener('open-thai-scores',()=>openTakeoutScores());
