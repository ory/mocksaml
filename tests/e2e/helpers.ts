import saml from '@boxyhq/saml20';
import type { Page } from '@playwright/test';
import { idpCert, sp } from '../helpers';

export { buildAuthnRequest, sp } from '../helpers';

type AcsPost = { samlResponse: string; relayState: string | undefined };

// Stub the SP's ACS endpoint and capture what the browser posts to it.
export const captureAcsPost = async (page: Page) => {
  let resolve: (post: AcsPost) => void;
  const posted = new Promise<AcsPost>((r) => (resolve = r));

  await page.route(sp.acsUrl, (route) => {
    const params = new URLSearchParams(route.request().postData() ?? '');
    resolve({
      samlResponse: Buffer.from(params.get('SAMLResponse') ?? '', 'base64').toString('utf8'),
      relayState: params.get('RelayState') ?? undefined,
    });
    route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>ACS received</h1>' });
  });

  return posted;
};

export const validateResponse = (xml: string, options: { inResponseTo?: string; audience?: string } = {}) =>
  saml.validate(xml, { publicKey: idpCert, audience: sp.entityId, recipient: sp.acsUrl, ...options });
