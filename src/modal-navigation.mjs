// Visit child dialogs without stacking native modals or releasing game pause.
export class ModalNavigation {
 parents=new Map();
 open(child,parent,focus){
  if(child.open)return;
  if(parent?.open){this.parents.set(child,parent);parent.close();}
  child.showModal();focus?.focus({preventScroll:true});
 }
 restore(child){
  if(child.open)return; // A delayed close event may belong to the previous visit.
  const parent=this.parents.get(child);this.parents.delete(child);
  if(parent&&!parent.open)parent.showModal();
 }
 reset(){
  const children=[...this.parents.keys()];this.parents.clear();
  for(const child of children)if(child.open)child.close();
 }
}
export const modalNavigation=new ModalNavigation();
