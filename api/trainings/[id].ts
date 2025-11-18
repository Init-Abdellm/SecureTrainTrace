import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_lib/auth';
import { storage } from '../_lib/storage';
import { insertTrainingSchema } from '../../shared/schema';

async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const training = await storage.getTraining(id as string);
      if (!training) {
        return res.status(404).json({ message: 'Training not found' });
      }
      return res.json(training);
    } catch (error) {
      console.error('Error fetching training:', error);
      return res.status(500).json({ message: 'Failed to fetch training' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const validated = insertTrainingSchema.partial().parse(req.body);
      const training = await storage.updateTraining(id as string, validated);
      if (!training) {
        return res.status(404).json({ message: 'Training not found' });
      }
      return res.json(training);
    } catch (error: any) {
      console.error('Error updating training:', error);
      return res.status(400).json({ message: error.message || 'Failed to update training' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await storage.deleteTraining(id as string);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting training:', error);
      return res.status(500).json({ message: 'Failed to delete training' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default requireAuth(handler);
