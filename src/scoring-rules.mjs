/** These three rule sets change together; all other level identities stay untouched. */
export const BALANCED_LEVELS=['rooftop','carnival','cabin'];
export const BALANCE_RULESET='risk-v2';
export const ORIGINAL_RULESET='original';
export const activeRuleset=level=>BALANCED_LEVELS.includes(level)?BALANCE_RULESET:ORIGINAL_RULESET;
export const recordRuleset=record=>record.ruleset??ORIGINAL_RULESET;
export const isCurrentScore=record=>recordRuleset(record)===activeRuleset(record.level);
export const ROOFTOP_MISHAP_POINTS={falls:300,squishes:250,bumps:200};
export const rooftopPenalty=m=>m.falls*ROOFTOP_MISHAP_POINTS.falls+m.squishes*ROOFTOP_MISHAP_POINTS.squishes+m.bumps*ROOFTOP_MISHAP_POINTS.bumps;
export const CARNIVAL_BONUS={wheel:150,coaster:75};
export const CABIN_CONDITION_LOSS={collision:5,respawn:15};
