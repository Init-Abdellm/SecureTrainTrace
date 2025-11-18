import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';
import { insertTrainingSchema } from '../../shared/schema.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const trainings = await storage.getAllTrainings();
      return res.json(trainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      return res.status(500).json({ message: 'Failed to fetch trainings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const validated = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(validated);
      return res.json(training);
    } catch (error: any) {
      console.error('Error creating training:', error);
      return res.status(400).json({ message: error.message || 'Failed to create training' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default requireAuth(handler);
