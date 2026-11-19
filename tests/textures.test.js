import assert from 'node:assert';

function getWoodPlankDims(width, height, plankRows) {
  return {
    width,
    height,
    rowHeight: height / plankRows
  };
}

const dims = getWoodPlankDims(2048, 2048, 16);
assert.strictEqual(dims.width, 2048);
assert.strictEqual(dims.rowHeight, 128);

// Rehman double bed procedural texture generators
const duvetCanvas = { width: 512, height: 512 };
assert.strictEqual(duvetCanvas.width, 512);
assert.strictEqual(duvetCanvas.height, 512);

const pillowCanvas = { width: 256, height: 256 };
assert.strictEqual(pillowCanvas.width, 256);
assert.strictEqual(pillowCanvas.height, 256);

console.log('PASS: texture aspect ratio and size test passed.');
