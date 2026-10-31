// Array order is the player-facing track number, matching its associated level.
export const radioTracks=[
 {title:'Arcade Staircase',description:'Level 1 · Rooftop Beer Run soundtrack',file:'arcade-staircase.mp3',unlockLevel:'rooftop',unlockAfter:0},
 {title:'Thai Food Run',description:'Level 2 · Thai Takeout Run soundtrack',file:'thai-food-run.mp3',unlockLevel:'thai',unlockAfter:1},
 {title:'Scooter Run',description:'Level 3 · Scooter Ride soundtrack',file:'scooter-run.mp3',unlockLevel:'scooter',unlockAfter:2},
 {title:'Eye of the Stairwell (Leads Take Me Away!)',description:'Level 4 · Concert Chaos soundtrack',file:'concert-eye-of-the-stairwell.mp3',unlockLevel:'concert',unlockAfter:3},
 {title:'The Haunted Happy Hour',description:'Level 5 · Haunted House soundtrack',file:'haunted-happy-hour.mp3',unlockLevel:'haunted',unlockAfter:4},
 {title:'The Beer of Destiny',description:'Level 6 · Zombie Apocalypse soundtrack',file:'beer-of-destiny.mp3',unlockLevel:'zombie',unlockAfter:5},
 {title:'Twenty-Six Floors of Celts',description:'Level 7 · Snow Day From Hell soundtrack',file:'twenty-six-floors-of-glory.mp3',unlockLevel:'snow',unlockAfter:6},
 {title:'Go Seth Go',description:'Level 8 · Carnival Catastrophe soundtrack',file:'go-seth-go.mp3',unlockLevel:'carnival',unlockAfter:7}
];
export const DEFAULT_RADIO_TRACK=0;
// v0.8.2 and earlier stored numeric indices in this order. Always migrate by file.
export const legacyRadioFiles=['arcade-staircase.mp3','beer-of-destiny.mp3','twenty-six-floors-of-glory.mp3','go-seth-go.mp3','haunted-happy-hour.mp3','thai-food-run.mp3','scooter-run.mp3','concert-eye-of-the-stairwell.mp3'];
export function legacyRadioTrack(index){return radioTracks.findIndex(track=>track.file===legacyRadioFiles[index]);}
/** @param {(level: string) => boolean} canPlay */
export function unlockedRadioTracks(canPlay=()=>false){return radioTracks.flatMap((track,index)=>index===0||canPlay(track.unlockLevel)?[index]:[]);}
export function defaultLevelTrack(level){if(level==='encore')return 3;return Math.max(0,radioTracks.findIndex(track=>track.unlockLevel===level));}
export function nextRadioTrack(index,step,available=unlockedRadioTracks()){
 const position=available.indexOf(index),base=position<0?0:position;
 return available[((base+step)%available.length+available.length)%available.length];
}
export function radioShortcut(code){
 if(code==='Digit0'||code==='Numpad0')return {off:true};
 const digit=/^(?:Digit|Numpad)([1-8])$/.exec(code);
 if(digit)return {track:Number(digit[1])-1};
 if(code==='BracketLeft')return {step:-1};
 if(code==='BracketRight')return {step:1};
 return null;
}

export const countdownTracks=[{title:'The Final Warning',description:'Final countdown',file:'the-final-warning.mp3'},{title:'System Failure Imminent',description:'Final countdown',file:'system-failure-imminent.mp3'}];

export const championTracks=[{title:'26 Floors of Glory',description:'Champion Track',file:'26-floors-of-glory.mp3'},{title:'Eye of the Stairwell',description:'Champion Track',file:'eye-of-the-stairwell.mp3'}];
export const failureTrack={title:'Failure - Twenty-Six Floors for Nothing',description:'Time’s up',file:'failure-twenty-six-floors-for-nothing.mp3'};
export const cheaterTrack={title:'Big Stupid Cheater',description:'Elevator shortcut',file:'big-stupid-cheater.mp3'};
