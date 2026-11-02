import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import handler from 'pages/api/health';
import { version } from '../../package.json';
import { mockApi } from '../helpers';

describe('GET /api/health', () => {
  it('returns the package version', async () => {
    const { req, res } = mockApi({ method: 'GET' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 200);
    assert.deepEqual(res._getJSONData(), { version });
  });

  it('rejects other methods', async () => {
    const { req, res } = mockApi({ method: 'POST' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 503);
  });
});
