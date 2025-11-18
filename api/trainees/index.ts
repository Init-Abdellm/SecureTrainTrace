import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const trainees = await storage.getAllTrainees();
      return res.json(trainees);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      return res.status(500).json({ message: 'Failed to fetch trainees' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default requireAuth(handler);
