export const SNOW={width:6600,height:1000,ground:800,startX:140,exitX:6320};
export const icePatches=[[700,1900],[2850,4100],[4900,6100]];
export function onIce(x,bottom){return Math.abs(bottom-SNOW.ground)<8&&icePatches.some(([a,b])=>x>=a&&x<=b);}
export function winterVelocity(velocity,direction,sprint,ice,delta){const target=direction*(sprint?355:260),rate=ice?(direction?1.35:.55):14;return target+(velocity-target)*Math.exp(-rate*Math.max(0,Math.min(100,delta))/1000);}
export function blizzardAlpha(elapsed){return .04+.12*Math.max(0,Math.sin(elapsed/7000));}
export function snowScore(complete,elapsed,hits){return complete?Math.max(0,6500-Math.floor(elapsed/1000)*8-hits*125):0;}
