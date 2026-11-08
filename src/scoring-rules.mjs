/** Current scoring formulas; no historical scoring editions. */
export const ROOFTOP_MISHAP_POINTS={falls:300,squishes:250,bumps:200};
export const rooftopPenalty=m=>m.falls*ROOFTOP_MISHAP_POINTS.falls+m.squishes*ROOFTOP_MISHAP_POINTS.squishes+m.bumps*ROOFTOP_MISHAP_POINTS.bumps;
export const CARNIVAL_BONUS={wheel:150,coaster:75};
export const CABIN_CONDITION_LOSS={collision:5,respawn:15};
