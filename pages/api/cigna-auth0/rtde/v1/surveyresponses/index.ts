import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { requireBearer } from '../../../../../../lib/cigna-auth0/middleware';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bearer = requireBearer(req, res);
  if (!bearer) return;

  const id = crypto.randomBytes(12).toString('hex');
  const responseData = {
    result: {
      id,
      surveyId: req.body.surveyId,
      status: 'incomplete',
      answers: req.body.answers,
    },
  };

  console.log('[mock-cigna-auth0] POST /rtde/v1/surveyresponses', {
    userId: bearer.userId,
    request: { surveyId: req.body.surveyId, answers: req.body.answers },
    response: responseData,
  });
  return res.json(responseData);
}
