import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readScores, saveScore, SCORE_KEY } from '../src/scores.mjs';
import { readPreferences, savePreferences, PREFERENCES_KEY } from '../src/preferences.mjs';

test('new game reads and writes its own records without importing or overwriting Seth Happens', () => {
  const original = new Map([
    ['seth-happens-scores-v1', 'original records remain untouched'],
    ['seth-happens.preferences.v1', JSON.stringify({ volume: .13, track: 4 })],
    ['seth-touch-controls', JSON.stringify({ style: 'stick', spacing: 5 })],
  ]);
  const data = new Map(original);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.deepEqual(readScores(storage), []);
  assert.equal(readPreferences(storage).volume, .75);
  saveScore(storage, { id: 'new-game', name: 'TEST', score: 2000, date: '2026-10-28T18:00:00Z', falls: 0, squishes: 0, bumps: 0, photos: 2, latePhotos: 0, beer: true });
  assert.equal(savePreferences(storage, { muted: true, musicEnabled: false }), true);
  assert.equal(readScores(storage)[0].id, 'new-game');
  assert.equal(readPreferences(storage).muted, true);
  assert.equal(data.has(SCORE_KEY), true);
  assert.equal(data.has(PREFERENCES_KEY), true);
  for (const [key, value] of original) assert.equal(data.get(key), value);
});
