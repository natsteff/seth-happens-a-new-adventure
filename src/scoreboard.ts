import {isCurrentScore} from './scoring-rules.mjs';
import {gameAudio} from './audio';
import {mountScoreBrowser} from './score-browser';
import {readLevelScores,saveLevelScore} from './score-service';
import {LOCAL_KEY} from './online-score-model.mjs';
import {compactScoreEntry,finishCompactEntry,showScoreDialog,resetCompactEntry,acceptedPlayerName,focusScoreEntry} from './score-entry';
type Result={score:number;falls:number;squishes:number;bumps:number;photos:number;latePhotos:number;beer:boolean;elapsedMs?:number;bonus?:number;cheater?:boolean};
const dialog=document.createElement('dialog');dialog.className='score-dialog';document.getElementById('game')!.append(dialog);
let pending:(Result&{id:string;date:string})|null=null;
export function scoresOpen(){return !!document.querySelector('.score-dialog[open]');}
for(const type of ['keydown','keyup'])document.addEventListener(type,event=>{if(scoresOpen())event.stopPropagation();},true);
function render(){
 dialog.innerHTML='<div class="score-heading"><h2 id="scores-title">HIGH SCORES</h2><button id="close-scores">Close</button></div><form><label>Name or initials <input name="player" maxlength="16" required autocomplete="off"></label><button>Save score</button></form><p id="score-music" aria-live="polite"></p><p role="status" aria-live="polite"></p>';
 updateScoreMusic();dialog.setAttribute('aria-labelledby','scores-title');const form=dialog.querySelector('form')!;form.hidden=!pending;
 form.addEventListener('submit',event=>{event.preventDefault();if(!pending)return;const name=String(new FormData(form).get('player')??'');try{saveLevelScore('rooftop',{...pending,name});acceptedPlayerName(name);pending=null;finishCompactEntry(dialog);dialog.querySelector('[role=status]')!.textContent='Saved on this device. Online synchronization is automatic when enabled.';focusScoreEntry(dialog);}catch(error){dialog.querySelector('[role=status]')!.textContent=error instanceof Error?error.message:'Could not save score.';}});
 compactScoreEntry(dialog,!!pending,()=>{pending=null;finishCompactEntry(dialog);dialog.querySelector('[role=status]')!.textContent='Score not saved.';focusScoreEntry(dialog);});
 dialog.querySelector('#close-scores')!.addEventListener('click',()=>dialog.close());showScoreDialog(dialog);
}
export function offerScore(result:Result){if(document.body.dataset.review==='true')return;resetCompactEntry(dialog);pending={...result,id:crypto.randomUUID(),date:new Date().toISOString()};render();}
export function resetScoreEntry(){resetCompactEntry(dialog);pending=null;if(dialog.open)dialog.close();}
const browser=document.createElement('dialog');browser.id='level-score-browser';browser.className='score-dialog';browser.setAttribute('aria-labelledby','level-score-title');document.getElementById('game')!.append(browser);
browser.innerHTML='<div class="score-heading score-browser-heading"><h2 id="level-score-title">HIGH SCORES</h2><button class="browser-close" type="button">Close</button></div><p role="status"></p><div class="score-actions"><button class="clear-local-rooftop" type="button">Clear high scores</button></div><form class="browser-clear-form" hidden><p>Clear current-rule Level 1 rooftop scores saved in this browser. Earlier scores are preserved.</p><label><input name="confirm" type="checkbox" required> Permanently delete current-rule Level 1 rooftop scores in this browser</label><button>Confirm clear</button></form>';
let browserReturnFocus:HTMLElement|null=null;
browser.addEventListener('close',()=>browserReturnFocus?.focus({preventScroll:true}));
browser.querySelector('.browser-close')!.addEventListener('click',()=>browser.close());
const browserClear=browser.querySelector<HTMLFormElement>('.browser-clear-form')!;
browser.querySelector('.clear-local-rooftop')!.addEventListener('click',()=>{browserClear.hidden=false;browserClear.querySelector<HTMLInputElement>('[name=confirm]')!.focus();});
browserClear.addEventListener('submit',async event=>{event.preventDefault();if(!browserClear.querySelector<HTMLInputElement>('[name=confirm]')!.checked){browser.querySelector('[role=status]')!.textContent='Confirm that you want to clear these device scores.';return;}const button=browserClear.querySelector('button')!;button.disabled=true;try{clearLocalRooftop();browserClear.reset();mountScoreBrowser(browser);browser.querySelector('[role=status]')!.textContent='Level 1 rooftop scores cleared in this browser.';}catch(error){browser.querySelector('[role=status]')!.textContent=error instanceof Error?error.message:'Could not clear scores.';}finally{button.disabled=false;}});
document.getElementById('high-scores')!.addEventListener('click',()=>{if(document.querySelector('.score-dialog[open]'))return;browserReturnFocus=document.activeElement as HTMLElement;const unfinished=document.querySelector<HTMLDialogElement>('.score-dialog[data-entry=true]');showScoreDialog(unfinished??browser);});


function clearLocalRooftop(){const rows=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');localStorage.setItem(LOCAL_KEY,JSON.stringify(rows.filter((p:any)=>p.level!=='rooftop'||!isCurrentScore(p))));}

function updateScoreMusic(){const label=dialog.querySelector('#score-music');if(label)label.textContent=gameAudio.music.outcome?`Music: ${gameAudio.music.track.title} · ${gameAudio.music.status}`:'';}
gameAudio.music.subscribe(updateScoreMusic);
