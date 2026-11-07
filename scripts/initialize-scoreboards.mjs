/** Uses the web SDK and deployed rules, never Admin privileges. */
import {readFile} from 'node:fs/promises';
import {FirebaseScores} from '../src/firebase-scores.ts';
import {LEVELS} from '../src/online-score-model.mjs';
const {firebase}=JSON.parse(await readFile(new URL('../public/game-config.json',import.meta.url)));
if(process.argv[2]!=='--project=seth-happens-2'||firebase.projectId!=='seth-happens-2')throw Error('Explicit --project=seth-happens-2 required.');
const client=new FirebaseScores(firebase);
try{for(const level of LEVELS){await client.initialize(level);console.log(`Ready: ${level}`);}}finally{await client.dispose();}
