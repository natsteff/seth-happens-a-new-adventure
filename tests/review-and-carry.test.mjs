import test from 'node:test';import assert from 'node:assert/strict';
import {localReviewLevel,canEnterLevel} from '../src/review-entry.mjs';
import {LEVEL_ORDER,createLevelProgress} from '../src/progression.mjs';
import {carryAnchor} from '../src/carry-anchor.mjs';
test('hidden owner review opens every implemented level without fabricated completions',()=>{
 const mode=localReviewLevel({dev:false,hostname:'natsteff.github.io',search:'?review=backstage&level=haunted'});
 assert.equal(mode,'all');const p=createLevelProgress(null);
 for(const level of LEVEL_ORDER)assert.equal(canEnterLevel(level,p.canPlay,mode),true);
 assert.equal(canEnterLevel('not-a-level',p.canPlay,mode),false);
 assert.equal(p.canPlay('thai'),false);
 assert.equal(localReviewLevel({dev:false,hostname:'natsteff.github.io',search:'?review=cabin'}),null);
 assert.equal(canEnterLevel('thai',p.canPlay,null),false);
});
test('item handle follows raised falling palms and mirrors at every frame',()=>{
 for(let frame=0;frame<4;frame++){
  const args={x:400,bottom:510,frame};
  const idle=carryAnchor(args),fall=carryAnchor({...args,falling:true});
  assert.ok(fall.y<idle.y-20);
  const left=carryAnchor({...args,falling:true,facing:-1});
  assert.equal(left.y,fall.y);assert.equal(left.x-400,400-fall.x);
 }
});

test('public production ignores all review bypasses; local development remains available',()=>{for(const search of ['?review=all','?review=cabin','?level=encore&review=all'])assert.equal(localReviewLevel({dev:false,hostname:'natsteff.github.io',search}),null);assert.equal(localReviewLevel({dev:true,hostname:'127.0.0.1',search:'?review=all'}),'all');assert.equal(localReviewLevel({dev:false,hostname:'natsteff.github.io',search:''}),null);});

test('owner-selected hidden live URL enables isolated review without exposing the ordinary public bypass',()=>{assert.equal(localReviewLevel({dev:false,hostname:'natsteff.github.io',search:'?review=backstage&level=encore'}),'all');assert.equal(localReviewLevel({dev:false,hostname:'natsteff.github.io',search:'?review=all&level=encore'}),null);});
