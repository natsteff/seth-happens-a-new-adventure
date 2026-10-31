export const GROCERY={width:6500,height:1120,ground:900,startX:170,checkoutX:5520,exitX:6220};
export const groceries=[{id:'milk',name:'MILK',department:'DAIRY',x:1870,bottom:900},{id:'bread',name:'BREAD',department:'BAKERY',x:3270,bottom:700},{id:'eggs',name:'EGGS',department:'FARM FRESH',x:4430,bottom:810}];
export function newGroceryRun(){return {items:/** @type {string[]} */ ([]),paid:false,complete:false};}
export function groceryAction(state,{x,bottom,action=false}){
 const s={...state,items:[...state.items]};let event='';if(s.complete||!action)return {state:s,event};
 const near=(px,py)=>Math.abs(x-px)<85&&Math.abs(bottom-py)<26;
 const item=groceries.find(item=>!s.items.includes(item.id)&&near(item.x,item.bottom));
 if(item){s.items.push(item.id);event=item.id;}
 else if(near(GROCERY.checkoutX,GROCERY.ground)){if(groceries.every(item=>s.items.includes(item.id))){if(!s.paid){s.paid=true;event='checkout';}}else event='missing';}
 else if(near(GROCERY.exitX,GROCERY.ground)){if(s.paid){s.complete=true;event='complete';}else event='unpaid';}
 return {state:s,event};
}
export function groceryScore(s,elapsedMs,hits){return s.complete?Math.max(0,6500-Math.ceil(elapsedMs/1000)*5-hits*90):0;}
export function grocerySlippery(x){return x>2450&&x<2810||x>4750&&x<5050;}
