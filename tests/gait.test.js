import assert from 'node:assert';

const TWO_PI = Math.PI * 2;
function getGaitPhases(cycle) {
  let tL = cycle % TWO_PI;
  if (tL < 0) tL += TWO_PI;
  const tR = (tL + Math.PI) % TWO_PI;
  return { tL, tR };
}

const p0 = getGaitPhases(0);
assert.strictEqual(p0.tL, 0);
assert.strictEqual(p0.tR, Math.PI);
console.log('PASS: gait cycle anti-phase test passed.');
