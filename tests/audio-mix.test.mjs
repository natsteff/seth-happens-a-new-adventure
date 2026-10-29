import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const url=name=>new URL(`../src/${name}`,import.meta.url).href;
const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const music=data(stripTypeScriptTypes(readFileSync(new URL('../src/music.ts',import.meta.url),'utf8')).replace("'./radio-playlist.mjs'",JSON.stringify(url('radio-playlist.mjs'))).replace("'./preferences.mjs'",JSON.stringify(url('preferences.mjs'))));
const clips=data(stripTypeScriptTypes(readFileSync(new URL('../src/voice-clips.ts',import.meta.url),'utf8')).replace('import.meta.env.BASE_URL',JSON.stringify('/')));
const source=stripTypeScriptTypes(readFileSync(new URL('../src/audio.ts',import.meta.url),'utf8')).replace("'./music'",JSON.stringify(music)).replace("'./voice-clips'",JSON.stringify(clips)).replace("'./preferences.mjs'",JSON.stringify(url('preferences.mjs')));
const gains=[],sources=[];let starts=0;
const param=()=>({value:0,writes:[],setValueAtTime(v){this.value=v;this.writes.push(v);},setTargetAtTime(v){this.value=v;this.writes.push(v);},linearRampToValueAtTime(v){this.writes.push(v);},exponentialRampToValueAtTime(v){this.writes.push(v);},cancelScheduledValues(){}});
const node=()=>({connect(){},disconnect(){},start(){starts++;},stop(){}});
globalThis.window={};globalThis.document={baseURI:'http://localhost/',getElementById:()=>null,createElement:()=>({paused:true,currentTime:0,addEventListener(){},pause(){this.paused=true;},play(){this.paused=false;return Promise.resolve();}})};
globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>({url})});
globalThis.AudioContext=class{
 state='running';currentTime=0;sampleRate=44100;destination={};
 createGain(){const result={...node(),gain:param()};gains.push(result);return result;}
 createBuffer(){return {getChannelData:()=>new Float32Array(6615)};}
 createMediaElementSource(){return node();}createBufferSource(){const source={...node(),playbackRate:{value:1}};sources.push(source);return source;}
 createOscillator(){return {...node(),frequency:param()};}
 async decodeAudioData(data){return {duration:1,url:data.url};}async resume(){this.state='running';}async suspend(){this.state='suspended';}
};
test('real effect/voice/location paths never automate music or master gain or pause its playback',async()=>{
 const {gameAudio}=await import(data(source));await gameAudio.unlock();gameAudio.music.setVolume(.67);gameAudio.music.startRun();await Promise.resolve();
 const master=gains[0].gain,musicGain=gains[1].gain,snapshot=[master.value,musicGain.value,master.writes.length,musicGain.writes.length];
 for(const cue of ['jump','photo','pickup','impact','miss','piano','clown','timer'])gameAudio.play(cue);
 gameAudio.speak('Test','fall');gameAudio.playLocation('soccer');
 assert.ok(starts>8);assert.equal(gameAudio.music.audio.paused,false);
 assert.deepEqual([master.value,musicGain.value,master.writes.length,musicGain.writes.length],snapshot);
 assert.equal(musicGain.value,.67);
});


test('Mega Jump uses the new WAV, old boing is absent, and approved collision priorities remain',async()=>{
 const {recordedClips}=await import(clips);assert.equal('boing' in recordedClips,false);assert.ok(!Object.values(recordedClips).some(url=>url.includes('spring-boing')));
 const {gameAudio}=await import(data(source));await gameAudio.unlock();gameAudio.beginRun();
 gameAudio.speak('Mega jump','mega');assert.match(sources.at(-1).buffer.url,/mega-jump-v2\.wav$/);
 gameAudio.speak('Ugh!','grunt');assert.match(sources.at(-1).buffer.url,/grunt\.wav$/);
 const count=sources.length;gameAudio.speak('Mega jump','mega');assert.equal(sources.length,count,'jump must not interrupt a collision reaction');
 gameAudio.toggle();gameAudio.speak('Mega jump','mega');assert.equal(sources.length,count,'muted jumps must stay silent');
 gameAudio.toggle();gameAudio.beginRun();gameAudio.speak('Mega jump','mega');assert.match(sources.at(-1).buffer.url,/mega-jump-v2\.wav$/);
});
