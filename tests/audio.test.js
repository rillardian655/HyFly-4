import assert from 'node:assert';

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

assert(Math.abs(midiToFreq(69) - 440.0) < 0.001);
assert(Math.abs(midiToFreq(60) - 261.63) < 0.05);
console.log('PASS: audio frequency calculation test passed.');
