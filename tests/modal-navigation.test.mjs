import test from 'node:test';
import assert from 'node:assert/strict';
import {ModalNavigation} from '../src/modal-navigation.mjs';
function dialog(open=false){return {open,shows:0,showModal(){assert.equal(this.open,false);this.open=true;this.shows++;},close(){this.open=false;}};}
test('help/customization replace the parent and restore it without releasing pause',()=>{
 const nav=new ModalNavigation(),menu=dialog(true),help=dialog(),controls=dialog();let focused=0;
 for(const child of [help,controls,help]){
  const before=child.shows;nav.open(child,menu,{focus(){focused++;}});
  assert.equal(menu.open,false);assert.equal(child.open,true);
  nav.open(child,menu);assert.equal(child.shows,before+1);
  child.close();nav.restore(child);assert.equal(menu.open,true);
 }
 assert.equal(focused,3);
});
test('restart/level change discard pending returns and close the child before old close events',()=>{
 const nav=new ModalNavigation(),menu=dialog(true),help=dialog();
 nav.open(help,menu);nav.reset();nav.restore(help);
 assert.equal(menu.open,false);assert.equal(help.open,false);
 menu.showModal();nav.open(help,menu);nav.restore(help);
 assert.equal(menu.open,false,'an old queued close cannot restore while the child is open');
 help.close();nav.restore(help);assert.equal(menu.open,true);
});
test('initial mobile offer returns from help, while a standalone child has no parent',()=>{
 const nav=new ModalNavigation(),offer=dialog(true),help=dialog();
 nav.open(help,offer);assert.equal(offer.open,false);help.close();nav.restore(help);assert.equal(offer.open,true);
 offer.close();nav.open(help,null);help.close();nav.restore(help);assert.equal(offer.open,false);
});
