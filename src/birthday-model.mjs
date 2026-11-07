export const BIRTHDAY_SECONDS=20;
export const birthdayActive=date=>date.getMonth()===10&&date.getDate()>=7&&date.getDate()<=9;
export const birthdayKey=year=>`seth-happens-2.birthday.auto.${year}`;
export function birthdayDue(storage,date){if(!birthdayActive(date))return false;try{return storage?.getItem(birthdayKey(date.getFullYear()))!=='played';}catch{return true;}}
export function rememberBirthday(storage,year){try{storage?.setItem(birthdayKey(year),'played');}catch{/* Session guard still prevents repeats. */}}
export function birthdayPreview({dev,hostname,search}){return dev&&['localhost','127.0.0.1','[::1]'].includes(hostname)&&new URLSearchParams(search).get('birthday')==='preview';}
export function birthdayPhase(t){return t<2?'reveal':t<6?'beer-dance':t<10?'ridiculous':t<12?'birthday':t<15?'grand-finale':t<17?'photo':'achievement';}
export function birthdayCue(t){return t<2?'A perfectly normal birthday. Allegedly.':t<6?'Seth: “I still have all my original dance moves.”':t<10?'Allison: “Unfortunately.”':t<12?'HAPPY BIRTHDAY, SETH!':t<15?'Allison: “Hold that. For evidence.”':t<17?'CLICK. Saved for absolutely everyone.':'Allison: “This is going on the fridge.”';}
/** Master clock follows media whenever audible playback exists. Silent fallback is explicit. */
export class BirthdayClock{
 constructor(){this.time=0;this.silent=false;this.paused=true;this.last=0;}
 start(silent,now){this.time=0;this.silent=silent;this.paused=false;this.last=now;}
 tick(audioTime,now){if(this.paused){this.last=now;return this.time;}if(this.silent)this.time+=Math.max(0,now-this.last)/1000;else if(Number.isFinite(audioTime))this.time=Math.max(this.time,audioTime);this.last=now;return Math.min(BIRTHDAY_SECONDS,this.time);}
 pause(){this.paused=true;}
 resume(now){this.paused=false;this.last=now;}
 fallback(now){this.silent=true;this.last=now;}
}
