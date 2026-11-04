import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nameIdFor, parseNameIdFormat } from './name-id.ts';

const user = { id: 'f2a1c0de', email: 'jackson@example.com' };

test('parseNameIdFormat', () => {
  assert.equal(parseNameIdFormat(undefined), 'emailAddress');
  assert.equal(parseNameIdFormat(' '), 'emailAddress');
  assert.equal(parseNameIdFormat('emailAddress'), 'emailAddress');
  assert.equal(parseNameIdFormat(' persistent '), 'persistent');
  assert.throws(() => parseNameIdFormat('transient'), /emailAddress or persistent/);
  assert.throws(() => parseNameIdFormat('toString'), /emailAddress or persistent/);
});

test('nameIdFor', () => {
  assert.deepEqual(nameIdFor('emailAddress', user), {
    value: 'jackson@example.com',
    format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  });
  assert.deepEqual(nameIdFor('persistent', user), {
    value: 'f2a1c0de',
    format: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  });
});
