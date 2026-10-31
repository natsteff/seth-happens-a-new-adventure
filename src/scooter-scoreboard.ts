import { readScooterScores, saveScooterScore } from './scooter-mission.mjs';
type ScooterResult={score:number;grip:number;hits:number;elapsedMs:number};
const dialog=document.createElement('dialog');dialog.id='scooter-scores';dialog.className='score-dialog';
document.getElementById('game')!.append(dialog);
let pending:(ScooterResult&{id:string;date:string})|null=null;
let returnFocus:HTMLElement|null=null;
export function resetScooterScores(){pending=null;if(dialog.open)dialog.close();}
export function openScooterScores(result?:ScooterResult){
 if(document.body.dataset.review==='true')return;
  returnFocus=document.activeElement as HTMLElement;
  if(result)pending={...result,id:crypto.randomUUID(),date:new Date().toISOString()};
  dialog.innerHTML='<div class="score-heading"><span class="score-eyebrow">LEVEL 3 · SCOOTER RIDE</span><h2 id="scooter-scores-title">SCOOTER RECORDS</h2></div><p>Saved only in this browser. Separate from rooftop and takeout scores.</p><form id="scooter-entry"><label>Name or initials <input name="player" required maxlength="16" autocomplete="off"></label><button>Save scooter score</button></form><p role="status"></p><div class="score-list"></div><div class="score-actions"><button id="scooter-close">Close</button></div>';
  dialog.setAttribute('aria-labelledby','scooter-scores-title');
  const form=dialog.querySelector('form') as HTMLFormElement;form.hidden=!pending;
  const status=dialog.querySelector('[role=status]')!;
  const render=()=>{
    const list=dialog.querySelector('.score-list')!;list.replaceChildren();
    try{
      const records=readScooterScores(localStorage);
      if(!records.length){list.textContent='No rides yet. Finish with Allison aboard!';return;}
      const table=document.createElement('table');table.innerHTML='<thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Ride</th></tr></thead>';
      const body=table.createTBody();
      records.slice(0,20).forEach((s:any,index:number)=>{const row=body.insertRow();for(const text of [String(index+1),s.name,s.score.toLocaleString(),`${(s.elapsedMs/1000).toFixed(1)}s · grip ${s.grip}% · ${s.hits} hits`])row.insertCell().textContent=text;});
      list.append(table);
    }catch(error){status.textContent=error instanceof Error?error.message:'Could not read scooter records.';}
  };
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!pending)return;
    const name=String(new FormData(form).get('player')??'').trim();if(!name)return;
    try{saveScooterScore(localStorage,{...pending,name});pending=null;form.hidden=true;status.textContent='Scooter score saved in this browser.';render();}
    catch(error){status.textContent=error instanceof Error?error.message:'Could not save; existing records unchanged.';}
  });
  dialog.querySelector('#scooter-close')!.addEventListener('click',()=>dialog.close());
  render();if(!dialog.open)dialog.showModal();
  (pending?dialog.querySelector('input'):dialog.querySelector('button'))?.focus();
}
dialog.addEventListener('close',()=>returnFocus?.focus());
window.addEventListener('open-scooter-scores',()=>openScooterScores());
