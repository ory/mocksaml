import type { NextApiRequest, NextApiResponse } from 'next';
import saml from '@boxyhq/saml20';

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  switch (req.method) {
    case 'GET':
      return await processSAMLRequest(req, res, false);
    case 'POST':
      return await processSAMLRequest(req, res, true);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function processSAMLRequest(req: NextApiRequest, res: NextApiResponse, isPost: boolean) {
  let samlRequest, relayState, isDeflated;

  if (isPost) {
    relayState = req.body.RelayState;
    samlRequest = req.body.SAMLRequest;
    isDeflated = false;
  } else {
    relayState = req.query.RelayState;
    samlRequest = req.query.SAMLRequest;
    // sigAlg = req.query.SigAlg;
    // signature = req.query.Signature;

    isDeflated = true;
  }

  try {
    const rawRequest = await saml.decodeBase64(samlRequest, isDeflated);

    const { id, audience, acsUrl, providerName, publicKey } = await saml.parseSAMLRequest(rawRequest, isPost);

    if (isPost) {
      if (!saml.validateSignature(rawRequest, publicKey, null)) {
        throw new Error('Invalid signature');
      }
    }

    const params = new URLSearchParams({ id, audience, acsUrl, providerName, relayState });

    const loginUrl = (req.query.namespace ? `/namespace/${req.query.namespace}` : '') + '/saml/login';

    res.redirect(302, `${loginUrl}?${params.toString()}`);
  } catch (err) {
    console.error(err);

    res.status(500).send(`${err}`);
  }
}
