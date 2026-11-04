import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasWildcard, isAllowedEmail, parseAllowedDomains } from 'lib/allowed-domains';

test('isAllowedEmail', () => {
  assert.equal(isAllowedEmail('a@example.com', ['example.com']), true);
  assert.equal(isAllowedEmail('a@x.ory.dev', ['*.ory.dev']), true);
  assert.equal(isAllowedEmail('a@ory.dev', ['*.ory.dev']), false);
  assert.equal(isAllowedEmail('a@EVIL.com', ['*']), true);
  assert.equal(isAllowedEmail('a@Example.COM', ['example.com']), true);
  assert.equal(isAllowedEmail('a@example.com.evil.io', ['example.com']), false);
  assert.equal(isAllowedEmail('no-at-sign', ['*']), false);
  assert.equal(isAllowedEmail('a@evilory.dev', ['*.ory.dev']), false);
  assert.equal(isAllowedEmail('a@b@example.com', ['example.com']), true);
  assert.equal(isAllowedEmail('a@example.org', ['example.com']), false);
});

test('parseAllowedDomains', () => {
  assert.deepEqual(parseAllowedDomains(undefined), ['example.com', 'example.org']);
  assert.deepEqual(parseAllowedDomains(' '), ['example.com', 'example.org']);
  assert.deepEqual(parseAllowedDomains('*.ory.dev, Example.com'), ['*.ory.dev', 'example.com']);
});

test('hasWildcard', () => {
  assert.equal(hasWildcard(['example.com']), false);
  assert.equal(hasWildcard(['example.com', '*.ory.dev']), true);
  assert.equal(hasWildcard(['*']), true);
});
