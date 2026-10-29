export const ZOMBIE={width:6900,height:1000,ground:800,startX:140,truckX:2810,exitX:6600};
export const zombiePlatforms=[[650,730,95,70],[940,670,310,130],[1510,730,100,70],[1800,670,310,130],[2230,730,100,70]];
export function newZombieRun(){return {phase:'survival',truck:false,crushed:0,complete:false};}
export function zombieAction(state,{x,bottom,action=false}){
 const s={...state};let event='';if(s.complete)return {state:s,event};
 if(!s.truck&&action&&Math.abs(x-ZOMBIE.truckX)<110&&Math.abs(bottom-ZOMBIE.ground)<30){s.truck=true;s.phase='truck';event='truck';}
 else if(s.truck&&x>=ZOMBIE.exitX){s.complete=true;s.phase='complete';event='escape';}return {state:s,event};
}
export function zombieContact({truck,playerX,playerY,zombieX,zombieY,allyX,allyY}){if(Math.abs(allyX-zombieX)<90&&Math.abs(allyY-zombieY)<80)return 'allison';if(Math.abs(playerX-zombieX)>(truck?100:30)||Math.abs(playerY-zombieY)>(truck?65:55))return '';return truck?'crush':'hit';}
export function zombieScore(s,elapsed,hits){return s.complete?Math.max(0,6000+s.crushed*100-Math.floor(elapsed/1000)*5-hits*100):0;}
