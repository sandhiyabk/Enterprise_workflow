import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';

const router = Router();

router.get('/:userId', (req, res) => notificationController.getNotifications(req, res));

export default router;
