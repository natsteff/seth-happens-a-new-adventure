import {setControllerUIBlocked} from './controller.mjs';

// Menu input is sampled before scene updates. Held controls must return to neutral
// after focus loss, a new controller, or a modal transition before another action.
export class ControllerUIInput {
 id='';armed=false;previous=[];direction='';repeatAt=0;
 sample(pads,enabled=true,now=performance.now()){
  const pad=Array.from(pads).find(p=>p?.connected&&p.mapping==='standard');
  const empty={connected:!!pad,confirm:false,back:false,menu:false,restart:false,direction:'',neutral:false};
  if(!pad){this.id='';this.armed=false;return empty;}
  const id=`${pad.index}:${pad.id}`,pressed=pad.buttons.map(b=>b.pressed||b.value>.45);
  const x=pad.axes[0]||0,y=pad.axes[1]||0;
  const direction=pressed[12]?'up':pressed[13]?'down':pressed[14]?'left':pressed[15]?'right':Math.abs(y)>.55&&Math.abs(y)>=Math.abs(x)?(y<0?'up':'down'):Math.abs(x)>.55?(x<0?'left':'right'):'';
  const neutral=!pressed.some(Boolean)&&Math.abs(x)<.25&&Math.abs(y)<.25;
  if(id!==this.id){this.id=id;this.armed=false;}
  if(!enabled){this.armed=false;this.previous=pressed;this.direction='';return empty;}
  if(!this.armed){this.armed=neutral;this.previous=pressed;this.direction='';return {...empty,neutral};}
  const edge=i=>!!pressed[i]&&!this.previous[i];
  const repeat=direction&&(direction!==this.direction||now>=this.repeatAt);
  if(repeat)this.repeatAt=now+(direction!==this.direction?350:130);
  const result={...empty,confirm:edge(0),back:edge(1),menu:edge(9),restart:!!pressed[3],direction:repeat?direction:'',neutral};
  this.direction=direction;this.previous=pressed;return result;
 }
}
const focusable='button,input:not([type=hidden]),select,textarea,summary,a[href],[tabindex="0"]';
export function visibleControls(root){
 return [...root.querySelectorAll(focusable)].filter(e=>!e.disabled&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden],[inert]')&&![...root.querySelectorAll('details:not([open])')].some(details=>details.contains(e)&&!details.querySelector('summary')?.contains(e)));
}
function focus(element){element?.focus({preventScroll:true});element?.scrollIntoView({block:'nearest',inline:'nearest'});}
export function moveControllerFocus(root,direction){
 const controls=visibleControls(root);if(!controls.length)return;
 const current=document.activeElement,index=controls.indexOf(current);
 if(index<0){focus(controls[0]);return;}
 const horizontal=direction==='left'||direction==='right',sign=direction==='left'||direction==='up'?-1:1;
 if(horizontal&&current instanceof HTMLInputElement&&current.type==='range'){
  sign>0?current.stepUp():current.stepDown();current.dispatchEvent(new Event('input',{bubbles:true}));current.dispatchEvent(new Event('change',{bubbles:true}));return;
 }
 if(horizontal&&current instanceof HTMLSelectElement){let next=current.selectedIndex+sign;while(next>=0&&next<current.options.length&&current.options[next].disabled)next+=sign;if(next>=0&&next<current.options.length){current.selectedIndex=next;current.dispatchEvent(new Event('change',{bubbles:true}));}return;}
 if(root.classList.contains('controller-name')&&current.closest('.controller-characters')&&!horizontal){const letters=[...root.querySelectorAll('.controller-characters button')],at=letters.indexOf(current),next=at+sign*6;focus(next>=0&&next<letters.length?letters[next]:sign>0?root.querySelector('.controller-name-actions button'):controls.at(-1));return;}
 // Up/down follows document order, reaching every control even in long scrolling
 // menus; left/right does the same except for editable sliders and selects.
 focus(controls[(index+sign+controls.length)%controls.length]);
}
let editor;
export function openControllerName(input){
 if(editor?.open)return;
 const previous=document.activeElement,dialog=document.createElement('dialog');editor=dialog;dialog.className='controller-name';dialog.setAttribute('aria-label','Enter name with controller');
 const heading=document.createElement('h2');heading.textContent='Name or initials';
 const preview=document.createElement('output');preview.setAttribute('aria-live','polite');
 const grid=document.createElement('div');grid.className='controller-characters';
 let draft=input.value;const update=()=>{preview.textContent=draft||'Choose letters below';};update();
 const finish=()=>{input.value=draft;input.dispatchEvent(new Event('input',{bubbles:true}));dialog.close();};
 for(const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'){
  const button=document.createElement('button');button.type='button';button.textContent=character;button.onclick=()=>{if(draft.length<(input.maxLength>0?input.maxLength:16))draft+=character;update();};grid.append(button);
 }
 const actions=document.createElement('div');actions.className='controller-name-actions';
 for(const [label,action] of [['Space',()=>{if(draft.length<16)draft+=' ';update();}],['Delete',()=>{draft=draft.slice(0,-1);update();}],['Clear',()=>{draft='';update();}],['Done',finish],['Cancel',()=>dialog.close()]]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=action;actions.append(button);
 }
 const help=document.createElement('p');help.textContent='D-pad / stick: choose · A / Cross: select · B / Circle: cancel';
 dialog.append(heading,preview,grid,actions,help);document.body.append(dialog);dialog.showModal();focus(grid.firstElementChild);
 dialog.addEventListener('close',()=>{dialog.remove();previous?.isConnected&&previous.focus({preventScroll:true});});
}
export function installControllerUI({onMenu,onRestart,onContinue,getScene}){
 const input=new ControllerUIInput();let previousModal=null,restartAt=null,holdBlock=false;
 const hint=document.createElement('p');hint.className='controller-ui-hint';hint.textContent='D-pad / stick: select · A / Cross: confirm · B / Circle: back · Menu / Options: game menu · Hold Y / Triangle: restart';
 function step(now=performance.now()){
  let pads=[];try{pads=navigator.getGamepads?.()??[];}catch{}
  const modals=[...document.querySelectorAll('dialog[open]')],modal=modals.at(-1)||null;
  if(modal!==previousModal){input.armed=false;previousModal=modal;restartAt=null;holdBlock=true;}
  const state=input.sample(pads,document.hasFocus()&&!document.hidden,now);
  const scene=getScene();
  if(state.neutral)holdBlock=false;
  const owned=!!modal||state.menu||state.restart||holdBlock;
  setControllerUIBlocked(owned);
  document.body.classList.toggle('controller-active',state.connected);
  const status=document.getElementById('controller-status'),label=state.connected?'Controller connected · Menu / Options for game menu':'Keyboard · pair a controller, then press a button';if(status&&status.textContent!==label)status.textContent=label;
  if(modal&&state.connected){
   if(hint.parentElement!==modal)modal.prepend(hint);
   if(!modal.contains(document.activeElement)||!visibleControls(modal).includes(document.activeElement))focus(visibleControls(modal)[0]);
  }else hint.remove();
  if(state.menu||state.back){
   if(modal){
    const details=modal.querySelector('#share-menu[open]');
    if(details){details.open=false;focus(details.querySelector('summary'));}
    else if(modal.dispatchEvent(new Event('cancel',{cancelable:true})))modal.close();
   }else if(state.menu||scene?.paused)onMenu();
   input.armed=false;holdBlock=true;setControllerUIBlocked(true);restartAt=null;return;
  }
  if(modal){
   restartAt=null;
   if(state.direction)moveControllerFocus(modal,state.direction);
   if(state.confirm){
    const element=document.activeElement;
    if(element instanceof HTMLInputElement&&element.name==='player')openControllerName(element);
    else if(modal.contains(element)&&visibleControls(modal).includes(element))element.click();
   }
   return;
  }
  if(state.restart&&scene&&!scene.introActive){
   restartAt??=now;if(now-restartAt>=650){onRestart();input.armed=false;restartAt=null;holdBlock=true;}
  }else restartAt=null;
  if(scene?.won&&state.confirm){onContinue();input.armed=false;holdBlock=true;setControllerUIBlocked(true);}
 }
 return {step};
}
