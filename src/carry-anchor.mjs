// Palm positions in the shipped 384x512 empty-handed frames, normalized to
// the visible 62x82 character. Item handles, not item centers, attach here.
export function carryAnchor({x,bottom,facing=1,frame=1,falling=false}){
 const i=((Number(frame)||0)%4+4)%4;
 const palms=falling?[[120,40],[120,40],[120,40],[70,90]]:[[125,285],[155,285],[210,250],[125,285]];
 const [px,py]=palms[i];
 return {x:x+(px-192)*62/384*facing,y:bottom+(py-512)*82/512};
}
