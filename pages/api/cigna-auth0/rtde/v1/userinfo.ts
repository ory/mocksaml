import type { NextApiRequest, NextApiResponse } from 'next';
import { requireBearer } from '../../../../../lib/cigna-auth0/middleware';
import { TEST_USERS } from '../../../../../lib/cigna-auth0/test-users';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bearer = requireBearer(req, res);
  if (!bearer) return;

  const user = TEST_USERS[bearer.userId];
  const now = new Date();
  const timestamp = [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getFullYear()).slice(-2),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const uniqueEmail = user.email.replace('@', `+${timestamp}@`);
  const responseData = {
    sub: user.sub,
    name: bearer.userId,
    given_name: user.given_name,
    family_name: user.family_name,
    email: uniqueEmail,
    birthdate: user.birthdate,
    gender: user.gender,
    updated_at: new Date().toISOString(),
    eligibility: { products: user.products },
    plan_sponsor: { id: user.employer_id, name: user.employer_name },
  };

  console.log('[mock-cigna-auth0] GET /rtde/v1/userinfo', {
    userId: bearer.userId,
    response: responseData,
  });
  return res.json(responseData);
}
