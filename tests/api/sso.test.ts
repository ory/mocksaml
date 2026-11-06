import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import handler from 'pages/api/saml/sso';
import { buildAuthnRequest, encode, mockApi, sp } from '../helpers';

const redirectParams = (res: ReturnType<typeof mockApi>['res']) => {
  const url = new URL(res._getRedirectUrl(), 'https://idp.test');
  return { path: url.pathname, params: url.searchParams };
};

describe('/api/saml/sso', () => {
  it('handles the redirect binding (GET, deflated)', async () => {
    const authn = buildAuthnRequest();
    const { req, res } = mockApi({
      method: 'GET',
      query: { SAMLRequest: authn.redirect, RelayState: 'state-123' },
    });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 302);
    const { path, params } = redirectParams(res);
    assert.equal(path, '/saml/login');
    assert.equal(params.get('id'), authn.id);
    assert.equal(params.get('acsUrl'), sp.acsUrl);
    assert.equal(params.get('audience'), sp.entityId);
    assert.equal(params.get('relayState'), 'state-123');
  });

  it('handles the POST binding with a signed request', async () => {
    const authn = buildAuthnRequest({ providerName: 'Acme' });
    const { req, res } = mockApi({
      method: 'POST',
      body: { SAMLRequest: authn.post, RelayState: 'state-456' },
    });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 302);
    const { params } = redirectParams(res);
    assert.equal(params.get('id'), authn.id);
    assert.equal(params.get('providerName'), 'Acme');
    assert.equal(params.get('relayState'), 'state-456');
  });

  it('accepts an unsigned POST request, as the metadata advertises', async () => {
    const authn = buildAuthnRequest({ signed: false });
    const { req, res } = mockApi({ method: 'POST', body: { SAMLRequest: authn.post } });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 302);
    assert.equal(redirectParams(res).params.get('id'), authn.id);
  });

  it('rejects a request whose signature does not verify', async () => {
    mock.method(console, 'error', () => {});
    const signed = buildAuthnRequest({ providerName: 'Acme' });
    const tampered = encode(signed.id, signed.xml.replace('ProviderName="Acme"', 'ProviderName="Mallory"'));

    for (const [method, options] of [
      ['POST', { body: { SAMLRequest: tampered.post } }],
      ['GET', { query: { SAMLRequest: tampered.redirect } }],
    ] as const) {
      const { req, res } = mockApi({ method, ...options });
      await handler(req, res);
      assert.equal(res._getStatusCode(), 400, method);
    }
  });

  it('rejects garbage without leaking the error', async () => {
    mock.method(console, 'error', () => {});
    const { req, res } = mockApi({ method: 'GET', query: { SAMLRequest: 'not-saml' } });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 400);
    assert.equal(res._getData(), 'Invalid SAML request');
  });

  it('redirects to the namespaced login page', async () => {
    const authn = buildAuthnRequest();
    const { req, res } = mockApi({
      method: 'GET',
      query: { SAMLRequest: authn.redirect, namespace: 'acme' },
    });
    await handler(req, res);

    assert.equal(redirectParams(res).path, '/namespace/acme/saml/login');
  });

  it('omits relayState from the redirect when the request has none', async () => {
    const authn = buildAuthnRequest();
    const { req, res } = mockApi({ method: 'GET', query: { SAMLRequest: authn.redirect } });
    await handler(req, res);

    assert.equal(redirectParams(res).params.has('relayState'), false);
  });

  it('omits providerName from the redirect when the request has none', async () => {
    const unsigned = buildAuthnRequest({ signed: false });
    const authn = encode(unsigned.id, unsigned.xml.replace(/ ProviderName="[^"]*"/, ''));
    assert.doesNotMatch(authn.xml, /ProviderName=/);
    const { req, res } = mockApi({ method: 'GET', query: { SAMLRequest: authn.redirect } });
    await handler(req, res);

    assert.equal(redirectParams(res).params.has('providerName'), false);
  });

  it('rejects an invalid namespace', async () => {
    const authn = buildAuthnRequest();
    const { req, res } = mockApi({
      method: 'GET',
      query: { SAMLRequest: authn.redirect, namespace: 'a b' },
    });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 400);
  });

  it('rejects other methods', async () => {
    const { req, res } = mockApi({ method: 'PUT' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 405);
  });
});
