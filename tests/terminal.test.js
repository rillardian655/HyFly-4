import assert from 'node:assert';

function parseCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  return {
    command: (parts[0] || '').toLowerCase(),
    args: parts.slice(1)
  };
}

const res = parseCommand('teleport kitchen 10');
assert.strictEqual(res.command, 'teleport');
assert.strictEqual(res.args.length, 2);
console.log('PASS: terminal command parser test passed.');
