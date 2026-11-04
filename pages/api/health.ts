import type { NextApiRequest, NextApiResponse } from 'next';
import { version } from '../../package.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  res.json({ version });
}
