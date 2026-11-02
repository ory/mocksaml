import { readFileSync } from 'fs';
import { join } from 'path';
import { deflateRawSync } from 'zlib';
import saml from '@boxyhq/saml20';
import { createMocks, type RequestOptions } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures', name), 'utf8');

export const idpCert = fixture('idp-cert.pem');
export const spKey = fixture('sp-key.pem');
export const spCert = fixture('sp-cert.pem');

export const sp = {
  entityId: 'https://sp.test/entityid',
  acsUrl: 'https://sp.test/acs',
};

export const mockApi = (options: RequestOptions) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>(options);
  return { req, res };
};

export const buildAuthnRequest = (opts: { signed?: boolean; providerName?: string } = {}) => {
  const { id, request } = saml.request({
    ssoUrl: 'https://idp.test/api/saml/sso',
    entityID: sp.entityId,
    callbackUrl: sp.acsUrl,
    providerName: opts.providerName,
    signingKey: opts.signed === false ? '' : spKey,
    publicKey: opts.signed === false ? '' : spCert,
  });

  return {
    id,
    xml: request,
    post: Buffer.from(request).toString('base64'),
    redirect: deflateRawSync(request).toString('base64'),
  };
};

export const extractSamlResponse = (html: string) => {
  const match = html.match(/name="SAMLResponse"\s+value="([^"]+)"/);
  if (!match) throw new Error('No SAMLResponse in form');
  return Buffer.from(match[1], 'base64').toString('utf8');
};

export const extractRelayState = (html: string) => {
  const match = html.match(/name="RelayState"\s+value="([^"]*)"/);
  return match ? match[1] : undefined;
};
