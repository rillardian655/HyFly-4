import assert from 'node:assert';

function checkOverlap(box, point, radius) {
  return (
    point.x + radius > box.min.x &&
    point.x - radius < box.min.x + (box.max.x - box.min.x) &&
    point.z + radius > box.min.z &&
    point.z - radius < box.min.z + (box.max.z - box.min.z)
  );
}

const wall = {
  min: { x: -9.2, z: -0.2 },
  max: { x: -8.8, z: 0.2 }
};

assert.strictEqual(checkOverlap(wall, { x: 0, z: 0 }, 0.38), false);
assert.strictEqual(checkOverlap(wall, { x: -8.9, z: 0 }, 0.38), true);
console.log('PASS: physics collision test passed.');
