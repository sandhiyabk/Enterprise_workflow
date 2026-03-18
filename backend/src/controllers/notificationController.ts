import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      const notifications = await notificationService.getUserNotifications(userId);
      res.json({ success: true, notifications });
    } catch (error: any) {
      logger.error(`Error in getNotifications: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const notificationController = new NotificationController();
