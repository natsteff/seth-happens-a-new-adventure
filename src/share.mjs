export const shareLinks = {
 game: {title:'Seth Happens 2',url:'https://natsteff.github.io/seth-happens-a-new-adventure/',label:'Game'},
 soundtrack: {title:'Seth Happens 2 soundtrack',url:'https://suno.com/playlist/6f596364-f5aa-4fea-8732-fde11fe15526',label:'Soundtrack'},
};
export async function shareLink(data,platform=navigator){
 if(typeof platform.share==='function'){
  try{await platform.share({title:data.title,url:data.url});return 'shared';}
  catch(error){if(error?.name==='AbortError')return 'cancelled';}
 }
 try{await platform.clipboard.writeText(data.url);return 'copied';}catch{return 'manual';}
}
export function installShareMenu(dialog){
 const menu=dialog.querySelector('#share-menu'),summary=menu.querySelector('summary');
 const status=dialog.querySelector('#share-status'),manual=dialog.querySelector('#share-link');
 let busy=false,timer,generation=0;
 const close=()=>{menu.open=false;};
 document.addEventListener('click',event=>{if(!menu.contains(event.target))close();});
 dialog.addEventListener('close',()=>{close();generation++;clearTimeout(timer);status.textContent='';manual.hidden=true;dialog.querySelector('#menu-install').open=false;});
 dialog.addEventListener('cancel',event=>{if(menu.open){event.preventDefault();event.stopImmediatePropagation();close();summary.focus();}},true);
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();event.stopPropagation();close();summary.focus();}});
 for(const button of menu.querySelectorAll('[data-share]'))button.addEventListener('click',async()=>{
  if(busy)return;
  busy=true;const request=generation;
  clearTimeout(timer);status.textContent='';manual.hidden=true;close();
  const data=shareLinks[button.dataset.share];
  const result=await shareLink(data);
  busy=false;
  if(request!==generation||!dialog.open)return;
  summary.focus({preventScroll:true});
  if(result==='cancelled')return;
  status.textContent=result==='copied'?`${data.label} link copied!`:result==='shared'?'Share request sent.':'Copy this link to share:';
  if(result==='manual'){manual.value=data.url;manual.hidden=false;manual.focus();manual.select();}
  else timer=setTimeout(()=>{status.textContent='';},4000);
 });
}
