import type { NextApiRequest, NextApiResponse } from 'next';
import { requireBearer } from '../../../../../lib/cigna-auth0/middleware';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bearer = requireBearer(req, res);
  if (!bearer) return;

  console.log('[mock-cigna-auth0] GET /rtde/v1/biometrics', { userId: bearer.userId });
  return res.json({ result: [] });
}
