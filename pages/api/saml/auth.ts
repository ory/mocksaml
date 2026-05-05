import { createHash } from 'crypto';
import config from 'lib/env';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { User } from 'types';
import saml from '@boxyhq/saml20';
import { getEntityId } from 'lib/entity-id';

function resolveTemplate(template: string, user: User): string {
  return template
    .replace(/\{id\}/g, () => user.id)
    .replace(/\{email\}/g, () => user.email)
    .replace(/\{firstName\}/g, () => user.firstName)
    .replace(/\{lastName\}/g, () => user.lastName);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, audience, acsUrl, id, relayState, attributes } = req.body;

    if (!email.endsWith('@example.com') && !email.endsWith('@example.org')) {
      res.status(403).send(`${email} denied access`);
      return;
    }

    const userId = createHash('sha256').update(email).digest('hex');
    const userName = email.split('@')[0];

    const user: User = {
      id: userId,
      email,
      firstName: userName,
      lastName: userName,
    };

    const extraClaims: Record<string, string> = {};
    if (Array.isArray(attributes)) {
      for (const entry of attributes) {
        if (!entry || typeof entry !== 'object') continue;
        const { name, value } = entry as { name?: unknown; value?: unknown };
        if (typeof name === 'string' && name)
          extraClaims[name] = resolveTemplate(typeof value === 'string' ? value : '', user);
      }
    } else {
      for (const [name, template] of Object.entries(config.extraAttributes)) {
        extraClaims[name] = resolveTemplate(template, user);
      }
    }

    const xmlSigned = await saml.createSAMLResponse({
      issuer: getEntityId(config.entityId, req.query.namespace as any),
      audience,
      acsUrl,
      requestId: id,
      claims: {
        email: user.email,
        raw: { ...user, ...extraClaims },
      },
      privateKey: config.privateKey,
      publicKey: config.publicKey,
    });

    const encodedSamlResponse = Buffer.from(xmlSigned).toString('base64');
    const html = saml.createPostForm(acsUrl, [
      {
        name: 'RelayState',
        value: relayState,
      },
      {
        name: 'SAMLResponse',
        value: encodedSamlResponse,
      },
    ]);

    res.send(html);
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}
