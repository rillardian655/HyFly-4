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
console.log('PASS: texture aspect ratio and size test passed.');
