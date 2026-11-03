import { createHash } from 'crypto';
import config from 'lib/env';
import type { NextApiRequest, NextApiResponse } from 'next';
import saml from '@boxyhq/saml20';
import { isAllowedEmail } from 'lib/allowed-domains';
import { getEntityId, parseNamespace } from 'lib/namespace';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const parsed = parseNamespace(req.query);
    if (!parsed.ok) {
      return res.status(400).send('Invalid namespace');
    }

    const { username, domain, audience, acsUrl, id, relayState } = req.body;
    const email: unknown = req.body.email ?? (username && domain ? `${username}@${domain}` : undefined);

    if (typeof email !== 'string' || !email) {
      return res.status(400).send('email is required');
    }

    if (!isAllowedEmail(email, config.allowedEmailDomains)) {
      return res.status(403).send(`Only ${config.allowedEmailDomains.join(', ')} emails are allowed`);
    }

    const userId = createHash('sha256').update(email).digest('hex');
    const userName = email.split('@')[0];

    const user: User = {
      id: userId,
      email,
      firstName: userName,
      lastName: userName,
    };

    const xmlSigned = await saml.createSAMLResponse({
      issuer: getEntityId(config.entityId, parsed.namespace),
      audience,
      acsUrl,
      requestId: id,
      claims: {
        email: user.email,
        raw: user,
      },
      privateKey: config.privateKey,
      publicKey: config.publicKey,
    });

    const encodedSamlResponse = Buffer.from(xmlSigned).toString('base64');
    const html = saml.createPostForm(acsUrl, [
      ...(relayState ? [{ name: 'RelayState', value: relayState }] : []),
      { name: 'SAMLResponse', value: encodedSamlResponse },
    ]);

    res.send(html);
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}
