// Keep shared mobile labels accurate when switching between platforming and riding.
export function levelControlCopy(level:string){
 const riding=level==='scooter';
 for(const [selector,copy] of [
  ['[data-touch="jump"] span','Hop'],
  ['.touch-hint','Left: brake · Right: accelerate'],
  ['#touch-style-help','Scooter auto-rides forward. Left brakes; right accelerates. Jump hops. Ramps launch automatically. Action toggles the optional high ramp.']
 ]){
  const el=document.querySelector<HTMLElement>(selector);if(!el)continue;
  if(riding){if(el.textContent!==copy){el.dataset.platformerCopy=el.textContent??'';el.textContent=copy;}}
  else if(el.dataset.platformerCopy!==undefined){el.textContent=el.dataset.platformerCopy;delete el.dataset.platformerCopy;}
 }
 document.querySelector('[data-touch="left"]')?.setAttribute('aria-label',riding?'Brake':'Move left');
 document.querySelector('[data-touch="right"]')?.setAttribute('aria-label',riding?'Accelerate':'Move right');
}
