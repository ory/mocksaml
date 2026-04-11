import type { NextApiRequest, NextApiResponse } from 'next';
import { authCodes, accessTokens, refreshTokens, generateToken } from '../../../../lib/cigna-auth0/store';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // app-gateway's buildUrl() puts all params in the query string
  const grant_type = (req.query.grant_type || req.body?.grant_type) as string;
  const code = (req.query.code || req.body?.code) as string;
  const refresh_token = (req.query.refresh_token || req.body?.refresh_token) as string;

  console.log('[mock-cigna-auth0] POST /oauth/token', {
    grant_type,
    code: code ? `${code.slice(0, 8)}...` : undefined,
    refresh_token: refresh_token ? `${refresh_token.slice(0, 12)}...` : undefined,
    query_keys: Object.keys(req.query),
    body_keys: req.body ? Object.keys(req.body) : [],
  });

  if (grant_type === 'authorization_code') {
    const authCode = authCodes.get(code);
    if (!authCode || authCode.expiresAt < Date.now()) {
      authCodes.delete(code);
      console.log('[mock-cigna-auth0] Token exchange failed: invalid/expired code');
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid or expired authorization code',
      });
    }
    authCodes.delete(code);

    const at = generateToken('at');
    const rt = generateToken('rt');
    accessTokens.set(at, {
      userId: authCode.userId,
      expiresAt: Date.now() + 3600 * 1000,
    });
    refreshTokens.set(rt, { userId: authCode.userId });

    console.log('[mock-cigna-auth0] Token exchange success for user:', authCode.userId);
    return res.json({
      access_token: at,
      refresh_token: rt,
      id_token: generateToken('id'),
      expires_in: 3600,
      token_type: 'Bearer',
    });
  }

  if (grant_type === 'refresh_token') {
    const stored = refreshTokens.get(refresh_token);
    if (!stored) {
      console.log('[mock-cigna-auth0] Refresh failed: invalid token');
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid refresh token',
      });
    }

    const at = generateToken('at');
    const newRt = generateToken('rt');
    accessTokens.set(at, {
      userId: stored.userId,
      expiresAt: Date.now() + 3600 * 1000,
    });
    refreshTokens.delete(refresh_token);
    refreshTokens.set(newRt, { userId: stored.userId });

    console.log('[mock-cigna-auth0] Token refresh success for user:', stored.userId);
    return res.json({
      access_token: at,
      refresh_token: newRt,
      id_token: generateToken('id'),
      expires_in: 3600,
      token_type: 'Bearer',
    });
  }

  console.log('[mock-cigna-auth0] Unsupported grant_type:', grant_type);
  return res.status(400).json({ error: 'unsupported_grant_type' });
}
