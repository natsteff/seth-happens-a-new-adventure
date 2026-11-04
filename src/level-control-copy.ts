// Keep shared mobile labels accurate when switching between platforming and riding.
export function levelControlCopy(level:string){
 const riding=level==='scooter';
 for(const [selector,copy] of [
  ['[data-touch="jump"] span','Hop'],
  ['.touch-hint','Left: brake · Right: accelerate']
 ]){
  const el=document.querySelector<HTMLElement>(selector);if(!el)continue;
  if(riding){if(el.textContent!==copy){el.dataset.platformerCopy=el.textContent??'';el.textContent=copy;}}
  else if(el.dataset.platformerCopy!==undefined){el.textContent=el.dataset.platformerCopy;delete el.dataset.platformerCopy;}
 }
 document.querySelector('[data-touch="left"]')?.setAttribute('aria-label',riding?'Brake':'Move left');
 document.querySelector('[data-touch="right"]')?.setAttribute('aria-label',riding?'Accelerate':'Move right');
}
