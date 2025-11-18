import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../_lib/auth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ isAuthenticated: checkAuth(req) });
}
