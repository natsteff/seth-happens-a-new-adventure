import {activeRuleset,BALANCED_LEVELS,ORIGINAL_RULESET} from './scoring-rules.mjs';
import {readLevelScores,onlineLevelScores,onlineEnabled,scoreReady} from './score-service';
import {deviceFallback} from './score-fallback.mjs';
import {formatRunSeconds} from './mission.mjs';
export const scoreLevels=[['rooftop','Rooftop Beer Run'],['thai','Thai Takeout Run'],['scooter','Scooter Ride'],['concert','Concert Chaos'],['haunted','Haunted House'],['zombie','Zombie Apocalypse'],['snow','Snow Day From Hell'],['carnival','Carnival Catastrophe'],['cabin','Cabin Fever'],['grocery','Grocery Store Gauntlet'],['soccer','Soccer Game Hijinx'],['lastcall','Last Call'],['encore','Encore · View-only finale']];
const selections=new WeakMap<HTMLDialogElement,string>();
const cleanups=new WeakMap<HTMLDialogElement,()=>void>();
function savedView(){try{return localStorage.getItem('seth-happens-2.score-view')==='local'?'local':'online';}catch{return 'online';}}
function rememberView(view:string){try{localStorage.setItem('seth-happens-2.score-view',view);}catch{/* Session preference still works. */}}
// Browsing never writes scores/progression or replaces a pending run's form.
export function mountScoreBrowser(dialog:HTMLDialogElement){
 cleanups.get(dialog)?.();
 const heading=dialog.querySelector<HTMLElement>('.score-heading');
 const close=dialog.querySelector<HTMLButtonElement>('#close-scores,#thai-close,#scooter-close,#adventure-close');
 if(heading&&close&&!heading.contains(close)){
  const title=document.createElement('div');
  title.append(...Array.from(heading.childNodes));
  heading.replaceChildren(title,close);
  heading.classList.add('score-browser-heading');
  close.classList.add('records-close');
 }
 dialog.querySelector('.score-browser')?.remove();
 const root=document.createElement('section');root.className='score-browser';
 const label=document.createElement('label');label.textContent='View scores for level';
 const select=document.createElement('select');select.setAttribute('aria-label','View scores for level');
 scoreLevels.forEach(([key,title],i)=>{const option=document.createElement('option');option.value=key;option.textContent=`${i+1} · ${title}`;select.append(option);});label.append(select);
 select.value=dialog.open?(selections.get(dialog)??document.body.dataset.level??'rooftop'):(document.body.dataset.level??'rooftop');
 if(!select.value)select.value='rooftop';
 dialog.querySelectorAll<HTMLElement>(':scope > p:not([role=status])').forEach(el=>el.hidden=true);
 const note=document.createElement('p');note.textContent='Saved in this browser only. Viewing another level keeps your current game unchanged.';
 if(document.body.dataset.review==='true')note.textContent+=' Playtest runs do not save scores.';
 const list=document.createElement('div');list.className='score-list';list.setAttribute('aria-live','polite');
 const toggle=document.createElement('div');toggle.className='score-actions';
 let view=savedView();
 const onlineButton=document.createElement('button'),deviceButton=document.createElement('button');onlineButton.type=deviceButton.type='button';onlineButton.textContent='Online';deviceButton.textContent='This Device';toggle.append(onlineButton,deviceButton);
 const editions=document.createElement('label');editions.textContent='Scoring rules';const edition=document.createElement('select');edition.setAttribute('aria-label','Scoring rules');edition.innerHTML='<option value=latest>Current balance</option><option value=original>Earlier scores · archived rules</option>';editions.append(edition);
 const more=document.createElement('button');more.type='button';more.textContent='Show all scores';
 let all=false,revision=0;
 async function render(){
  const current=++revision,level=select.value;editions.hidden=!BALANCED_LEVELS.includes(level);const archive=!editions.hidden&&edition.value==='original',ruleset=archive?ORIGINAL_RULESET:activeRuleset(level);
  onlineButton.setAttribute('aria-pressed',String(view==='online'));deviceButton.setAttribute('aria-pressed',String(view==='local'));
  selections.set(dialog,select.value);list.replaceChildren();dialog.querySelectorAll<HTMLElement>('.score-eyebrow').forEach(el=>el.hidden=select.value!==document.body.dataset.level);
  more.hidden=select.value==='encore';
  // Keep the existing rooftop clear action scoped to rooftop scores only.
  dialog.querySelectorAll<HTMLElement>('#clear-scores,#clear-form,#server-scores,#local-scores,.clear-local-rooftop,.browser-clear-form').forEach(el=>{if(el.id==='clear-form'||el.classList.contains('browser-clear-form'))el.hidden=true;else el.hidden=select.value!=='rooftop'||view!=='local'||archive;});
  toggle.hidden=false;
  try{
   if(select.value==='encore'){note.textContent='';editions.hidden=true;toggle.hidden=true;list.textContent='Encore is a view-only finale and has no high scores.';return;}
   note.textContent='Loading scores…';
   let records:any[];
   if(view==='online'){
    try{records=await onlineLevelScores(level,ruleset);if(current!==revision||!root.isConnected)return;note.textContent=archive?'Online · Earlier scores with the original rules. Kept separate from current scoring.':'Online · Top 25 per level. Ties favor the earliest run. Device scores synchronize automatically.';}
    catch{if(current!==revision||!root.isConnected)return;const fallback=deviceFallback(()=>readLevelScores(level,ruleset));records=fallback.scores;note.textContent=onlineEnabled()?fallback.notice:'Online scoring is not enabled. Showing This Device scores.';}
   }else{records=readLevelScores(level,ruleset);note.textContent=archive?'This Device · Earlier scores, preserved under their original rules.':onlineEnabled()?'This Device · Saved in this browser. Online synchronization stays active.':'This Device · Saved in this browser. Online scoring is not enabled.';}
   if(!records.length){list.textContent='No scores for this level yet.';more.hidden=true;return;}
   const table=document.createElement('table');table.innerHTML='<thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Run details</th></tr></thead>';
   const tbody=table.createTBody();
   const visible=all?records:[...records.filter((s:any)=>!s.cheater).slice(0,10),...records.filter((s:any)=>s.cheater)];
   visible.forEach((s:any,i:number)=>{
    const row=tbody.insertRow();if(s.cheater)row.className='cheater-row';
    row.insertCell().textContent=s.cheater?'—':String(i+1);row.insertCell().textContent=s.name+(s.cheater?' · CHEATER':'');row.insertCell().textContent=s.score.toLocaleString();
    const details=row.insertCell();details.className='run-details';
    const facts=[['Date',new Date(s.date).toLocaleDateString()],['Time',s.elapsedMs===undefined?'Legacy run':formatRunSeconds(s.elapsedMs)]];
    if(select.value==='rooftop')facts.push(['Photos',`${s.photos}/2${s.latePhotos?` · ${s.latePhotos} recovered`:''}`],['Six-pack',s.beer?'Delivered':s.cheater?'Skipped · elevator cheat':'Not delivered'],['Mishaps',`${s.falls} falls · ${s.squishes} squishes · ${s.bumps} bumps`],['Time bonus',s.cheater?'Shortcut: fixed −10,000':`+${(s.bonus??0).toLocaleString()}`]);
    else {facts.push(['Mishaps',String(s.hits)]);if(select.value==='thai')facts.push(['Food',`${s.condition}%`],['Warmth',`${s.warmth}%`]);if(select.value==='scooter')facts.push(['Grip',`${s.grip}%`]);if(select.value==='cabin'&&s.ruleset)facts.push(['Beer condition',`${s.condition}%`]);if(select.value==='carnival'&&s.ruleset)facts.push(['Optional bonuses',`${s.wheelBonus?'Wheel ✓':'Wheel skipped'} · ${s.coasterBonus?'Coaster ✓':'Coaster skipped'}`]);}
    for(const [name,value] of facts){const fact=document.createElement('div'),heading=document.createElement('span'),text=document.createElement('strong');heading.textContent=name.toUpperCase();text.textContent=value;fact.append(heading,text);details.append(fact);}
   });list.append(table);more.hidden=records.filter((s:any)=>!s.cheater).length<=10;
  }catch(error){list.textContent=error instanceof Error?error.message:'Could not read saved scores. Nothing was changed.';more.hidden=true;}
 }
 edition.addEventListener('change',()=>{all=false;more.textContent='Show all scores';void render();});
 select.addEventListener('change',()=>{edition.value='latest';all=false;more.textContent='Show all scores';render();});
 more.addEventListener('click',()=>{all=!all;more.textContent=all?'Show top 10':'Show all scores';render();});
 onlineButton.addEventListener('click',()=>{view='online';rememberView(view);all=false;more.textContent='Show all scores';void render();});
 deviceButton.addEventListener('click',()=>{view='local';rememberView(view);all=false;more.textContent='Show all scores';void render();});
 root.append(label,editions,toggle,note,list,more);
 void scoreReady.then(()=>{if(root.isConnected)void render();});
 const refresh=()=>{if(root.isConnected&&dialog.open)void render();};window.addEventListener('scores-changed',refresh);cleanups.set(dialog,()=>window.removeEventListener('scores-changed',refresh));
 // Original forms/save handlers and clear-password policy remain intact.
 dialog.querySelectorAll<HTMLElement>(':scope > .score-list,#all-scores').forEach(el=>el.hidden=true);
 dialog.querySelector('.score-actions')?.before(root);
 if(!root.isConnected)dialog.append(root);
 render();
}
