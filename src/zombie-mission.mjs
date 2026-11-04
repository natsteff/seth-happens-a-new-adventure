const truckX=2810,truckStartX=truckX+160;
const exitX=truckStartX+3*(6600-truckStartX);
const breakdownX=(truckStartX+exitX)/2;
export const zombieBreakdownMs=950;
export const ZOMBIE={width:exitX+300,height:1000,ground:800,startX:140,truckX,truckStartX,breakdownX,exitX};
export const zombieBatReach=84;
export function zombieBatTarget(playerX,playerY,zombies){
 let target;
 let closest=zombieBatReach;
 for(const zombie of zombies){
  if(!zombie.alive||Math.abs(playerY-(zombie.floor-30))>55)continue;
  const distance=Math.abs(playerX-zombie.art.x);
  if(distance<=closest){closest=distance;target=zombie;}
 }
 return target;
}
export const zombiePlatforms=[[650,730,95,70],[940,670,310,130],[1510,730,100,70],[1800,670,310,130],[2230,730,100,70]];
export function newZombieRun(){return {phase:'survival',truck:false,crushed:0,complete:false};}
export function zombieAction(state,{x,bottom,action=false,breakdownFinished=false}){
 const s={...state};let event='';if(s.complete)return {state:s,event};
 if(s.phase==='survival'&&action&&Math.abs(x-ZOMBIE.truckX)<110&&Math.abs(bottom-ZOMBIE.ground)<30){s.truck=true;s.phase='truck';event='truck';}
 else if(s.phase==='truck'&&x>=ZOMBIE.breakdownX){s.truck=false;s.phase='breakdown';event='breakdown';}
 else if(s.phase==='breakdown'&&breakdownFinished){s.phase='on-foot';event='dismount';}
 else if(s.phase==='on-foot'&&x>=ZOMBIE.exitX){s.complete=true;s.phase='complete';event='escape';}return {state:s,event};
}
export function zombieContact({truck,playerX,playerY,zombieX,zombieY,allyX,allyY}){if(!truck&&Math.abs(allyX-zombieX)<38&&Math.abs(allyY-zombieY)<58)return 'allison';if(Math.abs(playerX-zombieX)>(truck?130:30)||Math.abs(playerY-zombieY)>(truck?65:55))return '';return truck?'crush':'hit';}
export function zombieScore(s,elapsed,hits){return s.complete?Math.max(0,6000+s.crushed*100-Math.floor(elapsed/1000)*5-hits*100):0;}
