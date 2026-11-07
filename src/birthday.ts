import {gameAudio} from './audio';
import {birthdayActive,birthdayDue,birthdayPreview,rememberBirthday,birthdayPhase,birthdayCue,BirthdayClock,BIRTHDAY_SECONDS} from './birthday-model.mjs';
import type {BirthdayArt} from './birthday-art';
/** Birthday state is entirely independent from progression, scores and the jukebox. */
export function installBirthday({canOpen,onOpen,onClose}:{canOpen:()=>boolean;onOpen:()=>void;onClose:()=>void}){
 let storage:Storage|null=null;try{storage=localStorage;}catch{}
 const preview=birthdayPreview({dev:import.meta.env.DEV,hostname:location.hostname,search:location.search});
 const buttons=[document.createElement('button'),document.createElement('button')];
 for(const button of buttons){button.type='button';button.className='birthday-replay';button.textContent='🎂 Birthday Surprise';button.hidden=true;button.addEventListener('click',()=>void open(false));}
 document.querySelector('.sound-row')!.append(buttons[0]);document.getElementById('touch-menu')!.append(buttons[1]);
 const dialog=document.createElement('dialog');dialog.id='birthday-surprise';dialog.setAttribute('aria-labelledby','birthday-title');dialog.setAttribute('aria-describedby','birthday-caption');
 dialog.innerHTML='<header class="birthday-header"><div><span>A HIGHLY CONFIDENTIAL CELEBRATION</span><h2 id="birthday-title">Birthday Surprise</h2></div><button class="birthday-skip" type="button">Skip</button></header><div class="birthday-stage"><canvas aria-label="Seth dances in a giant party hat while Allison prepares photographic evidence."></canvas><div class="birthday-banner-label sr-only">HAPPY BIRTHDAY<br>SETH!</div><div class="birthday-achievement"><span>★ ACHIEVEMENT UNLOCKED:</span><strong>SETH +1 YEAR!</strong><small>Photographic evidence acquired.</small></div></div><p id="birthday-caption" aria-live="polite"></p><p class="birthday-status" role="status"></p><div class="birthday-start"><button class="birthday-audio" type="button">Start with audio</button><button class="birthday-silent" type="button">Watch silently</button></div><div class="birthday-finished" hidden><button class="birthday-again" type="button">Replay</button><p>or replay anytime from the menu during the momentous day!</p></div>';
 document.getElementById('play-area')!.append(dialog);
 const canvas=dialog.querySelector('canvas')!,caption=dialog.querySelector('#birthday-caption')!,status=dialog.querySelector('.birthday-status')!,start=dialog.querySelector<HTMLElement>('.birthday-start')!;
 const audio=document.createElement('audio');audio.id='birthday-audio';audio.preload='none';audio.loop=false;dialog.append(audio);
 const clock=new BirthdayClock(),offered=new Set<number>(),played=new Set<number>();
 let art:BirthdayArt|undefined,frame=0,token=0,autoYear:number|undefined,running=false,opening=false,completed=false,closed=true,lastPhase='',unsubscribe:(()=>void)|undefined,observer:ResizeObserver|undefined,watchdog:ReturnType<typeof setTimeout>|undefined;
 let previousFocus:HTMLElement|null=null,context:AudioContext|undefined,gain:GainNode|undefined,lastMedia=0,lastProgress=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function mark(){if(autoYear!==undefined){played.add(autoYear);rememberBirthday(storage,autoYear);}}
 function clearWatchdog(){if(watchdog!==undefined)clearTimeout(watchdog);watchdog=undefined;}
 function stopMedia(){clearWatchdog();audio.pause();audio.removeAttribute('src');audio.load();if(context?.state==='running')void context.suspend().catch(()=>{});}
 function close(skipped=true){if(closed)return;closed=true;token++;if(skipped)mark();running=false;opening=false;cancelAnimationFrame(frame);stopMedia();observer?.disconnect();observer=undefined;unsubscribe?.();unsubscribe=undefined;art?.dispose();art=undefined;dialog.close();onClose();previousFocus?.isConnected&&previousFocus.focus({preventScroll:true});update();}
 function complete(){if(closed||completed)return;completed=true;running=false;clock.time=BIRTHDAY_SECONDS;clock.pause();cancelAnimationFrame(frame);clearWatchdog();audio.pause();paint();dialog.dataset.complete='true';dialog.querySelector<HTMLElement>('.birthday-skip')!.textContent='Close';dialog.querySelector<HTMLElement>('.birthday-finished')!.hidden=false;status.textContent='Celebration complete.';dialog.querySelector<HTMLElement>('.birthday-skip')!.focus({preventScroll:true});}
 function paint(){if(!dialog.open||!art)return;const t=clock.time;dialog.dataset.elapsed=String(t);dialog.dataset.phase=birthdayPhase(t);dialog.querySelector<HTMLElement>('.birthday-banner-label')!.hidden=t<10;dialog.querySelector<HTMLElement>('.birthday-achievement')!.hidden=t<17;if(lastPhase!==birthdayPhase(t)){lastPhase=birthdayPhase(t);caption.textContent=birthdayCue(t);}art.render(t,reduced.matches);}
 function loop(now:number){if(closed||!running)return;
  if(!document.hidden){const mediaTime=audio.currentTime*BIRTHDAY_SECONDS/(Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:20.76);clock.tick(mediaTime,now);
   if(!clock.silent){if(audio.currentTime!==lastMedia){lastMedia=audio.currentTime;lastProgress=now;}else if(now-lastProgress>5000){fallback('Birthday audio interrupted. Continuing silently.');}}
   paint();if(clock.time>=BIRTHDAY_SECONDS){complete();return;}}
  frame=requestAnimationFrame(loop);
 }
 function fallback(message:string){if(closed)return;token++;clearWatchdog();audio.pause();clock.fallback(performance.now());status.textContent=message;if(!running)begin(true);}
 function begin(silent:boolean){if(closed||running)return;clearWatchdog();clock.start(silent,performance.now());running=true;mark();start.hidden=true;lastProgress=performance.now();lastMedia=audio.currentTime;frame=requestAnimationFrame(loop);}
 async function play(){if(closed||running)return;const version=token;clearWatchdog();status.textContent='Starting birthday music…';start.hidden=true;
  try{
   if(!context){context=new AudioContext();gain=context.createGain();context.createMediaElementSource(audio).connect(gain);gain.connect(context.destination);}
   if(gain)gain.gain.value=gameAudio.music.volume;
   const resume=context.resume();const playback=audio.play();watchdog=setTimeout(()=>{if(version===token&&!running){audio.pause();start.hidden=false;status.textContent='Audio is taking too long. Retry, watch silently, or skip.';}},5000);
   await Promise.all([resume,playback]);if(version!==token)return;if(closed){audio.pause();return;}
   if(context.state!=='running'||document.hidden)throw Error('Audio needs a gesture');
   begin(false);status.textContent='Birthday music · synchronized to playback';
  }catch{if(version!==token||closed)return;clearWatchdog();audio.pause();start.hidden=false;status.textContent='Tap Start with audio to enable the song, watch silently, or skip.';}
 }
 async function open(automatic:boolean){
  if(opening||!canOpen()||dialog.open)return;opening=true;previousFocus=document.activeElement as HTMLElement;autoYear=automatic?new Date().getFullYear():undefined;
  const version=++token;closed=false;running=false;completed=false;delete dialog.dataset.complete;dialog.querySelector<HTMLElement>('.birthday-skip')!.textContent='Skip';dialog.querySelector<HTMLElement>('.birthday-finished')!.hidden=true;clock.time=0;lastPhase='';start.hidden=true;caption.textContent='Preparing a deeply embarrassing birthday…';status.textContent='Loading the party';
  try{onOpen();dialog.showModal();dialog.querySelector<HTMLElement>('.birthday-skip')!.focus({preventScroll:true});
   const {BirthdayArt}=await import('./birthday-art');if(version!==token)return;art=new BirthdayArt(canvas);
   const load=art.load();await Promise.race([load,new Promise((_,reject)=>{watchdog=setTimeout(()=>reject(Error('Art timeout')),6000);})]);clearWatchdog();if(version!==token)return;
   art.resize();observer=new ResizeObserver(()=>{art?.resize();paint();});observer.observe(canvas);paint();
   audio.src=new URL('./audio/birthday/happy-birthday-seth.mp3',document.baseURI).href;audio.currentTime=0;audio.muted=gameAudio.muted||!gameAudio.music.enabled;
   unsubscribe=gameAudio.music.subscribe(()=>{audio.muted=gameAudio.muted||!gameAudio.music.enabled;if(gain)gain.gain.value=gameAudio.music.volume;});
   opening=false;if(audio.muted){status.textContent='Sound or music is off. Playing silently.';begin(true);}else void play();
  }catch{if(version===token){close(false);/* No annual marker for a sequence that never loaded. */}}
 }
 audio.addEventListener('error',()=>{if(!closed&&!completed)fallback('Birthday music unavailable. Continuing silently.');});
 audio.addEventListener('ended',()=>{if(running){complete();}});
 dialog.querySelector('.birthday-again')!.addEventListener('click',()=>{if(closed||!completed)return;completed=false;clock.time=0;lastPhase='';delete dialog.dataset.complete;dialog.querySelector<HTMLElement>('.birthday-skip')!.textContent='Skip';dialog.querySelector<HTMLElement>('.birthday-finished')!.hidden=true;audio.currentTime=0;paint();if(audio.muted){status.textContent='Playing silently.';begin(true);}else void play();});
 dialog.querySelector('.birthday-skip')!.addEventListener('click',()=>close());dialog.querySelector('.birthday-audio')!.addEventListener('click',()=>void play());dialog.querySelector('.birthday-silent')!.addEventListener('click',()=>{token++;audio.pause();status.textContent='Playing silently.';begin(true);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});for(const type of ['keydown','keyup'])dialog.addEventListener(type,event=>event.stopPropagation());
 document.addEventListener('visibilitychange',()=>{if(closed||!running)return;if(document.hidden){clock.pause();audio.pause();}else{clock.resume(performance.now());lastProgress=performance.now();if(!clock.silent)void audio.play().catch(()=>fallback('Playback interrupted. Continuing silently.'));}});
 function update(){const date=new Date(),available=birthdayActive(date)||preview,safe=canOpen();for(const b of buttons)b.hidden=!available||!safe;
  const year=date.getFullYear(),due=preview||birthdayDue(storage,date);if(available&&safe&&!offered.has(year)&&!played.has(year)&&due&&!opening&&!dialog.open){offered.add(year);void open(!preview);}}
 const timer=setInterval(update,1000);window.addEventListener('game-startup',update);document.addEventListener('visibilitychange',update);update();
 // No work is registered outside the game; this timer only observes its open menu.
 return {get isOpen(){return dialog.open;},dispose(){clearInterval(timer);window.removeEventListener('game-startup',update);document.removeEventListener('visibilitychange',update);close(false);}};
}
