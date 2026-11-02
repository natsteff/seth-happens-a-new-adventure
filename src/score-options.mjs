export const PLAYER_NAME_KEY='seth-new-adventure.player-name.v1';
export function savedPlayerName(storage){try{const name=JSON.parse(storage?.getItem(PLAYER_NAME_KEY)??'null');return typeof name==='string'&&name.trim()&&name.length<=16?name.trim():'';}catch{return '';}}
export function rememberPlayerName(storage,name){try{if(typeof name!=='string'||!name.trim()||name.trim().length>16)return false;storage?.setItem(PLAYER_NAME_KEY,JSON.stringify(name.trim()));return !!storage;}catch{return false;}}
export function normalizedScoreName(name){if(typeof name!=='string'||!name.trim()||name.trim().length>16)throw Error('Enter a name or initials (1–16 characters).');return name.trim();}
export function fitScoreDialog(dialog,win=window){const v=win.visualViewport;for(const [key,value] of Object.entries({left:v?.offsetLeft??0,top:v?.offsetTop??0,width:v?.width??win.innerWidth,height:v?.height??win.innerHeight}))dialog.style.setProperty(`--score-${key}`,`${value}px`);}
