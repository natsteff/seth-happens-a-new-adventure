import {readLevelScores,saveLevelScore} from './score-service';
import {compactScoreEntry,finishCompactEntry,showScoreDialog,resetCompactEntry,acceptedPlayerName,focusScoreEntry} from './score-entry';

type ScooterResult={score:number;grip:number;hits:number;elapsedMs:number};
const dialog=document.createElement('dialog');dialog.id='scooter-scores';dialog.className='score-dialog';
document.getElementById('game')!.append(dialog);
let pending:(ScooterResult&{id:string;date:string})|null=null;
let returnFocus:HTMLElement|null=null;
export function resetScooterScores(){pending=null;resetCompactEntry(dialog);if(dialog.open)dialog.close();}
export function openScooterScores(result?:ScooterResult){
 if(document.body.dataset.review==='true')return;
  returnFocus=document.activeElement as HTMLElement;
  if(result){resetCompactEntry(dialog);pending={...result,id:crypto.randomUUID(),date:new Date().toISOString()};}
  dialog.innerHTML='<div class="score-heading"><span class="score-eyebrow">LEVEL 3 · SCOOTER RIDE</span><h2 id="scooter-scores-title">SCOOTER RECORDS</h2></div><p>Saved only in this browser. Separate from rooftop and takeout scores.</p><form id="scooter-entry"><label>Name or initials <input name="player" required maxlength="16" autocomplete="off"></label><button>Save scooter score</button></form><p role="status"></p><div class="score-list"></div><div class="score-actions"><button id="scooter-close">Close</button></div>';
  dialog.setAttribute('aria-labelledby','scooter-scores-title');
  const form=dialog.querySelector('form') as HTMLFormElement;form.hidden=!pending;
  const status=dialog.querySelector('[role=status]')!;
  const render=()=>{
    const list=dialog.querySelector('.score-list')!;list.replaceChildren();
    try{
      const records=readLevelScores('scooter');
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
    try{const saved=saveLevelScore('scooter',{...pending,name});if(!saved.some((record:any)=>record.id===pending!.id))throw Error('Score was not accepted. Try again.');acceptedPlayerName(name);finishCompactEntry(dialog);pending=null;form.hidden=true;status.textContent='Scooter score saved in this browser.';render();focusScoreEntry(dialog);}
    catch(error){status.textContent=error instanceof Error?error.message:'Could not save; existing records unchanged.';}
  });
  dialog.querySelector('#scooter-close')!.addEventListener('click',()=>dialog.close());
  compactScoreEntry(dialog,!!pending,()=>{pending=null;finishCompactEntry(dialog);status.textContent='Score not saved.';render();focusScoreEntry(dialog);});render();showScoreDialog(dialog);
}
dialog.addEventListener('close',()=>returnFocus?.focus());
window.addEventListener('open-scooter-scores',()=>openScooterScores());
