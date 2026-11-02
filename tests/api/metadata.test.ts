import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import saml from '@boxyhq/saml20';
import handler from 'pages/api/saml/metadata';
import { idpCert, mockApi } from '../helpers';

describe('GET /api/saml/metadata', () => {
  it('serves IdP metadata that saml20 can parse', async () => {
    const { req, res } = mockApi({ method: 'GET' });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 200);
    assert.equal(res.getHeader('content-type'), 'text/xml');
    assert.equal(res.getHeader('content-disposition'), undefined);

    const parsed = await saml.parseMetadata(res._getData());
    assert.equal(parsed.entityID, 'https://idp.test/entityid');
    assert.equal(parsed.sso.redirectUrl, 'https://idp.test/api/saml/sso');
    assert.equal(parsed.sso.postUrl, 'https://idp.test/api/saml/sso');
    assert.equal(parsed.publicKey, saml.stripCertHeaderAndFooter(idpCert));
    assert.match(res._getData(), /WantAuthnRequestsSigned="false"/);
  });

  it('scopes entity id and sso url to the namespace', async () => {
    const { req, res } = mockApi({ method: 'GET', query: { namespace: 'acme' } });
    await handler(req, res);

    const parsed = await saml.parseMetadata(res._getData());
    assert.equal(parsed.entityID, 'https://idp.test/entityid/acme');
    assert.equal(parsed.sso.postUrl, 'https://idp.test/api/namespace/acme/saml/sso');
  });

  it('sets a download disposition when ?download is present', async () => {
    const { req, res } = mockApi({ method: 'GET', query: { download: '', namespace: 'acme' } });
    await handler(req, res);

    assert.equal(res._getStatusCode(), 200);
    assert.equal(res.getHeader('content-disposition'), 'attachment; filename="mock-saml-metadata-acme.xml"');
    assert.ok(await saml.parseMetadata(res._getData()));
  });

  it('still downloads with ?download=true', async () => {
    const { req, res } = mockApi({ method: 'GET', query: { download: 'true' } });
    await handler(req, res);

    assert.equal(res.getHeader('content-disposition'), 'attachment; filename="mock-saml-metadata.xml"');
  });

  it('rejects an invalid namespace', async () => {
    const { req, res } = mockApi({ method: 'GET', query: { namespace: 'a/b' } });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 400);
  });

  it('rejects other methods', async () => {
    const { req, res } = mockApi({ method: 'POST' });
    await handler(req, res);
    assert.equal(res._getStatusCode(), 405);
  });
});
