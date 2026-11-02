import type { NextApiRequest, NextApiResponse } from 'next';
import saml from '@boxyhq/saml20';

import config from 'lib/env';
import { getEntityId, getSSOUrl } from 'lib/entity-id';

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const namespace = req.query.namespace as string | undefined;

  const xml = saml.createIdPMetadataXML({
    entityId: getEntityId(config.entityId, namespace),
    ssoUrl: getSSOUrl(config.appUrl, namespace),
    x509cert: saml.stripCertHeaderAndFooter(config.publicKey),
    wantAuthnRequestsSigned: true,
  });

  res.setHeader('Content-Type', 'text/xml');

  if ('download' in req.query) {
    const filename = 'mock-saml-metadata' + (namespace ? `-${namespace}` : '') + '.xml';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  res.send(xml);
}
