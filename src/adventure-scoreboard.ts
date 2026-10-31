import {readAdventureScores,saveAdventureScore} from './adventure-records.mjs';
type Result={score:number;elapsedMs:number;hits:number};
const dialog=document.createElement('dialog');dialog.id='adventure-scores';dialog.className='score-dialog';document.getElementById('game')!.append(dialog);
let pending:(Result&{id:string;date:string})|null=null,currentLevel='';
export function resetAdventureScores(){pending=null;currentLevel='';if(dialog.open)dialog.close();}
export function openAdventureScores(level:string,title:string,result?:Result){
 if(document.body.dataset.review==='true')return;
 if(currentLevel!==level)pending=null;currentLevel=level;if(result)pending={...result,id:crypto.randomUUID(),date:new Date().toISOString()};
 dialog.innerHTML='<div class="score-heading"><h2 id="adventure-record-title"></h2></div><p>Saved only in this browser. Each adventure has separate records.</p><form><label>Name or initials <input name="player" required maxlength="16" autocomplete="off"></label><button>Save score</button></form><p role="status"></p><div class="score-list"></div><div class="score-actions"><button id="adventure-close">Close</button></div>';
 dialog.setAttribute('aria-labelledby','adventure-record-title');dialog.querySelector('h2')!.textContent=title+' · Records';const form=dialog.querySelector('form')!;form.hidden=!pending;
 const status=dialog.querySelector('[role=status]')!;
 const render=()=>{const list=dialog.querySelector('.score-list')!;list.replaceChildren();try{const records=readAdventureScores(localStorage,level);if(!records.length){list.textContent='No completed adventures yet.';return;}const table=document.createElement('table');table.innerHTML='<thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Run</th></tr></thead>';const body=table.createTBody();records.slice(0,20).forEach((s:any,i:number)=>{const row=body.insertRow();for(const text of [String(i+1),s.name,s.score.toLocaleString(),`${(s.elapsedMs/1000).toFixed(1)}s · ${s.hits} mishaps`])row.insertCell().textContent=text;});list.append(table);}catch(e){status.textContent=e instanceof Error?e.message:'Could not read records.';}};
 form.addEventListener('submit',event=>{event.preventDefault();if(!pending)return;const name=String(new FormData(form).get('player')??'').trim();if(!name)return;try{saveAdventureScore(localStorage,level,{...pending,name});pending=null;form.hidden=true;status.textContent='Score saved in this browser.';render();}catch(e){status.textContent=e instanceof Error?e.message:'Could not save records.';}});
 dialog.querySelector('#adventure-close')!.addEventListener('click',()=>dialog.close());render();if(!dialog.open)dialog.showModal();(pending?dialog.querySelector('input'):dialog.querySelector('button'))?.focus();
}
window.addEventListener('open-adventure-scores',()=>{const level=document.body.dataset.level??'';openAdventureScores(level,({concert:'Concert Chaos',haunted:'Haunted House',zombie:'Zombie Apocalypse',snow:'Snow Day From Hell',carnival:'Carnival Catastrophe',cabin:'Cabin Fever',grocery:'Grocery Store Gauntlet',soccer:'Soccer Game Hijinx'} as Record<string,string>)[level]??'Adventure');});
