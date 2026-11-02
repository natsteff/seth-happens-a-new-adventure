import {mountScoreBrowser} from './score-browser';
import {savedPlayerName,rememberPlayerName,fitScoreDialog,normalizedScoreName} from './score-options.mjs';
type EntryState={draft:string;editing:boolean};
const states=new WeakMap<HTMLDialogElement,EntryState>(),installed=new WeakSet<HTMLDialogElement>();
const storage=()=>{try{return localStorage;}catch{return null;}};
export function resetCompactEntry(dialog:HTMLDialogElement){states.delete(dialog);delete dialog.dataset.entry;delete dialog.dataset.browse;}
export function acceptedPlayerName(name:string){rememberPlayerName(storage(),name);}
export function fitOpenScoreDialogs(){document.querySelectorAll<HTMLDialogElement>('.score-dialog[open]').forEach(dialog=>fitScoreDialog(dialog));}
for(const event of ['resize','scroll'])window.visualViewport?.addEventListener(event,fitOpenScoreDialogs);
window.addEventListener('resize',fitOpenScoreDialogs);
export function finishCompactEntry(dialog:HTMLDialogElement){dialog.dataset.entry='false';states.delete(dialog);const heading=dialog.querySelector<HTMLElement>('h2');if(heading?.dataset.recordsTitle)heading.textContent=heading.dataset.recordsTitle;dialog.querySelector('form')!.hidden=true;mountScoreBrowser(dialog);fitScoreDialog(dialog);}
export function focusScoreEntry(dialog:HTMLDialogElement){fitScoreDialog(dialog);const selector=dialog.dataset.entry==='true'?(states.get(dialog)?.editing?'[name=player]':'.score-save'):'.score-actions button';dialog.querySelector<HTMLElement>(selector)?.focus({preventScroll:true});requestAnimationFrame(()=>fitScoreDialog(dialog));}
export function setScoreEntryBusy(dialog:HTMLDialogElement,busy:boolean){dialog.querySelectorAll<HTMLButtonElement>('form.entry-form button').forEach(b=>b.disabled=busy);}
export function compactScoreEntry(dialog:HTMLDialogElement,pending:boolean,onSkip:()=>void){
 if(!installed.has(dialog)){installed.add(dialog);let previous:HTMLElement|null=null;dialog.addEventListener('close',()=>{previous?.isConnected&&previous.focus({preventScroll:true});});dialog.addEventListener('score-opening',()=>{previous=document.activeElement as HTMLElement;});}
 dialog.dataset.entry=String(pending);fitScoreDialog(dialog);if(!pending){states.delete(dialog);return;}
 const form=dialog.querySelector<HTMLFormElement>('form')!,input=form.querySelector<HTMLInputElement>('[name=player]')!,save=form.querySelector<HTMLButtonElement>('button')!,label=input.closest('label')!;
 form.classList.add('entry-form');
 form.addEventListener('submit',event=>{try{normalizedScoreName(input.value);const state=states.get(dialog);if(state)state.draft=input.value;}catch(error){event.preventDefault();event.stopImmediatePropagation();dialog.querySelector('[role=status]')!.textContent=error instanceof Error?error.message:'Enter a name.';}},true);save.type='submit';save.classList.add('score-save');save.textContent='Save score';
 input.maxLength=16;input.required=true;input.autocomplete='off';input.setAttribute('autocorrect','off');input.spellcheck=false;input.setAttribute('autocapitalize','words');input.setAttribute('enterkeyhint','done');input.setAttribute('aria-label','Name or initials');
 let state=states.get(dialog);if(!state){const remembered=savedPlayerName(storage());state={draft:input.value||remembered,editing:!remembered};states.set(dialog,state);}input.value=state.draft;
 const heading=dialog.querySelector<HTMLElement>('h2')!;heading.dataset.recordsTitle??=heading.textContent??'High scores';heading.textContent='Save your score';
 const summary=document.createElement('div');summary.className='saved-name';const text=document.createElement('strong');text.textContent=`Save as ${state.draft}`;
 const change=document.createElement('button');change.type='button';change.textContent='Change name';summary.append(text,change);form.insertBefore(summary,label);
 const update=()=>{label.hidden=!state!.editing;summary.hidden=state!.editing;};update();
 input.addEventListener('input',()=>{state!.draft=input.value;});change.addEventListener('click',()=>{state!.editing=true;update();input.focus();fitScoreDialog(dialog);});
 const browse=document.createElement('button');browse.type='button';browse.textContent='View records';browse.addEventListener('click',()=>{dialog.dataset.browse=String(dialog.dataset.browse!=='true');browse.textContent=dialog.dataset.browse==='true'?'Hide records':'View records';fitScoreDialog(dialog);});form.append(browse);
 const skip=document.createElement('button');skip.type='button';skip.textContent='Skip saving';skip.className='skip-score';skip.addEventListener('click',onSkip);form.append(skip);
}
export function showScoreDialog(dialog:HTMLDialogElement){mountScoreBrowser(dialog);if(!dialog.open){window.dispatchEvent(new Event('score-modal-opening'));dialog.dispatchEvent(new Event('score-opening'));dialog.showModal();}focusScoreEntry(dialog);}
