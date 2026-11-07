/** Sprite selection uses the same song position as the rest of the birthday choreography. */
export function birthdaySethFrame(t,reduced=false){if(t<2)return 0;if(t>=15)return 7;const frames=t<6?[0,1,2,3,2,1]:t<10?[4,5,4,6,5,6]:t<12?[5,4,5,6]:[6,7,6,7];return frames[reduced?0:Math.floor(t*5)%frames.length];}
export function birthdayAllisonFrame(t){return t<6?0:t<10?1:t<12?2:t<15?3:t<15.35?4:t<16?5:t<17?6:7;}
export function birthdayBanner(t,reduced=false){
 if(t<9.3)return {visible:false,frame:0,drop:0,sway:0};
 if(reduced)return {visible:true,frame:5,drop:1,sway:0};
 const elapsed=t-9.3,drop=Math.min(1,elapsed/.65),settle=Math.max(0,elapsed-.65);
 const frame=elapsed<.65?0:settle<.2?1:settle<.5?2:settle<.8?3:settle<1.05?2:settle<1.35?3:settle<1.75?4:5;
 return {visible:true,frame,drop:1-(1-drop)**3,sway:settle<1.75?Math.sin(settle*12)*Math.exp(-settle*2)*.022:0};
}
