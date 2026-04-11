import type { NextApiRequest, NextApiResponse } from 'next';
import { TEST_USERS } from '../../../../lib/cigna-auth0/test-users';
import { authCodes, generateAuthCode } from '../../../../lib/cigna-auth0/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, redirect_uri, state } = req.body;
  const user = TEST_USERS[username];

  console.log('[mock-cigna-auth0] POST /authorize/callback', {
    username,
    redirect_uri,
    state,
  });

  if (!user || user.password !== password) {
    console.log('[mock-cigna-auth0] Auth failed for user:', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const code = generateAuthCode();
  authCodes.set(code, {
    userId: username,
    redirectUri: redirect_uri,
    state,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const separator = redirect_uri.includes('?') ? '&' : '?';
  const redirectUrl = `${redirect_uri}${separator}code=${code}&state=${state}`;

  console.log('[mock-cigna-auth0] Auth success, code issued for:', username);
  return res.status(200).json({ redirectUrl });
}
