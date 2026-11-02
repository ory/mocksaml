import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getEntityId, getSSOUrl } from 'lib/entity-id';

describe('entity-id', () => {
  it('returns the plain entity id and sso url without a namespace', () => {
    assert.equal(getEntityId('https://idp.test/entityid', undefined), 'https://idp.test/entityid');
    assert.equal(getSSOUrl('https://idp.test', undefined), 'https://idp.test/api/saml/sso');
  });

  it('scopes the entity id and sso url to a namespace', () => {
    assert.equal(getEntityId('https://idp.test/entityid', 'acme'), 'https://idp.test/entityid/acme');
    assert.equal(getSSOUrl('https://idp.test', 'acme'), 'https://idp.test/api/namespace/acme/saml/sso');
  });
});
