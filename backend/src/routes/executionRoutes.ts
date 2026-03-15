import { Router } from 'express';
import * as executionController from '../controllers/executionController.js';

const router = Router();

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/logs', executionController.getExecutionLogs);
router.post('/:id/cancel', executionController.cancelExecution);
router.post('/:id/retry', executionController.retryExecution);
router.post('/:id/approve', executionController.approveStep);

export default router;
