const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTeamId } = require('../controllers/teamController');

test('normalizeTeamId converts plain numbers to TEAM-<number>', () => {
  assert.equal(normalizeTeamId('1234'), 'TEAM-1234');
});

test('normalizeTeamId keeps TEAM-<number> format unchanged', () => {
  assert.equal(normalizeTeamId('TEAM-5678'), 'TEAM-5678');
});

test('normalizeTeamId rejects empty input', () => {
  assert.equal(normalizeTeamId('   '), '');
});
