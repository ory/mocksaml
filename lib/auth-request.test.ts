import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authRequestBody, defaultAudience } from './auth-request.ts';

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    data.append(name, value);
  }
  return data;
};

test('authRequestBody', () => {
  assert.deepEqual(
    authRequestBody(form({ username: 'typed-user', domain: 'example.org' }), {
      id: '_req',
      acsUrl: 'https://sp.example.com/acs',
      audience: 'https://sp.example.com',
      providerName: 'SP',
      relayState: 'state',
    }),
    {
      email: 'typed-user@example.org',
      id: '_req',
      audience: 'https://sp.example.com',
      acsUrl: 'https://sp.example.com/acs',
      providerName: 'SP',
      relayState: 'state',
    }
  );

  assert.deepEqual(
    authRequestBody(
      form({
        acsUrl: 'https://idp.example.com/acs',
        audience: 'https://idp.example.com',
        username: 'u',
        domain: 'example.com',
      }),
      {}
    ),
    {
      email: 'u@example.com',
      id: undefined,
      audience: 'https://idp.example.com',
      acsUrl: 'https://idp.example.com/acs',
      providerName: undefined,
      relayState: undefined,
    }
  );

  const withoutAudience = authRequestBody(form({ username: 'u', domain: 'example.com' }), {
    acsUrl: 'https://sp.example.com/acs',
  });
  assert.equal(withoutAudience.audience, defaultAudience);
  assert.equal(withoutAudience.acsUrl, 'https://sp.example.com/acs');
});
