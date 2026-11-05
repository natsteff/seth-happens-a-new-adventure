/** Owner-provided local WAV recordings. Originals remain untouched in Downloads. */
export type VoiceReaction = 'grunt' | 'mega' | 'fall' | 'person' | 'beer' | 'start' | 'win' | 'ouch' | 'ahh' | 'hero' | 'squish' | 'quick' | 'cheater';
export type LocationCue = 'soccer' | 'concert' | 'jet' | 'goal' | 'crashing' | 'elevator' | 'truck-splat' | 'press-pass' | 'checkpoint-bell' | 'mind-the-gap' | 'attic-key' | 'smash-zombies';
export type AudioClip = VoiceReaction | LocationCue;
const base = `${import.meta.env.BASE_URL}audio/`;
export const voiceClips: Record<VoiceReaction,string> = {
  quick: `${base}quick-jump.wav`,
  cheater: `${base}cheater.wav`,
  grunt: `${base}grunt.wav`,
  mega: `${base}mega-jump-v2.wav`,
  fall: `${base}fall.wav`,
  person: `${base}person.wav`,
  beer: `${base}beer.wav`,
  start: `${base}start.wav`,
  win: `${base}win.wav`,
  ouch: `${base}ouch.wav`,
  ahh: `${base}ahh.wav`,
  hero: `${base}hero.wav`,
  squish: `${base}squish.wav`,
};

export const locationClips: Record<LocationCue,string> = { 'attic-key': `${base}haunted-attic-key.wav`, 'smash-zombies': `${base}zombie-smash-zombies.wav`, 'press-pass': `${base}onto-the-pit.wav`, 'checkpoint-bell': `${base}haunted-checkpoint-bell.wav`, 'mind-the-gap': `${base}carnival-mind-the-gap.wav`, 'truck-splat':`${base}zombie-truck-splat.wav`, goal:`${base}goal.wav`, crashing:`${base}crashing.wav`, elevator:`${base}elevator.wav`, soccer:`${base}soccer.wav`, concert:`${base}concert.wav`, jet:`${base}jet.wav` };
export const recordedClips = { ...voiceClips, ...locationClips };
