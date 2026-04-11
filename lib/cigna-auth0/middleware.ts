import type { NextApiRequest, NextApiResponse } from 'next';
import { accessTokens } from './store';

interface BearerResult {
  userId: string;
}

/**
 * Validates the Bearer token from the Authorization header.
 * Returns the userId if valid, or sends a 401 response and returns null.
 */
export function requireBearer(req: NextApiRequest, res: NextApiResponse): BearerResult | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({
      errors: [{ message: 'Missing or invalid Authorization header' }],
    });
    return null;
  }

  const token = auth.slice(7);
  const stored = accessTokens.get(token);

  if (!stored || stored.expiresAt < Date.now()) {
    accessTokens.delete(token);
    res.status(401).json({
      errors: [{ message: 'Token expired or invalid' }],
    });
    return null;
  }

  return { userId: stored.userId };
}
