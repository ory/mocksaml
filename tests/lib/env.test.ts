import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import config from 'lib/env';

// lib/env reads process.env at import time, so url fallbacks are checked in a child process.
const appUrlWith = (env: Record<string, string>) =>
  execFileSync(
    process.execPath,
    ['--import', 'tsx', '-e', "import('./lib/env.ts').then((m) => process.stdout.write(m.default.appUrl))"],
    { env: { ...process.env, APP_URL: '', VERCEL_BRANCH_URL: '', VERCEL_PROJECT_PRODUCTION_URL: '', ...env } }
  ).toString();

describe('env', () => {
  it('decodes the base64 key pair', () => {
    assert.match(config.publicKey, /BEGIN CERTIFICATE/);
    assert.match(config.privateKey, /PRIVATE KEY/);
  });

  it('prefers APP_URL', () => {
    assert.equal(
      appUrlWith({ APP_URL: 'https://explicit.test', VERCEL_BRANCH_URL: 'branch.vercel.app' }),
      'https://explicit.test'
    );
  });

  it('falls back to the Vercel url', () => {
    assert.equal(appUrlWith({ VERCEL_BRANCH_URL: 'branch.vercel.app' }), 'https://branch.vercel.app');
  });

  it('falls back to localhost when nothing is set', () => {
    assert.equal(appUrlWith({}), 'http://localhost:4000');
  });
});
