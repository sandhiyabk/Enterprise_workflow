import { Request, Response } from 'express';
import { StatsService } from '../services/statsService.js';

const statsService = new StatsService();

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
