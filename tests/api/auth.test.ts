import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import saml from '@boxyhq/saml20';
import handler from 'pages/api/saml/auth';
import { extractRelayState, extractSamlResponse, idpCert, mockApi, sp } from '../helpers';

const login = (body: Record<string, unknown>, query: Record<string, string> = {}) =>
  mockApi({
    method: 'POST',
    body: { audience: sp.entityId, acsUrl: sp.acsUrl, id: 'req-1', ...body },
    query,
  });

describe('POST /api/saml/auth', () => {
  it('returns an auto-post form with a signed SAML response', async () => {
    const { req, res } = login({ email: 'jackson@example.com', relayState: 'state-789' });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 200);
    const html = res._getData();
    assert.match(html, new RegExp(`action="${sp.acsUrl}"`));
    assert.equal(extractRelayState(html), 'state-789');

    const profile = await saml.validate(extractSamlResponse(html), {
      publicKey: idpCert,
      audience: sp.entityId,
      inResponseTo: 'req-1',
      recipient: sp.acsUrl,
    });
    assert.equal(profile.issuer, 'https://idp.test/entityid');
    assert.equal(profile.claims.email, 'jackson@example.com');
    assert.equal(profile.claims.firstName, 'jackson');
    assert.match(profile.claims.id, /^[a-f0-9]{64}$/);
  });

  it('accepts username and domain from the login form', async () => {
    const { req, res } = login({ username: 'alice', domain: 'example.org' });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 200);
    const profile = await saml.validate(extractSamlResponse(res._getData()), {
      publicKey: idpCert,
      audience: sp.entityId,
    });
    assert.equal(profile.claims.email, 'alice@example.org');
  });

  it('omits RelayState from the form when there is none', async () => {
    const { req, res } = login({ email: 'jackson@example.com' });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 200);
    assert.doesNotMatch(res._getData(), /RelayState/);
  });

  it('uses the namespaced issuer', async () => {
    const { req, res } = login({ email: 'jackson@example.org' }, { namespace: 'acme' });
    await handler(req, res);

    const profile = await saml.validate(extractSamlResponse(res._getData()), {
      publicKey: idpCert,
      audience: sp.entityId,
    });
    assert.equal(profile.issuer, 'https://idp.test/entityid/acme');
  });

  it('denies emails outside example.com / example.org', async () => {
    const { req, res } = login({ email: 'jackson@evil.com' });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 403);
    assert.doesNotMatch(res._getData(), /SAMLResponse|evil\.com/);
  });

  it('returns 400 when email is missing', async () => {
    const { req, res } = login({});
    await handler(req, res);

    assert.equal(res._getStatusCode(), 400);
    assert.doesNotMatch(res._getData(), /SAMLResponse/);
  });

  it('rejects an invalid namespace', async () => {
    const { req, res } = login({ email: 'jackson@example.com' }, { namespace: '../x' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 400);
    assert.doesNotMatch(res._getData(), /SAMLResponse/);
  });

  it('rejects other methods', async () => {
    const { req, res } = mockApi({ method: 'GET' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 405);
  });
});
