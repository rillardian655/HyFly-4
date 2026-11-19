import assert from 'node:assert';

function getGardenTerraceBounds() {
  return { minX: 14, maxX: 22, minZ: -14, maxZ: 0 };
}

const b = getGardenTerraceBounds();
assert.strictEqual(b.maxX - b.minX, 8);
assert.strictEqual(b.maxZ - b.minZ, 14);
console.log('PASS: garden zone bounds test passed.');
